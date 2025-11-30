import { useEffect, useRef, useCallback, useState } from 'react';
import { useAuth } from './useAuth';
import { useGameStore, Room, GameState } from '../stores/gameStore';
import { INITIAL_BOARD, getSmartMove, makeMove, PlayerColor } from '../lib/gameLogic';
import { supabase } from '../lib/supabase';
import { useDebugStore } from '../stores/debugStore';
import { analyzeMove, AIAnalysis } from '../lib/aiService';

const DEMO_MODE = !import.meta.env.VITE_SUPABASE_URL;

// --- Mock Data for Demo Mode ---
const createMockGameState = (userId?: string): GameState => ({
    board: INITIAL_BOARD,
    dice: [],
    turn: userId || 'guest-1', // Le tour est au joueur par défaut
    score: {},
    cubeValue: 1,
    doubleValue: 1,
    canDouble: true,
    matchLength: 5,
    currentPlayer: 1
});

const createMockRooms = (): Room[] => [];

export const useGameSocket = () => {
    const { user } = useAuth();
    const [history, setHistory] = useState<GameState[]>([]);

    const {
        setIsConnected,
        setRoomsList,
        setRoom,
        updateGame,
        addMessage,
        resetGame,
        currentRoom,
        gameState,
        isConnected,
        roomsList,
        players
    } = useGameStore();

    const channelRef = useRef<any>(null);

    // --- Supabase Realtime Subscription ---
    useEffect(() => {
        if (DEMO_MODE) {
            setIsConnected(true);
            setRoomsList(createMockRooms());
            return;
        }

        if (!user) return;

        // 1. Listen to Rooms list updates
        const roomsChannel = supabase.channel('public:rooms')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'rooms' }, () => {
                fetchRooms();
            })
            .subscribe((status) => {
                if (status === 'SUBSCRIBED') setIsConnected(true);
            });

        fetchRooms();

        return () => {
            supabase.removeChannel(roomsChannel);
        };
    }, [user]);

    // --- Fetch Rooms Helper ---
    const fetchRooms = async () => {
        const { data } = await supabase
            .from('rooms')
            .select('*, profiles:created_by(username, avatar_url)')
            .order('created_at', { ascending: false });

        if (data) {
            const formattedRooms: Room[] = data.map(r => ({
                id: r.id,
                name: r.name,
                status: r.status,
                players: []
            }));
            setRoomsList(formattedRooms);
        }
    };

    // --- Join Room & Subscribe to Game State ---
    const joinRoom = useCallback(async (roomId: string) => {
        const addLog = useDebugStore.getState().addLog;
        addLog(`Joining room: ${roomId}`, 'info');

        if (DEMO_MODE) {
            addLog('Demo mode join', 'info');
            const room = roomsList.find(r => r.id === roomId) || {
                id: roomId,
                name: 'Salle Demo',
                status: 'playing',
                players: []
            };
            setRoom(room as Room);
            updateGame(createMockGameState(user?.id));
            return;
        }

        try {
            if (roomId === 'offline-bot') {
                addLog('Initializing Offline Bot Mode', 'info');
                setRoom({
                    id: 'offline-bot',
                    name: 'Entraînement Solo (Offline)',
                    status: 'playing',
                    players: [{ id: user?.id || 'guest', username: user?.username || 'Guest', avatar_url: null }]
                });
                updateGame(createMockGameState(user?.id));
                return;
            }

            if (user) {
                await supabase.from('room_participants').upsert({ room_id: roomId, user_id: user.id }).select();
            }

            const { data: roomData, error: roomError } = await supabase.from('rooms').select('*').eq('id', roomId).single();

            if (roomError) {
                addLog('Error fetching room', 'error', roomError);
                // Fallback
                setRoom({ id: roomId, name: 'Partie en cours', status: 'playing', players: [] });
            } else if (roomData) {
                addLog(`Room fetched: ${roomData.name}`, 'success');
                setRoom(roomData);
            }

            if (channelRef.current) supabase.removeChannel(channelRef.current);

            const channel = supabase.channel(`room:${roomId}`)
                .on('postgres_changes', { event: '*', schema: 'public', table: 'games', filter: `room_id=eq.${roomId}` }, (payload) => {
                    const newGame = payload.new as any;
                    if (newGame && newGame.board_state) {
                        addLog('Game update received', 'info');
                        updateGame(newGame.board_state);
                    }
                })
                .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `room_id=eq.${roomId}` }, (payload) => {
                    const msg = payload.new as any;
                    addMessage({
                        id: msg.id,
                        userId: msg.user_id,
                        username: 'Joueur',
                        text: msg.content,
                        timestamp: new Date(msg.created_at).getTime()
                    });
                })
                .subscribe((status) => {
                    addLog(`Subscription status: ${status}`, status === 'SUBSCRIBED' ? 'success' : 'info');
                });

            channelRef.current = channel;

            // Récupération ou Création de l'état du jeu
            const { data: gameData, error: gameError } = await supabase.from('games').select('*').eq('room_id', roomId).single();

            if (gameData) {
                addLog('Game state found', 'success');
                updateGame(gameData.board_state);
            } else {
                addLog('No game found, creating new game...', 'info');
                const initialState = createMockGameState(user?.id);
                const { error: insertError } = await supabase.from('games').insert({
                    room_id: roomId,
                    board_state: initialState,
                    white_player_id: user?.id
                });

                if (insertError) {
                    addLog('Error creating game (retry)', 'error', insertError);
                    const { data: retryGame } = await supabase.from('games').select('*').eq('room_id', roomId).single();
                    if (retryGame) updateGame(retryGame.board_state);
                    else updateGame(initialState);
                } else {
                    updateGame(initialState);
                }
            }
        } catch (err) {
            addLog('Critical error joining room', 'error', err);
            setRoom({ id: roomId, name: 'Erreur Connexion', status: 'playing', players: [] });
            updateGame(createMockGameState(user?.id));
        }

    }, [user, roomsList, setRoom, updateGame, addMessage]);

    const leaveRoom = useCallback(async () => {
        if (DEMO_MODE) { resetGame(); return; }
        if (currentRoom && user) {
            await supabase.from('room_participants').delete().match({ room_id: currentRoom.id, user_id: user.id });
            if (channelRef.current) supabase.removeChannel(channelRef.current);
            resetGame();
        }
    }, [currentRoom, user, resetGame]);

    const createRoom = useCallback(async (roomName: string) => {
        if (DEMO_MODE) { return; }
        if (user) {
            const { data } = await supabase.from('rooms').insert({ name: roomName, created_by: user.id }).select().single();
            if (data) joinRoom(data.id);
        }
    }, [user, joinRoom]);

    const sendMessage = useCallback(async (message: string) => {
        if (DEMO_MODE) {
            addMessage({ id: Date.now().toString(), userId: 'me', username: 'Me', text: message, timestamp: Date.now() });
            return;
        }
        if (currentRoom && user) {
            await supabase.from('messages').insert({
                room_id: currentRoom.id,
                user_id: user.id,
                content: message
            });
        }
    }, [currentRoom, user, addMessage]);

    const undoMove = useCallback(() => {
        if (history.length === 0) return;
        const previousState = history[history.length - 1];
        updateGame(previousState);
        setHistory(prev => prev.slice(0, -1));

        if (!DEMO_MODE && currentRoom) {
            supabase.from('games').update({ board_state: previousState }).eq('room_id', currentRoom.id);
        }
    }, [history, updateGame, currentRoom]);

    // --- Game Actions ---
    const sendGameAction = useCallback(async (action: string, payload: any, forcePlayerColor?: number) => {
        const addLog = useDebugStore.getState().addLog;
        addLog(`Action: ${action}`, 'info', payload);

        let newState = { ...gameState } as GameState;

        if (action === 'rollDice') {
            setHistory([]);
            const dice1 = Math.floor(Math.random() * 6) + 1;
            const dice2 = Math.floor(Math.random() * 6) + 1;
            newState.dice = dice1 === dice2 ? [dice1, dice1, dice1, dice1] : [dice1, dice2];
            addLog(`Dice rolled: ${newState.dice.join(', ')}`, 'success');
        } else if (action === 'move') {
            const { from, to } = payload;

            // Déterminer la couleur du joueur
            let playerColor = forcePlayerColor || 1;
            if (!forcePlayerColor && user && players && players.length > 0) {
                // Si je suis le créateur/premier joueur -> Blanc (1)
                // Sinon -> Noir (2)
                if (players[0]?.id === user.id) playerColor = 1;
                else if (players[1]?.id === user.id) playerColor = 2;
            }

            // Hack pour le mode demo/guest si on joue seul
            if (!forcePlayerColor && (DEMO_MODE || (players && players.length === 0))) {
                playerColor = 1;
            }

            addLog(`Player Color: ${playerColor}`, 'info');

            const isBackwardMove = to > from;
            if (isBackwardMove && history.length > 0 && !forcePlayerColor) {
                undoMove();
                return;
            }

            const currentDice = newState.dice || [];

            let dieUsed = -1;
            if (playerColor === 1) { // Blanc (23 -> 0)
                if (from > to) dieUsed = from - to;
            } else { // Noir (0 -> 23)
                if (to > from) dieUsed = to - from;
            }

            const dieIndex = currentDice.indexOf(dieUsed);

            if (dieIndex > -1) {
                if (!forcePlayerColor) {
                    setHistory(prev => [...prev, JSON.parse(JSON.stringify(gameState))]);
                }
                const newBoard = makeMove(newState.board, playerColor as PlayerColor, from, to);
                const newDice = [...currentDice];
                newDice.splice(dieIndex, 1);

                newState.board = newBoard;
                newState.dice = newDice;
                addLog('Move executed locally', 'success');
            } else {
                addLog('Invalid move or no matching die', 'error', { from, to, dieUsed, dice: currentDice, playerColor });
                return;
            }
        }

        // Switch turn if no dice left
        if (newState.dice.length === 0 && action === 'move') {
            // Simple turn switch logic for now
            // In a real game, we need to check if moves are possible even with dice left
            // But for MVP, let's switch when dice are empty
            const currentPlayerId = newState.turn;
            // If current is user, switch to 'bot' or other player
            if (players && players.length > 1) {
                newState.turn = currentPlayerId === players[0].id ? players[1].id : players[0].id;
            } else {
                // Solo/Bot mode
                newState.turn = currentPlayerId === user?.id ? 'bot' : user?.id || 'guest-1';
            }
        }

        if (newState.board) {
            addLog('Updating local game state...', 'info');
            updateGame(newState);
            addLog('Local game state updated', 'success');
        }

        if (!DEMO_MODE && currentRoom && currentRoom.id !== 'offline-bot' && newState.board) {
            const { error } = await supabase.from('games').update({ board_state: newState }).eq('room_id', currentRoom.id);
            if (error) {
                addLog('Error updating game in DB', 'error', { message: error.message, details: error.details, hint: error.hint, code: error.code });
            } else {
                addLog('Game updated in DB', 'success');
            }
        }

    }, [gameState, updateGame, history, currentRoom, undoMove, players, user]);

    // --- Bot Logic ---
    useEffect(() => {
        if (!currentRoom || !gameState) return;

        // Check if it's a solo training game
        // We assume it's solo if the name starts with 'Entraînement' OR if there is only 1 player and we are playing
        // Also explicitly check for 'offline-bot' ID
        const isSoloGame = currentRoom.id === 'offline-bot' || currentRoom.name.startsWith('Entraînement') || (currentRoom.players && currentRoom.players.length <= 1);

        if (!isSoloGame) return;

        // Check if it's Bot's turn
        // Bot is 'bot' or any ID that is not me
        // Fix: If user is null (guest), myId is 'guest-1'
        const myId = user?.id || 'guest-1';
        const isBotTurn = gameState.turn !== myId;

        if (isBotTurn) {
            const performBotMove = async () => {
                const addLog = useDebugStore.getState().addLog;

                // 1. Roll Dice if needed
                if (gameState.dice.length === 0) {
                    addLog('🤖 Bot: Rolling dice...', 'info');
                    await new Promise(r => setTimeout(r, 1000));
                    sendGameAction('rollDice', {}, 2); // Force Player 2 (Black)
                    return;
                }

                // 2. Analyze and Move
                addLog('🤖 Bot: Thinking...', 'info');
                // await new Promise(r => setTimeout(r, 1500));

                try {
                    // We need to pass the board from the perspective of the bot (Player 2)
                    const analysis = await analyzeMove(gameState, gameState.dice, 2);

                    if (analysis.bestMove && analysis.bestMove.length > 0) {
                        const move = analysis.bestMove[0]; // Take the first move of the sequence

                        addLog(`🤖 Bot: Moving ${move.from} -> ${move.to}`, 'info');
                        await new Promise(r => setTimeout(r, 600));
                        sendGameAction('move', { from: move.from, to: move.to }, 2);
                    } else {
                        addLog('🤖 Bot: No moves found or turn done.', 'info');
                        // Force turn switch if no moves possible
                        await new Promise(r => setTimeout(r, 2000));

                        // Clear dice to force turn switch in the next render cycle
                        const newState = { ...gameState, dice: [] };
                        updateGame(newState);

                        // Also update DB to ensure sync (SKIP for offline-bot)
                        if (!DEMO_MODE && currentRoom && currentRoom.id !== 'offline-bot') {
                            supabase.from('games').update({ board_state: newState }).eq('room_id', currentRoom.id);
                        }
                    }
                } catch (e) {
                    addLog('🤖 Bot: Error', 'error', e);
                    // Fallback: If bot crashes, switch turn after delay to avoid hanging
                    await new Promise(r => setTimeout(r, 2000));
                    const newState = { ...gameState, dice: [] }; // Clear dice to force turn switch
                    updateGame(newState);
                }
            };
            performBotMove();
        }
    }, [gameState, currentRoom, user, sendGameAction]);

    const handleCheckerClick = useCallback((index: number) => {
        if (!gameState || !user) return;

        // Déterminer la couleur du joueur (même logique)
        let playerColor = 1;
        if (players && players.length > 0) {
            if (players[0]?.id === user.id) playerColor = 1;
            else if (players[1]?.id === user.id) playerColor = 2;
        }

        const point = gameState.board.points[index];
        if (point.player !== playerColor || point.count === 0) return;

        const smartMove = getSmartMove(gameState.board, playerColor as PlayerColor, index, gameState.dice);
        if (smartMove) {
            setHistory(prev => [...prev, JSON.parse(JSON.stringify(gameState))]);
            const newBoard = makeMove(gameState.board, playerColor as PlayerColor, index, smartMove.to);
            const newDice = [...gameState.dice];
            const dieIndex = newDice.indexOf(smartMove.dieUsed);
            if (dieIndex > -1) newDice.splice(dieIndex, 1);

            const newState = { ...gameState, board: newBoard, dice: newDice };
            updateGame(newState);

            if (!DEMO_MODE && currentRoom) {
                supabase.from('games').update({ board_state: newState }).eq('room_id', currentRoom.id);
            }
        }
    }, [gameState, user, updateGame, currentRoom, players]);

    const playVsBot = useCallback(async () => {
        const addLog = useDebugStore.getState().addLog;
        addLog('Creating training room...', 'info');

        try {
            const { data, error } = await supabase
                .from('rooms')
                .insert({
                    name: `Entraînement ${user?.username || 'Solo'}`,
                    created_by: user?.id,
                    status: 'playing'
                })
                .select()
                .single();

            if (error) {
                addLog('Error creating training room', 'error', error);
                return null;
            }

            if (data) {
                addLog('Training room created', 'success', { roomId: data.id });
                return data.id;
            }
        } catch (err) {
            addLog('Exception creating training room', 'error', err);
            return null;
        }

        return null;
    }, [user]);

    return {
        socket: null,
        isConnected,
        rooms: roomsList,
        currentRoom,
        gameState,
        createRoom,
        joinRoom,
        leaveRoom,
        sendGameAction,
        sendMessage,
        playVsBot,
        handleCheckerClick,
        undoMove,
        canUndo: history.length > 0
    };
};
