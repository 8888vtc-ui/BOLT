import { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './useAuth';
import { useGameStore, Room, GameState } from '../stores/gameStore';
import { INITIAL_BOARD } from '../lib/gameLogic';

const SOCKET_URL = 'http://localhost:8888';
const DEMO_MODE = true;

const createMockGameState = (): GameState => ({
    board: INITIAL_BOARD,
    dice: [],
    turn: 'guest-1',
    score: { 'guest-1': 0, 'guest-2': 0 },
    cubeValue: 1
});

const createMockRooms = (): Room[] => [
    {
        id: 'room-1',
        name: 'Table des Champions',
        players: [
            { id: 'player-1', username: 'Magnus', score: 15, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Magnus' },
            { id: 'player-2', username: 'Kasparov', score: 12, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Kasparov' }
        ],
        status: 'playing'
    },
    {
        id: 'room-2',
        name: 'Débutants Bienvenus',
        players: [
            { id: 'player-3', username: 'Alice', score: 3, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice' }
        ],
        status: 'waiting'
    },
    {
        id: 'room-3',
        name: 'Arena Pro',
        players: [
            { id: 'player-4', username: 'Bobby', score: 8, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bobby' },
            { id: 'player-5', username: 'Garry', score: 9, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Garry' }
        ],
        status: 'playing'
    }
];

export const useGameSocket = () => {
    const socketRef = useRef<Socket | null>(null);
    const { user } = useAuth();

    const {
        setIsConnected,
        setRoomsList,
        setRoom,
        setPlayers,
        updateGame,
        addMessage,
        resetGame,
        currentRoom,
        gameState,
        isConnected,
        roomsList
    } = useGameStore();

    // Bot Logic
    useEffect(() => {
        if (DEMO_MODE && currentRoom?.players.some(p => p.id === 'bot-gnu') && gameState?.turn === 'bot-gnu') {
            const timer = setTimeout(() => {
                console.log('🤖 Bot is playing...');

                // 1. Lancer les dés
                const dice1 = Math.floor(Math.random() * 6) + 1;
                const dice2 = Math.floor(Math.random() * 6) + 1;

                addMessage({
                    id: `msg-bot-${Date.now()}`,
                    userId: 'bot-gnu',
                    username: 'GNU Backgammon',
                    text: `J'ai joué ${dice1} et ${dice2}. À toi !`,
                    timestamp: Date.now()
                });

                updateGame({
                    ...gameState,
                    dice: [], // Reset dice
                    turn: user?.id || 'guest-1' // Rend la main au joueur
                });

            }, 3000); // Délai de réflexion simulé
            return () => clearTimeout(timer);
        }
    }, [gameState, currentRoom, user, updateGame, addMessage]);

    useEffect(() => {
        if (DEMO_MODE && user) {
            console.log('🎮 DEMO MODE: Using mock data');
            setIsConnected(true);
            setRoomsList(createMockRooms());
            return;
        }

        if (!user) return;
        if (socketRef.current?.connected) return;

        console.log('🔌 Connecting to WebSocket:', SOCKET_URL);

        socketRef.current = io(SOCKET_URL, {
            auth: {
                token: 'mock-token',
                userId: user.id,
                username: user.username
            },
            transports: ['websocket'],
            reconnection: true,
        });

        const socket = socketRef.current;

        socket.on('connect', () => {
            console.log('✅ Connected to WebSocket');
            setIsConnected(true);
            socket.emit('getRooms');
        });

        socket.on('disconnect', () => {
            console.log('❌ Disconnected from WebSocket');
            setIsConnected(false);
        });

        socket.on('connect_error', (err) => {
            console.error('Connection error:', err);
        });

        socket.on('roomsList', (updatedRooms: Room[]) => {
            console.log('🏠 Rooms updated:', updatedRooms);
            setRoomsList(updatedRooms);
        });

        socket.on('roomUpdate', (room: Room) => {
            console.log('📝 Room updated:', room);
            setRoom(room);
        });

        socket.on('gameStarted', (initialState: GameState) => {
            console.log('🎲 Game started:', initialState);
            updateGame(initialState);
        });

        socket.on('gameStateUpdate', (newState: GameState) => {
            updateGame(newState);
        });

        socket.on('chatMessage', (msg: any) => {
            addMessage(msg);
        });

        return () => {
            if (socket) {
                socket.disconnect();
                socketRef.current = null;
                setIsConnected(false);
            }
        };
    }, [user, setIsConnected, setRoomsList, setRoom, updateGame, addMessage]);

    const playVsBot = useCallback(() => {
        if (DEMO_MODE) {
            console.log('🤖 DEMO: Starting game vs Bot');
            const botRoom: Room = {
                id: `room-bot-${Date.now()}`,
                name: 'Partie contre GNU',
                players: [
                    {
                        id: user?.id || 'guest-1',
                        username: user?.username || 'Guest',
                        avatar: user?.avatar
                    },
                    {
                        id: 'bot-gnu',
                        username: 'GNU Backgammon',
                        avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=GNU',
                        score: 3500
                    }
                ],
                status: 'playing'
            };

            setRoom(botRoom);
            setPlayers(botRoom.players);

            // Initialiser le jeu
            const initialState = createMockGameState();
            // Décider qui commence (50/50)
            initialState.turn = Math.random() > 0.5 ? (user?.id || 'guest-1') : 'bot-gnu';

            updateGame(initialState);
            return botRoom.id;
        }
    }, [user, setRoom, setPlayers, updateGame]);

    const createRoom = useCallback((roomName: string) => {
        if (DEMO_MODE) {
            console.log('🎮 DEMO: Creating room:', roomName);
            const newRoom: Room = {
                id: `room-${Date.now()}`,
                name: roomName,
                players: [
                    {
                        id: user?.id || 'guest-1',
                        username: user?.username || 'Guest',
                        avatar: user?.avatar
                    }
                ],
                status: 'waiting'
            };
            setRoomsList([...roomsList, newRoom]);
            return;
        }

        if (!socketRef.current) return;
        console.log('🔨 Creating room:', roomName);
        socketRef.current.emit('createRoom', { name: roomName });
    }, [user, roomsList, setRoomsList]);

    const joinRoom = useCallback((roomId: string) => {
        if (DEMO_MODE) {
            console.log('🎮 DEMO: Joining room:', roomId);
            const room = roomsList.find(r => r.id === roomId);
            if (room) {
                const updatedRoom = {
                    ...room,
                    players: room.players.length < 2 ? [
                        ...room.players,
                        {
                            id: user?.id || 'guest-2',
                            username: user?.username || 'Guest',
                            avatar: user?.avatar
                        }
                    ] : room.players,
                    status: room.players.length >= 1 ? 'playing' as const : 'waiting' as const
                };
                setRoom(updatedRoom);
                setPlayers(updatedRoom.players); // FIX: Mettre à jour les players

                if (updatedRoom.status === 'playing') {
                    const mockState = createMockGameState();
                    console.log('🎲 Initializing game state with board:', mockState.board);
                    updateGame(mockState);
                }
            }
            return;
        }

        if (!socketRef.current) return;
        console.log('👋 Joining room:', roomId);
        socketRef.current.emit('joinRoom', { roomId });
    }, [user, roomsList, setRoom, setPlayers, updateGame]);

    const leaveRoom = useCallback(() => {
        if (DEMO_MODE) {
            console.log('🎮 DEMO: Leaving room');
            resetGame();
            return;
        }

        if (!socketRef.current || !currentRoom) return;
        console.log('🚪 Leaving room');
        socketRef.current.emit('leaveRoom', { roomId: currentRoom.id });
        resetGame();
    }, [currentRoom, resetGame]);

    const sendGameAction = useCallback((action: string, payload: any) => {
        if (DEMO_MODE) {
            console.log('🎮 DEMO: Game action:', action, payload);

            if (action === 'rollDice' && gameState) {
                const dice1 = Math.floor(Math.random() * 6) + 1;
                const dice2 = Math.floor(Math.random() * 6) + 1;
                updateGame({
                    ...gameState,
                    dice: dice1 === dice2 ? [dice1, dice2, dice1, dice2] : [dice1, dice2]
                });
            }

            if (action === 'move' && gameState) {
                updateGame({
                    ...gameState,
                    dice: []
                });
            }

            return;
        }

        if (!socketRef.current) return;
        socketRef.current.emit('gameAction', { action, payload });
    }, [gameState, updateGame]);

    const sendMessage = useCallback((message: string) => {
        if (DEMO_MODE) {
            console.log('🎮 DEMO: Sending message:', message);
            addMessage({
                id: `msg-${Date.now()}`,
                userId: user?.id || 'guest-1',
                username: user?.username || 'Guest',
                text: message,
                timestamp: Date.now()
            });
            return;
        }

        if (!socketRef.current || !currentRoom) return;
        socketRef.current.emit('chatMessage', { roomId: currentRoom.id, message });
    }, [user, currentRoom, addMessage]);

    return {
        socket: socketRef.current,
        isConnected,
        rooms: roomsList,
        currentRoom,
        gameState,
        createRoom,
        joinRoom,
        leaveRoom,
        sendGameAction,
        sendMessage,
        playVsBot
    };
};
