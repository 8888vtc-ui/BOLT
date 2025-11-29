import { useEffect, useRef, useCallback, useState } from 'react';
import { useAuth } from './useAuth';
import { useGameStore, Room, GameState } from '../stores/gameStore';
import { INITIAL_BOARD, getSmartMove, makeMove } from '../lib/gameLogic';
import { supabase } from '../lib/supabase';

const DEMO_MODE = !import.meta.env.VITE_SUPABASE_URL;

// --- Mock Data for Demo Mode ---
// --- Mock Data for Demo Mode ---
const createMockGameState = (): GameState => ({
    board: INITIAL_BOARD,
    dice: [],
    turn: '', // Pas de tour par défaut
    score: {}, // Score vide
    cubeValue: 1,
    availableMoves: [],
    doubleValue: 1,
    canDouble: true,
    matchLength: 5,
    currentPlayer: 1
});

const createMockRooms = (): Room[] => []; // Plus de fausses salles

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
        console.log('Joining room:', roomId);

        if (DEMO_MODE) {
            console.log('Demo mode join');
            const room = roomsList.find(r => r.id === roomId) || {
                id: roomId,
                name: 'Salle Demo',
                status: 'playing',
                players: []
            };
            setRoom(room as Room);
            updateGame(createMockGameState());
            return;
        }

        try {
            if (user) {
                await supabase.from('room_participants').upsert({ room_id: roomId, user_id: user.id }).select();
            }

            const { data: roomData, error: roomError } = await supabase.from('rooms').select('*').eq('id', roomId).single();

            if (roomError) {
                console.error('Error fetching room:', roomError);
                // Fallback si on ne peut pas récupérer la salle (ex: latence)
                setRoom({ id: roomId, name: 'Partie en cours', status: 'playing', players: [] });
            } else if (roomData) {
                setRoom(roomData);
            }

            if (channelRef.current) supabase.removeChannel(channelRef.current);

            const channel = supabase.channel(`room:${roomId}`)
                .on('postgres_changes', { event: '*', schema: 'public', table: 'games', filter: `room_id=eq.${roomId}` }, (payload) => {
                    const newGame = payload.new as any;
                    if (newGame && newGame.board_state) {
                        updateGame(newGame.board_state);
                    }
                })
                .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `room_id=eq.${roomId}` }, (payload) => {
                    const msg = payload.new as any;
                    addMessage({
                        id: msg.id,
                        userId: msg.user_id,
                        username: 'Joueur', // On améliorera ça plus tard
                        text: msg.content,
                        timestamp: new Date(msg.created_at).getTime()
                    });
                })
                .subscribe((status) => {
                    console.log('Subscription status:', status);
                });

            channelRef.current = channel;

            // Récupération ou Création de l'état du jeu
            const { data: gameData, error: gameError } = await supabase.from('games').select('*').eq('room_id', roomId).single();

            if (gameData) {
                console.log('Game found, updating state');
                updateGame(gameData.board_state);
            } else {
                console.log('No game found, creating new game');
                const initialState = createMockGameState();
                // On essaie de créer, si ça échoue (race condition), on ignore
                const { error: insertError } = await supabase.from('games').insert({
                    room_id: roomId,
                    board_state: initialState,
                    white_player_id: user?.id
                });

                if (insertError) {
                    console.warn('Error creating game (might already exist):', insertError);
                    // Retry fetch
                    const { data: retryGame } = await supabase.from('games').select('*').eq('room_id', roomId).single();
                    if (retryGame) updateGame(retryGame.board_state);
                    else updateGame(initialState); // Fallback ultime
                } else {
                    updateGame(initialState);
                }
            }
        } catch (err) {
            console.error('Critical error joining room:', err);
            // Pour ne pas bloquer l'UI
            setRoom({ id: roomId, name: 'Erreur Connexion', status: 'playing', players: [] });
            updateGame(createMockGameState());
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
        let newState = { ...gameState } as GameState;

        if (action === 'rollDice') {
            setHistory([]);
            const dice1 = Math.floor(Math.random() * 6) + 1;
            const dice2 = Math.floor(Math.random() * 6) + 1;
            newState.dice = dice1 === dice2 ? [dice1, dice1, dice1, dice1] : [dice1, dice2];
        } else if (action === 'move') {
            const { from, to } = payload;
            const playerColor = 1;

            const isBackwardMove = to > from;
            if (isBackwardMove && history.length > 0) {
                undoMove();
                return;
            }

            const distance = from - to;
            const currentDice = newState.dice || [];
            const dieIndex = currentDice.indexOf(distance);

            if (dieIndex > -1) {
                setHistory(prev => [...prev, JSON.parse(JSON.stringify(gameState))]);
                const newBoard = makeMove(newState.board, playerColor, from, to);
                const newDice = [...currentDice];
                newDice.splice(dieIndex, 1);

                newState.board = newBoard;
                newState.dice = newDice;
            }
        }

        if (newState.board) {
            updateGame(newState);
        }

        if (!DEMO_MODE && currentRoom && newState.board) {
            await supabase.from('games').update({ board_state: newState }).eq('room_id', currentRoom.id);
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
