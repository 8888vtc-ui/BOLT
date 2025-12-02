import { useEffect, useState, useMemo, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { TouchBackend } from 'react-dnd-touch-backend';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, WifiOff, Clock, User as UserIcon, LogOut, Flag, RotateCcw, Lightbulb, X, MessageCircle } from 'lucide-react';

import { useGameSocket } from '../hooks/useGameSocket';
import { useGameStore } from '../stores/gameStore';
import { useAuth } from '../hooks/useAuth';
import { useDoublingCube } from '../hooks/useDoublingCube';
import { analyzeMove, AIAnalysis } from '../lib/aiService';
import { useDebugStore } from '../stores/debugStore';
import { canOfferDouble, hasWon, checkWinType, PlayerColor, calculateMatchScore } from '../lib/gameLogic';
import { useDevice } from '../hooks/useDevice';
import { generateCoachVideo } from '../lib/heygenService';
import { formatScriptForPersonality, Personality } from '../lib/coachPersonalities';
import { showError, showInfo } from '../lib/notifications';

import Point from '../components/Point';
import Checker from '../components/Checker';
import Dice from '../components/Dice';
import DoublingCube from '../components/game/DoublingCube';
import ChatBox from '../components/game/ChatBox';
import DebugOverlay from '../components/DebugOverlay';
import WinModal from '../components/game/WinModal';
import TestPanel from '../components/TestPanel';

// Détection mobile pour Drag & Drop
const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
const backend = isTouchDevice ? TouchBackend : HTML5Backend;

const GameRoom = () => {
    const { roomId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();
    const {
        isConnected,
        joinRoom,
        leaveRoom,
        sendGameAction,
        handleCheckerClick,
        undoMove,
        canUndo
    } = useGameSocket();

    const { currentRoom, gameState, players, messages } = useGameStore();
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

    // Parse Game Options from URL
    const searchParams = new URLSearchParams(location.search);
    const mode = searchParams.get('mode') as 'money' | 'match' | null;
    const length = parseInt(searchParams.get('length') || '0');

    // Determine player color based on players array (must be before useEffect that uses it)
    const playerColor = useMemo(() => {
        if (!players || players.length === 0) return 1; // Default to player 1
        if (players[0]?.id === user?.id) return 1; // Player 1 (White)
        if (players[1]?.id === user?.id) return 2; // Player 2 (Red)
        // If user is not in players array, default to player 1
        return 1;
    }, [players, user?.id]);

    // Flag pour éviter les appels multiples
    const joiningRef = useRef(false);

    // Rejoindre la room au montage - Vérifier l'authentification d'abord
    useEffect(() => {
        const addLog = useDebugStore.getState().addLog;
        
        // Éviter les appels multiples
        if (joiningRef.current) {
            addLog(`⚠️ [GAME_ROOM] Join déjà en cours, skip`, 'info');
            return;
        }
        
        // Si déjà dans la bonne room, ne pas rejoindre à nouveau
        if (currentRoom && currentRoom.id === roomId) {
            addLog(`✅ [GAME_ROOM] Déjà dans la room ${roomId}, skip`, 'info');
            return;
        }
        
        addLog(`🎮 [GAME_ROOM] useEffect montage - roomId: ${roomId}, user: ${user?.id || 'null'}`, 'info', { roomId, userId: user?.id, mode, length });
        
        // Fonction async pour gérer le join
        const handleJoinRoom = async () => {
            joiningRef.current = true;
            // Si pas d'utilisateur et pas offline-bot, rediriger vers login
            if (!user && roomId !== 'offline-bot') {
                addLog(`⚠️ [GAME_ROOM] Pas d'utilisateur, redirection vers login`, 'warning');
                navigate(`/login?redirect=/game/${roomId}`);
                return;
            }

            // Si pas de roomId, rediriger vers lobby
            if (!roomId) {
                addLog(`⚠️ [GAME_ROOM] Pas de roomId, redirection vers lobby`, 'warning');
                navigate('/lobby');
                return;
            }
            
            const options = mode ? { mode, matchLength: length } : undefined;
            addLog(`🎮 [GAME_ROOM] Options: ${JSON.stringify(options)}`, 'info');

            // Pour offline-bot, on peut joindre directement (pas besoin de connexion)
            if (roomId === 'offline-bot') {
                addLog(`🎮 [GAME_ROOM] Lancement joinRoom pour offline-bot`, 'info');
                try {
                    await joinRoom('offline-bot', options);
                    addLog(`✅ [GAME_ROOM] Offline-bot rejoint avec succès`, 'success');
                } catch (err: any) {
                    addLog(`❌ [GAME_ROOM] Erreur joinRoom offline-bot: ${err?.message || 'Erreur inconnue'}`, 'error', err);
                    showError('Erreur au démarrage de la partie. Retour au lobby.');
                    setTimeout(() => navigate('/lobby'), 2000);
                }
                return;
            } 
            
            // Pour les autres rooms, vérifier la connexion Supabase
            const DEMO_MODE = !import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY;
            
            if (DEMO_MODE) {
                // Mode démo : utiliser offline-bot
                addLog(`⚠️ [GAME_ROOM] Mode démo détecté, redirection vers offline-bot`, 'info');
                navigate(`/game/offline-bot${location.search}`);
                return;
            }
            
            // Si pas connecté mais roomId valide, attendre la connexion ou rediriger
            if (roomId && !isConnected) {
                addLog(`⏳ [GAME_ROOM] Attente de la connexion Supabase...`, 'info');
                // Attendre max 3 secondes
                setTimeout(() => {
                    if (!isConnected) {
                        addLog(`⚠️ [GAME_ROOM] Connexion Supabase timeout, fallback offline-bot`, 'warning');
                        navigate(`/game/offline-bot${location.search}`);
                    }
                }, 3000);
                return;
            }
            
            // Pour les autres rooms, vérifier la connexion
            if (roomId && isConnected && !currentRoom) {
                addLog(`🎮 [GAME_ROOM] Lancement joinRoom pour ${roomId}`, 'info');
                try {
                    await joinRoom(roomId, options);
                    addLog(`✅ [GAME_ROOM] Room ${roomId} rejointe avec succès`, 'success');
                } catch (err: any) {
                    addLog(`❌ [GAME_ROOM] Erreur joinRoom ${roomId}: ${err?.message || 'Erreur inconnue'}`, 'error', err);
                    showError('Erreur lors de la connexion à la salle. Passage en mode hors ligne.');
                    // Fallback vers offline-bot en cas d'erreur
                    setTimeout(() => navigate(`/game/offline-bot${location.search}`), 2000);
                }
            } else {
                addLog(`⚠️ [GAME_ROOM] Conditions non remplies pour joinRoom`, 'info', {
                    hasRoomId: !!roomId,
                    isConnected,
                    hasCurrentRoom: !!currentRoom
                });
            }
            
            joiningRef.current = false;
        };

        handleJoinRoom();
        
        // Cleanup
        return () => {
            joiningRef.current = false;
        };
    }, [roomId, isConnected, joinRoom, user, mode, length, navigate, location.search]); // Retirer currentRoom des dépendances pour éviter la boucle

    // Detect game end and calculate match score
    useEffect(() => {
        if (!gameState || !gameState.board) return;

        const player1Won = hasWon(gameState.board, 1);
        const player2Won = hasWon(gameState.board, 2);

        if (player1Won || player2Won) {
            const winner = player1Won ? 1 : 2;
            const winType = checkWinType(gameState.board, winner as PlayerColor);
            
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
                    // Update game state with new score
                    const { updateGame } = useGameStore.getState();
                    const updatedGameState = {
                        ...gameState,
                        score: newMatchScore
                    };
                    updateGame(updatedGameState);
                    
                    // Sauvegarder en DB si nécessaire
                    if (currentRoom && currentRoom.id !== 'offline-bot') {
                        import('../lib/supabase').then(({ supabase }) => {
                            supabase.from('games').update({ board_state: updatedGameState }).eq('room_id', currentRoom.id).then(() => {
                                const addLog = useDebugStore.getState().addLog;
                                addLog('Score de match sauvegardé', 'success');
                            }).catch((error) => {
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
                        // Match is complete - show match win modal
                        const playerWon = (playerColor === 1 && player1Won) || (playerColor === 2 && player2Won);
                        setWinModal({
                            isOpen: true,
                            winner: playerWon ? 'player' : (players[1]?.id === 'bot' ? 'bot' : 'opponent'),
                            winType: 'simple' // Match win is always simple
                        });
                        return;
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
        }
    }, [gameState, playerColor, players]);


    // Check if game is loaded
    if (!currentRoom || !gameState) {
        return (
            <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center text-white">
                <DebugOverlay />
                <div className="w-16 h-16 border-4 border-[#FFD700]/30 border-t-[#FFD700] rounded-full animate-spin mb-6" />
                <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#FFD700] to-[#B8860B]">
                    Chargement de la partie...
                </h2>
                <p className="text-gray-500 mt-2">Synchronisation avec le serveur</p>
                <p className="text-xs text-gray-700 mt-4 font-mono">
                    {isConnected ? 'Connecté au socket' : 'Connexion socket en cours...'}
                </p>
            </div>
        );
    }

    // Offline State
    if (!isConnected) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center text-white">
                <DebugOverlay />
                <div className="text-center p-8 bg-[#111] rounded-2xl border border-red-500/20">
                    <WifiOff className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-bold mb-2">Connexion perdue</h2>
                    <button onClick={() => navigate('/lobby')} className="text-[#FFD700] underline hover:text-white transition-colors">
                        Retour au Lobby
                    </button>
                </div>
            </div>
        );
    }

    // --- Game Logic ---
    const { board, dice, turn, score, cubeValue, cubeOwner, pendingDouble } = gameState;
    
    // Fix isMyTurn: use players from store
    const isMyTurn = (() => {
        if (!user) return false;
        const myId = user.id;
        // Check if current turn matches my ID
        if (turn === myId) return true;
        // Fallback for guest mode
        if (turn === 'guest-1' && myId === 'guest-1') return true;
        return false;
    })();

    // Calcul si le joueur peut doubler
    const hasDiceRolled = dice && dice.length > 0;
    const canDouble = canOfferDouble(
        cubeValue,
        cubeOwner,
        user?.id || '',
        hasDiceRolled,
        gameState.matchLength || 0
    );

    // Handlers
    const handleRollDice = () => {
        const addLog = useDebugStore.getState().addLog;
        addLog('Tentative de lancer les dés', 'info', { isMyTurn, diceLength: dice.length });

        if (isMyTurn && dice.length === 0) {
            sendGameAction('rollDice', {});
        } else {
            addLog('Action refusée', 'error', { reason: !isMyTurn ? 'Pas votre tour' : 'Dés déjà lancés' });
        }
    };

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

    // Construction du plateau selon la disposition standard du backgammon
    // Top row: points 12-17 (gauche) et 18-23 (droite)
    // Bottom row: points 11-6 (gauche) et 5-0 (droite)
    const topPoints = [];
    const bottomPoints = [];

    // Top row (points 12 à 23, de gauche à droite)
    for (let i = 12; i <= 23; i++) {
        topPoints.push(
            <Point
                key={i}
                index={i}
                point={board.points[i]}
                isTop={true}
                isValidDestination={false}
                onDrop={onDrop}
                onDragStart={onDragStart}
                currentPlayer={playerColor}
                canMove={isMyTurn && (dice.length > 0 || canUndo)} // Allow drag if undo is possible
                onClick={() => handleCheckerClick(i)}
            />
        );
    }

    // Bottom row (points 11 à 0, de gauche à droite)
    for (let i = 11; i >= 0; i--) {
        bottomPoints.push(
            <Point
                key={i}
                index={i}
                point={board.points[i]}
                isTop={false}
                isValidDestination={false}
                onDrop={onDrop}
                onDragStart={onDragStart}
                currentPlayer={playerColor}
                canMove={isMyTurn && (dice.length > 0 || canUndo)} // Allow drag if undo is possible
                onClick={() => handleCheckerClick(i)}
            />
        );
    }

    return (
        <DndProvider backend={backend}>
            <div className="h-screen bg-[#050505] text-white flex flex-col overflow-hidden font-sans relative">
                <DebugOverlay />
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
                                                        {aiAnalysis.strategicAdvice.explanation}
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
                    <div className={`${isMobile ? 'flex-1' : 'flex-1'} relative flex items-center justify-center p-2 md:p-4 lg:p-8`}>
                        {/* Cadre du plateau */}
                        <div className={`relative w-full ${isMobile ? 'max-w-full aspect-square' : 'max-w-[1000px] aspect-[4/3]'} bg-[#0a3d1d] rounded-xl shadow-2xl ${isMobile ? 'border-[8px]' : 'border-[16px]'} border-[#3d2b1f] flex overflow-hidden`}>

                            {/* Texture bois du cadre */}
                            <div className="absolute inset-0 border-[16px] border-[#3d2b1f] pointer-events-none z-10 rounded-xl shadow-[inset_0_0_20px_rgba(0,0,0,0.8)]"></div>

                            {/* Colonne Gauche (Points 12-7 et 13-18) */}
                            <div className="flex-1 flex flex-col border-r-4 border-[#2a1d15]/50 relative">
                                {/* Top Left (13-18) */}
                                <div className="flex-1 flex flex-row-reverse">
                                    {topPoints.slice(0, 6)}
                                </div>
                                {/* Bottom Left (12-7) */}
                                <div className="flex-1 flex flex-row-reverse">
                                    {bottomPoints.slice(6, 12)}
                                </div>
                            </div>

                            {/* Barre Centrale (Bar) */}
                            <div className="w-16 bg-[#2a1d15] flex flex-col items-center justify-center border-x-2 border-[#1a120d] shadow-inner relative z-0">
                                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')] opacity-30 mix-blend-overlay"></div>

                                {/* Pions capturés (Bar) */}
                                <div className="flex-1 flex flex-col justify-center gap-1 py-4">
                                    {/* Player 1 Bar */}
                                    {Array.from({ length: board.bar.player1 }).map((_, i) => (
                                        <div key={`bar-p1-${i}`} className="w-10 h-10 rounded-full bg-gray-200 border-2 border-gray-400 shadow-lg" />
                                    ))}
                                    {/* Player 2 Bar */}
                                    {Array.from({ length: board.bar.player2 }).map((_, i) => (
                                        <div key={`bar-p2-${i}`} className="w-10 h-10 rounded-full bg-red-700 border-2 border-red-900 shadow-lg" />
                                    ))}
                                </div>
                            </div>

                            {/* Colonne Droite (Points 19-24 et 6-1) */}
                            <div className="flex-1 flex flex-col border-l-4 border-[#2a1d15]/50 relative">
                                {/* Top Right (19-24) */}
                                <div className="flex-1 flex flex-row-reverse">
                                    {topPoints.slice(6, 12)}
                                </div>
                                {/* Bottom Right (6-1) */}
                                <div className="flex-1 flex flex-row-reverse">
                                    {bottomPoints.slice(0, 6)}
                                </div>
                            </div>

                            {/* Zone centrale (Dés et Cube) */}
                            <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-20">
                                <div className="flex gap-8 pointer-events-auto">
                                    <Dice dice={dice} onRoll={handleRollDice} canRoll={isMyTurn && dice.length === 0} />
                                    <div className="bg-black/60 backdrop-blur-sm p-4 rounded-xl border border-white/10">
                                        <DoublingCube
                                            cubeValue={cubeValue}
                                            cubeOwner={cubeOwner}
                                            currentPlayerId={user?.id || ''}
                                            canDouble={canDouble && isMyTurn}
                                            pendingDouble={pendingDouble || null}
                                            onOfferDouble={offerDouble}
                                            onAcceptDouble={acceptDouble}
                                            onRejectDouble={rejectDouble}
                                            opponentName={players[1]?.username || 'Adversaire'}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
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
        </DndProvider>
    );
};

export default GameRoom;
