import { useEffect, useRef, useCallback, useState } from 'react';
import { useAuth } from './useAuth';
import { useGameStore, Room, GameState } from '../stores/gameStore';
import { INITIAL_BOARD, getSmartMove, makeMove } from '../lib/gameLogic';
import { supabase } from '../lib/supabase';
import { useDebugStore } from '../stores/debugStore';

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
        roomsList
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
    const sendGameAction = useCallback(async (action: string, payload: any) => {
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
            const playerColor = 1;

            const isBackwardMove = to > from;
            if (isBackwardMove && history.length > 0) {
                undoMove();
                return;
            }

            const distance = Math.abs(from - to);
            const currentDice = newState.dice || [];

            let dieUsed = -1;
            if (playerColor === 1) { // Blanc (23 -> 0)
                if (from > to) dieUsed = from - to;
            } else {
                if (to > from) dieUsed = to - from;
            }

            const dieIndex = currentDice.indexOf(dieUsed);

            if (dieIndex > -1) {
                setHistory(prev => [...prev, JSON.parse(JSON.stringify(gameState))]);
                const newBoard = makeMove(newState.board, playerColor, from, to);
                const newDice = [...currentDice];
                newDice.splice(dieIndex, 1);

                newState.board = newBoard;
                newState.dice = newDice;
                addLog('Move executed locally', 'success');
            } else {
                addLog('Invalid move or no matching die', 'error', { from, to, dieUsed, dice: currentDice });
                return;
            }
        }

        if (newState.board) {
            updateGame(newState);
        }

        if (!DEMO_MODE && currentRoom && newState.board) {
            const { error } = await supabase.from('games').update({ board_state: newState }).eq('room_id', currentRoom.id);
            if (error) {
                addLog('Error updating game in DB', 'error', error);
            } else {
                addLog('Game updated in DB', 'success');
            }
        }

    }, [gameState, updateGame, history, currentRoom, undoMove]);

    const handleCheckerClick = useCallback((index: number) => {
        if (!gameState || !user) return;
        const playerColor = 1;
        const point = gameState.board.points[index];
        if (point.player !== playerColor || point.count === 0) return;

        const smartMove = getSmartMove(gameState.board, playerColor, index, gameState.dice);
        if (smartMove) {
            setHistory(prev => [...prev, JSON.parse(JSON.stringify(gameState))]);
            const newBoard = makeMove(gameState.board, playerColor, index, smartMove.to);
            const newDice = [...gameState.dice];
            const dieIndex = newDice.indexOf(smartMove.dieUsed);
            if (dieIndex > -1) newDice.splice(dieIndex, 1);

            const newState = { ...gameState, board: newBoard, dice: newDice };
            updateGame(newState);

            if (!DEMO_MODE && currentRoom) {
                supabase.from('games').update({ board_state: newState }).eq('room_id', currentRoom.id);
            }
        }
    }, [gameState, user, updateGame, currentRoom]);

    const playVsBot = useCallback(() => {
        return 'bot-room-id';
    }, []);

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
