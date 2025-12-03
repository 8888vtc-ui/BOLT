import { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';

import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, WifiOff, Clock, User as UserIcon, Lightbulb, X, MessageCircle } from 'lucide-react';

import { useGameSocket } from '../hooks/useGameSocket';
import { useGameStore } from '../stores/gameStore';
import { INITIAL_BOARD } from '../lib/gameLogic';
import { useAuth } from '../hooks/useAuth';
import { useDoublingCube } from '../hooks/useDoublingCube';
import { analyzeMove, AIAnalysis } from '../lib/aiService';
import { useDebugStore } from '../stores/debugStore';
import { canOfferDouble, hasWon, checkWinType, PlayerColor, calculateMatchScore } from '../lib/gameLogic';
import { useDevice } from '../hooks/useDevice';
import { generateCoachVideo } from '../lib/heygenService';
import { formatScriptForPersonality, Personality } from '../lib/coachPersonalities';
import { showError, showInfo } from '../lib/notifications';


import ChatBox from '../components/game/ChatBox';
import DebugOverlay from '../components/DebugOverlay';
import BrowserConsole from '../components/BrowserConsole';
import WinModal from '../components/game/WinModal';
import TestPanel from '../components/TestPanel';
import BoardWrap from '../board/components/BoardWrap';
import { mapGameStateToBoardState } from '../board/utils/mappers';
import { Player, TimerState } from '../board/types';



const GameRoom = () => {
    const { roomId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { user, loading } = useAuth();
    const {
        isConnected,
        joinRoom,
        leaveRoom,
        sendGameAction,
        // handleCheckerClick, // Unused with new board
        // undoMove, // Unused with new board
        // canUndo // Unused with new board
    } = useGameSocket();

    const { currentRoom, gameState, players, messages, updateGame } = useGameStore();
    const { offerDouble, acceptDouble, rejectDouble } = useDoublingCube(currentRoom, user);
    const { isDesktop, isMobile } = useDevice();
    const [selectedPoint, setSelectedPoint] = useState<number | null>(null);
    const [isChatOpen, setIsChatOpen] = useState(false);

    // AI Coach State
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null);
    const [showAnalysis, setShowAnalysis] = useState(false);
    const [coachMode, setCoachMode] = useState<'text' | 'video'>('text');
    const [personality, setPersonality] = useState<Personality>('strategist');
    const [coachVideoUrl, setCoachVideoUrl] = useState<string | null>(null);
    const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);

    // Win Modal State
    const [winModal, setWinModal] = useState<{
        isOpen: boolean;
        winner: 'player' | 'bot' | 'opponent';
        winType: 'simple' | 'gammon' | 'backgammon';
    }>({
        isOpen: false,
        winner: 'player',
        winType: 'simple'
    });

    // Parse Game Options from URL - avec protection contre les valeurs invalides
    const searchParams = new URLSearchParams(location.search);
    const rawMode = searchParams.get('mode');
    const mode = (rawMode === 'match' || rawMode === 'money') ? rawMode : 'money';
    const rawLength = parseInt(searchParams.get('length') || '0');
    const length = isNaN(rawLength) || rawLength < 0 ? 0 : rawLength;

    // Determine player color based on players array (must be before useEffect that uses it)
    const playerColor = useMemo(() => {
        if (!players || players.length === 0) return 1; // Default to player 1
        if (players[0]?.id === user?.id) return 1; // Player 1 (White)
        if (players[1]?.id === user?.id) return 2; // Player 2 (Red)
        // If user is not in players array, default to player 1
        return 1;
    }, [players, user?.id]);

    // Flag pour éviter les appels multiples - PERSISTANT
    const hasJoinedRef = useRef<string | null>(null);

    // Rejoindre la room au montage - VERSION CORRIGÉE avec toutes les dépendances
    useEffect(() => {
        const addLog = useDebugStore.getState().addLog;

        // Si pas de roomId, rediriger immédiatement
        if (!roomId) {
            addLog(`⚠️ [GAME_ROOM] Pas de roomId, redirection lobby`, 'warning');
            navigate('/lobby');
            return;
        }

        // Attendre que l'auth soit chargée pour éviter de créer un guest temporaire
        if (loading) {
            // addLog(`⏳ [GAME_ROOM] Chargement auth...`, 'info'); // Trop verbeux
            return;
        }

        // Si déjà rejoint cette room, skip
        if (hasJoinedRef.current === roomId) {
            addLog(`✅ [GAME_ROOM] Déjà rejoint ${roomId}, skip`, 'info');
            return;
        }

        // Si déjà dans la bonne room, skip
        if (currentRoom && currentRoom.id === roomId) {
            hasJoinedRef.current = roomId;
            addLog(`✅ [GAME_ROOM] Déjà dans la room ${roomId}, skip`, 'info');
            return;
        }

        addLog(`🎮 [GAME_ROOM] Démarrage join - roomId: ${roomId}`, 'info');

        // Marquer comme en cours
        hasJoinedRef.current = roomId;

        // TOUJOURS utiliser offline-bot pour éviter les blocages Supabase
        const options = mode ? { mode: mode as 'match' | 'money', matchLength: length } : undefined;
        const queryParams = location.search || '';

        // Si c'est déjà offline-bot, joindre directement
        if (roomId === 'offline-bot') {
            addLog(`🤖 [GAME_ROOM] Mode offline-bot détecté`, 'info');
            joinRoom('offline-bot', options)
                .then(() => {
                    addLog(`✅ [GAME_ROOM] Offline-bot rejoint`, 'success');
                })
                .catch((err: any) => {
                    addLog(`❌ [GAME_ROOM] Erreur: ${err?.message}`, 'error', err);
                    hasJoinedRef.current = null; // Reset pour retry
                    showError('Erreur au démarrage. Retour au lobby.');
                    setTimeout(() => navigate('/lobby'), 2000);
                });
            return;
        }

        // Pour TOUTES les autres rooms, utiliser offline-bot en fallback
        addLog(`⚠️ [GAME_ROOM] Room ${roomId} → Fallback offline-bot`, 'info');
        navigate(`/game/offline-bot${queryParams}`);

    }, [roomId, mode, length, location.search, joinRoom, navigate, loading]); // Retirer currentRoom?.id pour éviter boucle

    // Detect game end and calculate match score (avec protection contre boucle infinie)
    const gameEndProcessedRef = useRef<string | null>(null);

    // VALIDATION UNIFIÉE DU BOARD - Déclarer AVANT les returns (règle React hooks)
    const boardValidationRef = useRef({ fixed: false, lastBoardHash: '' });

    // Validation du board - useEffect AVANT les returns
    useEffect(() => {
        if (!gameState || !gameState.board || !gameState.board.points) return;

        try {
            const isValidStructure = Array.isArray(gameState.board.points) && gameState.board.points.length === 24;
            const totalCheckers = gameState.board.points.reduce((sum: number, p: any) => sum + (p?.count || 0), 0);

            // Créer un hash du board pour détecter les changements
            const boardHash = JSON.stringify(gameState.board.points);

            // Si le board a changé, réinitialiser le flag fixed
            if (boardHash !== boardValidationRef.current.lastBoardHash) {
                boardValidationRef.current.fixed = false;
                boardValidationRef.current.lastBoardHash = boardHash;
            }

            // Ne réinitialiser QUE si le board est vraiment invalide ET qu'on n'a pas déjà fixé ce board
            if ((!isValidStructure || totalCheckers === 0) && !boardValidationRef.current.fixed) {
                const addLog = useDebugStore.getState().addLog;
                addLog(`❌ [GAME_ROOM] Board invalide/vide - Réinitialisation`, 'error', {
                    isValidStructure,
                    totalCheckers,
                    boardHash: boardHash.substring(0, 50)
                });

                // Marquer comme fixé AVANT de réinitialiser pour éviter les boucles
                boardValidationRef.current.fixed = true;

                try {
                    const fixedBoard = JSON.parse(JSON.stringify(INITIAL_BOARD));
                    const currentGameState = useGameStore.getState().gameState;
                    if (currentGameState) {
                        const fixedState = {
                            ...currentGameState,
                            board: fixedBoard
                        };
                        updateGame(fixedState);
                        addLog(`✅ [GAME_ROOM] Board réinitialisé avec INITIAL_BOARD`, 'success', {
                            totalCheckersAfter: fixedBoard.points.reduce((sum: number, p: any) => sum + (p?.count || 0), 0)
                        });
                    }
                } catch (copyError: any) {
                    const currentGameState = useGameStore.getState().gameState;
                    if (currentGameState) {
                        const fixedBoard = {
                            points: INITIAL_BOARD.points.map(p => ({ ...p })),
                            bar: { ...INITIAL_BOARD.bar },
                            off: { ...INITIAL_BOARD.off }
                        };
                        const fixedState = {
                            ...currentGameState,
                            board: fixedBoard
                        };
                        updateGame(fixedState);
                    }
                }
            } else if (isValidStructure && totalCheckers > 0) {
                // Board valide - réinitialiser le flag fixed pour permettre les futures validations
                // MAIS seulement si le board a vraiment changé (détecté par le hash)
                if (boardHash !== boardValidationRef.current.lastBoardHash) {
                    boardValidationRef.current.fixed = false;
                }
            }
        } catch (error: any) {
            // Ignorer les erreurs de validation
        }
    }, [gameState?.board, updateGame]);

    useEffect(() => {
        if (!gameState || !gameState.board) return;

        const player1Won = hasWon(gameState.board, 1);
        const player2Won = hasWon(gameState.board, 2);

        if (player1Won || player2Won) {
            const winner = player1Won ? 1 : 2;
            const winType = checkWinType(gameState.board, winner as PlayerColor);

            // Créer une clé unique pour cette victoire
            const winKey = `${player1Won ? '1' : '2'}-${winType}-${JSON.stringify(gameState.score)}`;

            // Éviter de traiter la même victoire plusieurs fois
            if (gameEndProcessedRef.current === winKey) {
                return;
            }

            gameEndProcessedRef.current = winKey;

            // Determine winner player ID
            const winnerPlayerId = winner === 1
                ? (players[0]?.id || 'player1')
                : (players[1]?.id || 'player2');

            // Calculate match score if match game
            if (gameState.matchLength && gameState.matchLength > 0 && players.length > 0) {
                const newMatchScore = calculateMatchScore(
                    winType,
                    gameState.cubeValue,
                    gameState.matchLength,
                    gameState.score || {},
                    winnerPlayerId,
                    players
                );

                if (newMatchScore) {
                    // Vérifier si le score a vraiment changé avant de mettre à jour
                    const scoreChanged = JSON.stringify(gameState.score) !== JSON.stringify(newMatchScore);

                    if (scoreChanged) {
                        const { updateGame } = useGameStore.getState();
                        const updatedGameState = {
                            ...gameState,
                            score: newMatchScore
                        };
                        updateGame(updatedGameState);

                        // Sauvegarder en DB si nécessaire (async, ne bloque pas)
                        if (currentRoom && currentRoom.id !== 'offline-bot') {
                            import('../lib/supabase').then(({ supabase }) => {
                                supabase.from('games').update({ board_state: updatedGameState })
                                    .eq('room_id', currentRoom.id)
                                    .then(() => {
                                        const addLog = useDebugStore.getState().addLog;
                                        addLog('Score de match sauvegardé', 'success');
                                    })
                                    .catch((error) => {
                                        const addLog = useDebugStore.getState().addLog;
                                        addLog('Erreur sauvegarde score', 'error', error);
                                    });
                            }).catch((error) => {
                                const addLog = useDebugStore.getState().addLog;
                                addLog('Erreur import supabase', 'error', error);
                            });
                        }

                        // Check if match is complete
                        const matchComplete = Object.values(newMatchScore).some(
                            (points: number) => points >= gameState.matchLength!
                        );

                        if (matchComplete) {
                            const playerWon = (playerColor === 1 && player1Won) || (playerColor === 2 && player2Won);
                            setWinModal({
                                isOpen: true,
                                winner: playerWon ? 'player' : (players[1]?.id === 'bot' ? 'bot' : 'opponent'),
                                winType: 'simple'
                            });
                            return;
                        }
                    }
                }
            }

            // Determine if player won
            const playerWon = (playerColor === 1 && player1Won) || (playerColor === 2 && player2Won);

            setWinModal({
                isOpen: true,
                winner: playerWon ? 'player' : (players[1]?.id === 'bot' ? 'bot' : 'opponent'),
                winType
            });
        } else {
            // Reset si plus de victoire
            gameEndProcessedRef.current = null;
        }
    }, [gameState?.board, gameState?.matchLength, gameState?.score, gameState?.cubeValue, playerColor, players, currentRoom?.id]);

    // Diagnostic du board pour les jetons - useEffect AVANT les returns
    useEffect(() => {
        if (!gameState || !gameState.board || !gameState.board.points) return;

        const addLog = useDebugStore.getState().addLog;
        const totalCheckersOnBoard = gameState.board.points.reduce((sum: number, p: any) => sum + (p?.count || 0), 0);
        const pointsWithCheckers = gameState.board.points.filter((p: any) => p?.count > 0).length;

        if (gameState.board && gameState.board.points) {
            addLog(`🎯 [GAME_ROOM] Board pour rendu`, 'info', {
                totalCheckers: totalCheckersOnBoard,
                pointsWithCheckers,
                samplePoints: {
                    point0: gameState.board.points[0],
                    point5: gameState.board.points[5],
                    point11: gameState.board.points[11],
                    point12: gameState.board.points[12],
                    point23: gameState.board.points[23]
                }
            });
        }
    }, [gameState?.board?.points]);

    // Vérifier si on est en mode offline-bot (ne nécessite pas de connexion)
    const isOfflineMode = currentRoom?.id === 'offline-bot' || roomId === 'offline-bot';
    const DEMO_MODE = !import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY;

    // === HOOKS QUI DOIVENT ÊTRE AVANT LES RETURNS CONDITIONNELS ===
    // Extract game state values safely (with defaults for when gameState is null)
    const board = gameState?.board;
    const dice = gameState?.dice || [];
    const turn = gameState?.turn || '';
    const score = gameState?.score;
    const cubeValue = gameState?.cubeValue || 1;
    const cubeOwner = gameState?.cubeOwner;
    const pendingDouble = gameState?.pendingDouble;

    // isMyTurn calculation (safe even when gameState is null)
    const isMyTurn = useMemo(() => {
        if (!gameState) return false;
        
        // In offline-bot mode, player is always players[0]
        if (currentRoom?.id === 'offline-bot' && players && players.length > 0) {
            const myId = players[0].id;
            const currentTurn = turn;
            // Check if it's the first player's turn
            return currentTurn === myId || 
                   currentTurn === 'guest' || 
                   currentTurn === 'guest-1' ||
                   (currentTurn === players[0].id);
        }
        
        // Normal mode: check against user ID
        if (!user) return false;
        const myId = user.id;
        if (turn === myId) return true;
        if (turn === 'guest-1' && myId === 'guest-1') return true;
        if (turn === 'guest' && !user.id) return true;
        
        // Fallback: check if turn matches first player
        if (players && players.length > 0 && turn === players[0].id) {
            return players[0].id === myId;
        }
        
        return false;
    }, [user, gameState, turn, currentRoom?.id, players]);

    // canDouble calculation
    const hasDiceRolled = dice && dice.length > 0;
    const canDoubleCalc = useMemo(() => {
        if (!gameState) return false;
        return canOfferDouble(
            cubeValue,
            cubeOwner,
            user?.id || '',
            hasDiceRolled,
            gameState.matchLength || 0
        );
    }, [gameState, cubeValue, cubeOwner, user?.id, hasDiceRolled]);

    // Map state for new board - MUST BE BEFORE CONDITIONAL RETURNS
    const boardState = useMemo(() => {
        if (!gameState) return null;
        const mappedPlayers = players.map((p, i) => ({
            id: p.id,
            color: i === 0 ? 1 : 2
        }));
        return mapGameStateToBoardState(gameState as any, user?.id || 'guest', mappedPlayers);
    }, [gameState, user?.id, players]);

    const matchState = useMemo(() => ({
        players: [
            {
                handle: players[0]?.username || 'Player 1',
                rating: 1500,
                connected: true,
                color: 'light' as const,
                countryCode: 'US'
            },
            {
                handle: players[1]?.username || 'Player 2',
                rating: 1500,
                connected: true,
                color: 'dark' as const,
                countryCode: 'AI'
            }
        ] as [Player, Player],
        score: [
            score && players[0] ? (score[players[0].id] || 0) : 0,
            score && players[1] ? (score[players[1].id] || 0) : 0
        ] as [number, number],
        limitPoints: gameState?.matchLength || 0,
        timers: [
            { msRemaining: 0, running: false },
            { msRemaining: 0, running: false }
        ] as [TimerState, TimerState]
    }), [players, score, gameState?.matchLength]);

    // Handle moves from the new board component
    const handleBoardMove = useCallback((from: number | 'bar', to: number | 'borne') => {
        if (!isMyTurn) {
            console.warn('[GameRoom] Not my turn, ignoring move');
            return;
        }
        const isPlayer1 = playerColor === 1;
        let fromIdx: number;
        let toIdx: number;
        if (from === 'bar') {
            fromIdx = isPlayer1 ? 24 : -1;
        } else {
            fromIdx = from - 1;
        }
        if (to === 'borne') {
            toIdx = isPlayer1 ? -1 : 24;
        } else {
            toIdx = to - 1;
        }
        console.log(`[GameRoom] Move: ${from} -> ${to} (mapped: ${fromIdx} -> ${toIdx})`);
        sendGameAction('move', { from: fromIdx, to: toIdx });
    }, [isMyTurn, playerColor, sendGameAction]);

    // Determine if current player can double now
    const canDoubleNow = useMemo(() => {
        if (!isMyTurn) return false;
        if (pendingDouble) return false;
        if (!canDoubleCalc) return false;
        if (dice && dice.length > 0) return false;
        return true;
    }, [isMyTurn, pendingDouble, canDoubleCalc, dice]);

    // === END OF HOOKS THAT MUST BE BEFORE CONDITIONAL RETURNS ===

    // Check if game is loaded - FORCER l'initialisation si manquant
    if (!currentRoom || !gameState) {
        const addLog = useDebugStore.getState().addLog;

        // Si on est en mode offline-bot, forcer l'initialisation immédiatement
        if (roomId === 'offline-bot' && (!currentRoom || !gameState)) {
            addLog(`⚠️ [GAME_ROOM] Room ou gameState manquant en mode offline-bot - Initialisation forcée`, 'warning', {
                hasRoom: !!currentRoom,
                hasGameState: !!gameState,
                roomId
            });

            // Forcer l'initialisation immédiatement
            if (joinRoom && !hasJoinedRef.current) {
                hasJoinedRef.current = roomId;
                const options = mode ? { mode, matchLength: length } : undefined;
                joinRoom('offline-bot', options).catch((err: any) => {
                    addLog(`❌ [GAME_ROOM] Erreur initialisation forcée: ${err?.message}`, 'error', err);
                    hasJoinedRef.current = null;
                });
            }
        }

        return (
            <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center text-white">
                <DebugOverlay />
                <BrowserConsole />
                <div className="w-16 h-16 border-4 border-[#FFD700]/30 border-t-[#FFD700] rounded-full animate-spin mb-6" />
                <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#FFD700] to-[#B8860B]">
                    Chargement de la partie...
                </h2>
                <p className="text-gray-500 mt-2">
                    {isOfflineMode || DEMO_MODE ? 'Initialisation du jeu local...' : 'Synchronisation avec le serveur'}
                </p>
                <p className="text-xs text-gray-700 mt-4 font-mono">
                    {isOfflineMode || DEMO_MODE ? 'Mode hors ligne' : (isConnected ? 'Connecté au socket' : 'Connexion socket en cours...')}
                </p>
                <p className="text-xs text-red-500 mt-2 font-mono">
                    Room: {currentRoom ? 'OK' : 'MANQUANT'} | GameState: {gameState ? 'OK' : 'MANQUANT'}
                </p>
            </div>
        );
    }

    // Offline State - SEULEMENT si pas en mode offline-bot et pas en mode démo
    if (!isConnected && !isOfflineMode && !DEMO_MODE) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center text-white">
                <DebugOverlay />
                <div className="text-center p-8 bg-[#111] rounded-2xl border border-red-500/20">
                    <WifiOff className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-bold mb-2">Connexion perdue</h2>
                    <p className="text-gray-500 mb-4">Tentative de reconnexion...</p>
                    <button onClick={() => navigate('/lobby')} className="text-[#FFD700] underline hover:text-white transition-colors">
                        Retour au Lobby
                    </button>
                </div>
            </div>
        );
    }

    // --- Game Logic ---
    // Vérifier que gameState existe et a un board valide - FORCER l'initialisation si manquant
    if (!gameState || !gameState.board) {
        const addLog = useDebugStore.getState().addLog;
        addLog(`⚠️ [GAME_ROOM] gameState ou board manquant - Réinitialisation FORCÉE...`, 'error', {
            gameState,
            hasBoard: !!gameState?.board,
            roomId,
            currentRoom: currentRoom?.id
        });

        // FORCER l'initialisation immédiatement avec offline-bot
        if (joinRoom && roomId) {
            const targetRoomId = roomId === 'offline-bot' ? 'offline-bot' : 'offline-bot'; // Toujours offline-bot
            const options = mode ? { mode, matchLength: length } : undefined;

            if (!hasJoinedRef.current || hasJoinedRef.current !== targetRoomId) {
                hasJoinedRef.current = targetRoomId;
                addLog(`🔄 [GAME_ROOM] Réinitialisation forcée - joinRoom(${targetRoomId})`, 'info');
                joinRoom(targetRoomId, options)
                    .then(() => {
                        addLog(`✅ [GAME_ROOM] Réinitialisation réussie`, 'success');
                    })
                    .catch((err: any) => {
                        addLog(`❌ [GAME_ROOM] Erreur réinitialisation: ${err?.message}`, 'error', err);
                        hasJoinedRef.current = null;
                    });
            }
        }

        return (
            <div className="h-screen bg-[#050505] text-white flex items-center justify-center">
                <DebugOverlay />
                <BrowserConsole />
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-[#FFD700]/30 border-t-[#FFD700] rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-[#FFD700] font-medium">Initialisation du jeu...</p>
                    <p className="text-xs text-red-500 mt-2 font-mono">
                        GameState: {gameState ? 'EXISTS' : 'NULL'} | Board: {gameState?.board ? 'EXISTS' : 'NULL'}
                    </p>
                </div>
            </div>
        );
    }

    // Variables déjà extraites au début du composant (avant les returns conditionnels)
    // board, dice, turn, score, cubeValue, cubeOwner, pendingDouble sont déjà définis
    // isMyTurn, canDoubleCalc, boardState, matchState, handleBoardMove, canDoubleNow sont déjà définis

    // Handlers
    const handleRollDice = useCallback(() => {
        const addLog = useDebugStore.getState().addLog;
        const diceArray = gameState?.dice || [];
        const canRoll = isMyTurn && diceArray.length === 0;
        
        addLog('Tentative de lancer les dés', 'info', { 
            isMyTurn, 
            diceLength: diceArray.length,
            turn: gameState?.turn,
            myId: user?.id || players[0]?.id,
            canRoll
        });

        if (canRoll) {
            sendGameAction('rollDice', {});
        } else {
            addLog('Action refusée', 'warning', { 
                reason: !isMyTurn ? 'Pas votre tour' : 'Dés déjà lancés',
                isMyTurn,
                diceLength: diceArray.length,
                turn: gameState?.turn
            });
        }
    }, [isMyTurn, gameState, user?.id, players, sendGameAction]);

    const handleAskCoach = async () => {
        if (isAnalyzing) return;
        setIsAnalyzing(true);
        setAiAnalysis(null);
        setCoachVideoUrl(null);
        setShowAnalysis(true);

        const addLog = useDebugStore.getState().addLog;
        addLog('Demande d\'analyse au Coach...', 'info');

        try {
            const analysis = await analyzeMove(gameState, gameState.dice, playerColor);
            setAiAnalysis(analysis);
            addLog('Analyse reçue !', 'success');

            // If desktop and video mode, generate video
            if (isDesktop && coachMode === 'video') {
                setIsGeneratingVideo(true);
                try {
                    const script = formatScriptForPersonality(analysis, personality);
                    const videoUrl = await generateCoachVideo(script, personality);
                    if (videoUrl) {
                        setCoachVideoUrl(videoUrl);
                    } else {
                        // Fallback to text if video generation fails
                        setCoachMode('text');
                    }
                } catch (e) {
                    console.error('Error generating video:', e);
                    setCoachMode('text');
                } finally {
                    setIsGeneratingVideo(false);
                }
            }
        } catch (e) {
            addLog('Erreur analyse', 'error', e);
        }
        setIsAnalyzing(false);
    };

    // Handle coach mode change
    const handleCoachModeChange = async (mode: 'text' | 'video') => {
        setCoachMode(mode);

        // If switching to video and we have analysis, generate video
        if (mode === 'video' && aiAnalysis && isDesktop && !coachVideoUrl) {
            setIsGeneratingVideo(true);
            try {
                const script = formatScriptForPersonality(aiAnalysis, personality);
                const videoUrl = await generateCoachVideo(script, personality);
                if (videoUrl) {
                    setCoachVideoUrl(videoUrl);
                }
            } catch (e) {
                console.error('Error generating video:', e);
            } finally {
                setIsGeneratingVideo(false);
            }
        }
    };

    const onDragStart = (index: number) => {
        const addLog = useDebugStore.getState().addLog;
        if (!isMyTurn) {
            addLog('Drag refusé: Pas votre tour', 'warning');
            return;
        }
        addLog(`Drag Start: Point ${index}`, 'info');
        setSelectedPoint(index);
    };

    const onDrop = (toIndex: number) => {
        const addLog = useDebugStore.getState().addLog;
        addLog(`Drop Attempt: ${selectedPoint} -> ${toIndex}`, 'info', { selectedPoint, isMyTurn });

        if (selectedPoint !== null && isMyTurn) {
            sendGameAction('move', { from: selectedPoint, to: toIndex });
            setSelectedPoint(null);
        } else {
            addLog('Drop ignoré', 'warning', { reason: !isMyTurn ? 'Pas votre tour' : 'Aucun point sélectionné' });
        }
    };

    const handleLeave = () => {
        if (window.confirm('Voulez-vous vraiment quitter la partie ?')) {
            leaveRoom();
            navigate('/lobby');
        }
    };

    // boardState, matchState, handleBoardMove, canDoubleNow sont définis au début du composant

    return (
        <div className="h-screen bg-[#050505] text-white flex flex-col overflow-hidden font-sans relative">
            <DebugOverlay />
            <BrowserConsole />
            <TestPanel />

            {/* AI Coach Modal */}
            <AnimatePresence>
                {showAnalysis && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                    >
                        <div className="bg-[#1a1a1a] border border-[#FFD700]/30 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
                            <button
                                onClick={() => setShowAnalysis(false)}
                                className="absolute top-4 right-4 text-gray-400 hover:text-white"
                            >
                                <X className="w-6 h-6" />
                            </button>

                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-full bg-[#FFD700]/10 flex items-center justify-center">
                                    <Lightbulb className="w-6 h-6 text-[#FFD700]" />
                                </div>
                                <h3 className="text-xl font-bold text-white">L'avis du Coach</h3>
                            </div>

                            {/* Mode Toggle - Desktop only */}
                            {isDesktop && (
                                <>
                                    <div className="flex justify-center mb-4">
                                        <div className="bg-black/40 p-1 rounded-full flex items-center border border-white/10">
                                            <button
                                                onClick={() => handleCoachModeChange('text')}
                                                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${coachMode === 'text'
                                                    ? 'bg-[#FFD700] text-black shadow-lg'
                                                    : 'text-gray-400 hover:text-white'
                                                    }`}
                                            >
                                                Text
                                            </button>
                                            <button
                                                onClick={() => handleCoachModeChange('video')}
                                                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${coachMode === 'video'
                                                    ? 'bg-[#FFD700] text-black shadow-lg'
                                                    : 'text-gray-400 hover:text-white'
                                                    }`}
                                            >
                                                Video Avatar
                                            </button>
                                        </div>
                                    </div>

                                    {/* Personality Selection - Desktop only */}
                                    {coachMode === 'video' && (
                                        <div className="flex justify-center mb-4">
                                            <div className="bg-black/40 p-1 rounded-full flex items-center border border-white/10">
                                                <button
                                                    onClick={() => {
                                                        setPersonality('strategist');
                                                        setCoachVideoUrl(null); // Regenerate with new personality
                                                    }}
                                                    className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${personality === 'strategist'
                                                        ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                                                        : 'text-gray-400 hover:text-white'
                                                        }`}
                                                >
                                                    Strategist
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setPersonality('humorist');
                                                        setCoachVideoUrl(null); // Regenerate with new personality
                                                    }}
                                                    className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${personality === 'humorist'
                                                        ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                                                        : 'text-gray-400 hover:text-white'
                                                        }`}
                                                >
                                                    Humorist
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}

                            {isAnalyzing ? (
                                <div className="py-8 flex flex-col items-center gap-4">
                                    <div className="w-8 h-8 border-2 border-[#FFD700] border-t-transparent rounded-full animate-spin" />
                                    <p className="text-gray-400 animate-pulse">Analyse de la position...</p>
                                </div>
                            ) : aiAnalysis ? (
                                (coachMode === 'text' || !isDesktop) ? (
                                    <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                                        {/* Meilleur Coup */}
                                        <div className="bg-black/30 p-4 rounded-xl border border-white/5">
                                            <div className="text-xs text-gray-500 uppercase font-bold mb-1">Meilleur Coup</div>
                                            <div className="text-lg font-mono text-[#FFD700]">
                                                {aiAnalysis.bestMove.map(m => `${m.from + 1} → ${m.to + 1}`).join(', ')}
                                            </div>
                                        </div>

                                        {/* Stratégie Recommandée */}
                                        {aiAnalysis.strategicAdvice && (
                                            <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 p-4 rounded-xl border border-blue-500/20">
                                                <div className="flex justify-between items-center mb-2">
                                                    <div className="text-xs text-blue-400 uppercase font-bold">Stratégie</div>
                                                    {aiAnalysis.strategicAdvice.riskLevel && (
                                                        <span className={`text-[10px] px-2 py-0.5 rounded border ${aiAnalysis.strategicAdvice.riskLevel === 'high' ? 'bg-red-500/10 border-red-500/30 text-red-400' :
                                                            aiAnalysis.strategicAdvice.riskLevel === 'low' ? 'bg-green-500/10 border-green-500/30 text-green-400' :
                                                                'bg-yellow-500/10 border-yellow-500/30 text-yellow-400'
                                                            }`}>
                                                            RISQUE: {aiAnalysis.strategicAdvice.riskLevel.toUpperCase()}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="text-sm font-bold text-white mb-1">
                                                    {aiAnalysis.strategicAdvice.recommendedStrategy}
                                                </div>
                                                <p className="text-xs text-gray-300 leading-relaxed">
                                                    {aiAnalysis.strategicAdvice.analysis}
                                                </p>
                                            </div>
                                        )}

                                        {/* Explication */}
                                        <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                                            <div className="text-xs text-gray-500 uppercase font-bold mb-1">Analyse détaillée</div>
                                            <p className="text-sm text-gray-300 leading-relaxed">
                                                {aiAnalysis.explanation}
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-8 space-y-4">
                                        {isGeneratingVideo ? (
                                            <>
                                                <div className="w-48 h-48 bg-black/50 rounded-full border-4 border-[#FFD700]/20 flex items-center justify-center overflow-hidden relative shadow-[0_0_30px_rgba(255,215,0,0.1)]">
                                                    <div className="w-12 h-12 border-2 border-[#FFD700] border-t-transparent rounded-full animate-spin" />
                                                </div>
                                                <p className="text-gray-400 animate-pulse">Generating video avatar...</p>
                                            </>
                                        ) : coachVideoUrl ? (
                                            <>
                                                <div className="w-48 h-48 bg-black/50 rounded-full border-4 border-[#FFD700]/20 flex items-center justify-center overflow-hidden relative shadow-[0_0_30px_rgba(255,215,0,0.1)]">
                                                    <video
                                                        src={coachVideoUrl}
                                                        autoPlay
                                                        loop
                                                        muted
                                                        className="w-full h-full object-cover rounded-full"
                                                    />
                                                </div>
                                                <div className="bg-white/5 p-4 rounded-xl border border-white/5 w-full text-center">
                                                    <p className="text-sm text-gray-300 italic">
                                                        "{formatScriptForPersonality(aiAnalysis, personality).slice(0, 100)}..."
                                                    </p>
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <div className="w-48 h-48 bg-black/50 rounded-full border-4 border-[#FFD700]/20 flex items-center justify-center overflow-hidden relative shadow-[0_0_30px_rgba(255,215,0,0.1)]">
                                                    <UserIcon className="w-24 h-24 text-gray-600" />
                                                </div>
                                                <p className="text-gray-400">Video generation failed. Showing text mode.</p>
                                                <button
                                                    onClick={() => handleCoachModeChange('text')}
                                                    className="px-4 py-2 bg-[#FFD700] text-black font-bold rounded-lg"
                                                >
                                                    Switch to Text
                                                </button>
                                            </>
                                        )}
                                    </div>
                                )
                            ) : (
                                <div className="text-center py-8 text-gray-500">
                                    Impossible de charger l'analyse.
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Win Modal */}
            <WinModal
                isOpen={winModal.isOpen}
                winner={winModal.winner}
                winType={winModal.winType}
                onClose={() => setWinModal(prev => ({ ...prev, isOpen: false }))}
                onRematch={() => {
                    setWinModal(prev => ({ ...prev, isOpen: false }));
                    // Reset game and restart
                    window.location.reload();
                }}
            />

            {/* Navbar du jeu */}
            <div className={`${isMobile ? 'h-14' : 'h-16'} bg-[#111] border-b border-white/10 flex items-center justify-between px-4 md:px-6 z-20 shadow-lg`}>
                <div className="flex items-center gap-2 md:gap-4">
                    <button onClick={handleLeave} className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white">
                        <ArrowLeft className="w-5 h-5 md:w-6 md:h-6" />
                    </button>
                    <div>
                        <h1 className="text-sm md:text-lg font-bold text-white tracking-wide truncate max-w-[150px] md:max-w-none">{currentRoom.name}</h1>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                            <span className="hidden md:inline">En ligne</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2 md:gap-6">
                    {!isMobile && (
                        <div className="flex items-center gap-3 bg-black/40 px-4 py-2 rounded-full border border-white/5">
                            <div className="flex flex-col items-end">
                                <span className="text-xs text-gray-400">
                                    {gameState.matchLength && gameState.matchLength > 0
                                        ? `Match ${gameState.matchLength}`
                                        : 'Money Game'}
                                </span>
                                <span className="text-sm font-bold text-[#FFD700]">
                                    {(() => {
                                        if (!players || players.length === 0) return '0 - 0';
                                        const player1Score = score[players[0]?.id || 'player1'] || 0;
                                        const player2Score = score[players[1]?.id || 'player2'] || 0;
                                        return `${player1Score} - ${player2Score}`;
                                    })()}
                                </span>
                            </div>
                        </div>
                    )}

                    <button
                        onClick={handleAskCoach}
                        className={`flex items-center gap-1 md:gap-2 px-2 md:px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full hover:from-purple-500 hover:to-blue-500 transition-all shadow-lg shadow-purple-900/20 group ${isMobile ? 'text-xs' : ''}`}
                    >
                        <Lightbulb className="w-4 h-4 text-white group-hover:scale-110 transition-transform" />
                        {!isMobile && (
                            <>
                                <span className="text-sm font-bold">Coach AI</span>
                                <span className="bg-white/20 text-white text-[10px] px-1.5 py-0.5 rounded font-bold ml-1">BETA</span>
                            </>
                        )}
                    </button>

                    {/* Mobile Chat Toggle */}
                    {isMobile && (
                        <button
                            onClick={() => setIsChatOpen(!isChatOpen)}
                            className="relative p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
                        >
                            <MessageCircle className="w-5 h-5 text-white" />
                            {messages.length > 0 && (
                                <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#FFD700] text-black text-[10px] font-bold rounded-full flex items-center justify-center">
                                    {messages.length}
                                </span>
                            )}
                        </button>
                    )}
                </div>
            </div>

            {/* Zone de jeu principale */}
            <div className={`flex-1 flex ${isMobile ? 'flex-col' : 'flex-row'} relative bg-[#1a1a1a]`}>
                {/* Plateau de jeu */}
                {/* Plateau de jeu */}
                <div className={`${isMobile ? 'flex-1' : 'flex-1'} relative flex items-center justify-center p-2 md:p-4 lg:p-8 overflow-hidden`}>
                    {boardState && (
                        <BoardWrap
                            state={boardState}
                            matchState={matchState}
                            onMove={handleBoardMove}
                            onRollDice={handleRollDice}
                            onDouble={offerDouble}
                            onTake={pendingDouble && pendingDouble !== user?.id ? acceptDouble : undefined}
                            onPass={pendingDouble && pendingDouble !== user?.id ? rejectDouble : undefined}
                            pendingDouble={pendingDouble}
                            canDouble={canDoubleNow}
                            theme="dark"
                        />
                    )}
                </div>

                {/* Sidebar Droite (Chat & Infos) - Desktop */}
                {isDesktop && (
                    <div className="w-80 bg-[#111] border-l border-white/10 flex flex-col">
                        <div className="p-4 border-b border-white/10">
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Players</h3>
                            <div className="space-y-3">
                                <div className={`flex items-center gap-3 p-3 rounded-lg ${turn === players[0]?.id ? 'bg-white/10 border border-[#FFD700]/30' : 'bg-black/20'}`}>
                                    <div className="w-2 h-2 rounded-full bg-gray-200"></div>
                                    <div className="flex-1">
                                        <div className="text-sm font-bold text-white">{players[0]?.username || 'Player 1'}</div>
                                        <div className="text-xs text-gray-500">White</div>
                                    </div>
                                    {turn === players[0]?.id && <Clock className="w-4 h-4 text-[#FFD700] animate-pulse" />}
                                </div>
                                <div className={`flex items-center gap-3 p-3 rounded-lg ${turn === players[1]?.id ? 'bg-white/10 border border-[#FFD700]/30' : 'bg-black/20'}`}>
                                    <div className="w-2 h-2 rounded-full bg-red-600"></div>
                                    <div className="flex-1">
                                        <div className="text-sm font-bold text-white">{players[1]?.username || 'Player 2'}</div>
                                        <div className="text-xs text-gray-500">Red</div>
                                    </div>
                                    {turn === players[1]?.id && <Clock className="w-4 h-4 text-[#FFD700] animate-pulse" />}
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 overflow-hidden">
                            <ChatBox />
                        </div>
                    </div>
                )}

                {/* Mobile Chat Drawer */}
                {isMobile && (
                    <AnimatePresence>
                        {isChatOpen && (
                            <>
                                {/* Overlay */}
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    onClick={() => setIsChatOpen(false)}
                                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
                                />

                                {/* Drawer */}
                                <motion.div
                                    initial={{ y: '100%' }}
                                    animate={{ y: 0 }}
                                    exit={{ y: '100%' }}
                                    transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                                    className="fixed bottom-0 left-0 right-0 bg-[#111] border-t border-white/10 rounded-t-3xl z-50 max-h-[70vh] flex flex-col shadow-2xl"
                                >
                                    <div className="p-4 border-b border-white/10 flex items-center justify-between">
                                        <div>
                                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Players</h3>
                                            <div className="flex items-center gap-4">
                                                <div className={`flex items-center gap-2 ${turn === players[0]?.id ? 'text-[#FFD700]' : 'text-gray-400'}`}>
                                                    <div className="w-2 h-2 rounded-full bg-gray-200"></div>
                                                    <span className="text-xs font-bold">{players[0]?.username || 'Player 1'}</span>
                                                    {turn === players[0]?.id && <Clock className="w-3 h-3 animate-pulse" />}
                                                </div>
                                                <div className={`flex items-center gap-2 ${turn === players[1]?.id ? 'text-[#FFD700]' : 'text-gray-400'}`}>
                                                    <div className="w-2 h-2 rounded-full bg-red-600"></div>
                                                    <span className="text-xs font-bold">{players[1]?.username || 'Player 2'}</span>
                                                    {turn === players[1]?.id && <Clock className="w-3 h-3 animate-pulse" />}
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setIsChatOpen(false)}
                                            className="p-2 hover:bg-white/10 rounded-full transition-colors"
                                        >
                                            <X className="w-5 h-5 text-gray-400" />
                                        </button>
                                    </div>

                                    <div className="flex-1 overflow-hidden">
                                        <ChatBox />
                                    </div>
                                </motion.div>
                            </>
                        )}
                    </AnimatePresence>
                )}
            </div>
        </div>
    );
};

export default GameRoom;
