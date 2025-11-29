import { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './useAuth';
import { useGameStore, Room, GameState } from '../stores/gameStore';

// URL de ton backend local
const SOCKET_URL = 'http://localhost:8888';

// Mode démo : données mockées pour tester l'UI
const DEMO_MODE = true; // Mettre à false quand le backend est prêt

// Données de démo
const createMockGameState = (): GameState => ({
    board: {
        points: Array.from({ length: 24 }, (_, i) => {
            // Configuration initiale standard du backgammon
            if (i === 0) return { player: 2, count: 2 };
            if (i === 5) return { player: 1, count: 5 };
            if (i === 7) return { player: 1, count: 3 };
            if (i === 11) return { player: 2, count: 5 };
            if (i === 12) return { player: 1, count: 5 };
            if (i === 16) return { player: 2, count: 3 };
            if (i === 18) return { player: 2, count: 5 };
            if (i === 23) return { player: 1, count: 2 };
            return { player: null, count: 0 };
        }),
        bar: { player1: 0, player2: 0 },
        off: { player1: 0, player2: 0 }
    },
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
        updateGame,
        addMessage,
        resetGame,
        currentRoom,
        gameState,
        isConnected,
        roomsList
    } = useGameStore();

    // Mode démo : initialisation des données mockées
    useEffect(() => {
        if (DEMO_MODE && user) {
            console.log('🎮 DEMO MODE: Using mock data');
            setIsConnected(true);
            setRoomsList(createMockRooms());
            return;
        }

        // Mode production : connexion WebSocket réelle
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

    // Actions
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
                // Ajouter le joueur actuel à la room
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

                // Initialiser le gameState si la partie commence
                if (updatedRoom.status === 'playing') {
                    updateGame(createMockGameState());
                }
            }
            return;
        }

        if (!socketRef.current) return;
        console.log('👋 Joining room:', roomId);
        socketRef.current.emit('joinRoom', { roomId });
    }, [user, roomsList, setRoom, updateGame]);

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

            // Simuler le lancer de dés
            if (action === 'rollDice' && gameState) {
                const dice1 = Math.floor(Math.random() * 6) + 1;
                const dice2 = Math.floor(Math.random() * 6) + 1;
                updateGame({
                    ...gameState,
                    dice: dice1 === dice2 ? [dice1, dice2, dice1, dice2] : [dice1, dice2]
                });
            }

            // Simuler un mouvement
            if (action === 'move' && gameState) {
                // Ici tu pourrais implémenter une vraie logique de mouvement
                // Pour l'instant on vide juste les dés après un mouvement
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
        sendMessage
    };
};
