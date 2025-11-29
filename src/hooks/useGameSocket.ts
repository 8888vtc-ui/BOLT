import { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './useAuth';
import { useGameStore, Room, GameState } from '../stores/gameStore';

// URL de ton backend local
const SOCKET_URL = 'http://localhost:8888';

export const useGameSocket = () => {
    const socketRef = useRef<Socket | null>(null);
    const { user } = useAuth();

    // Accès au store Zustand
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

    // Initialisation de la connexion
    useEffect(() => {
        if (!user) return;

        // Évite les doubles connexions
        if (socketRef.current?.connected) return;

        console.log('🔌 Connecting to WebSocket:', SOCKET_URL);

        socketRef.current = io(SOCKET_URL, {
            auth: {
                token: 'mock-token', // À remplacer par le vrai token si besoin
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
            // Demander la liste des rooms dès la connexion
            socket.emit('getRooms');
        });

        socket.on('disconnect', () => {
            console.log('❌ Disconnected from WebSocket');
            setIsConnected(false);
        });

        socket.on('connect_error', (err) => {
            console.error('Connection error:', err);
        });

        // --- Écouteurs d'événements ---

        // Mise à jour de la liste des rooms
        socket.on('roomsList', (updatedRooms: Room[]) => {
            console.log('🏠 Rooms updated:', updatedRooms);
            setRoomsList(updatedRooms);
        });

        // Mise à jour d'une room spécifique (quand on est dedans)
        socket.on('roomUpdate', (room: Room) => {
            console.log('📝 Room updated:', room);
            setRoom(room);
        });

        // Début de partie
        socket.on('gameStarted', (initialState: GameState) => {
            console.log('🎲 Game started:', initialState);
            updateGame(initialState);
        });

        // Mise à jour de l'état du jeu
        socket.on('gameStateUpdate', (newState: GameState) => {
            updateGame(newState);
        });

        // Chat
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

    // --- Actions ---

    const createRoom = useCallback((roomName: string) => {
        if (!socketRef.current) return;
        console.log('🔨 Creating room:', roomName);
        socketRef.current.emit('createRoom', { name: roomName });
    }, []);

    const joinRoom = useCallback((roomId: string) => {
        if (!socketRef.current) return;
        console.log('👋 Joining room:', roomId);
        socketRef.current.emit('joinRoom', { roomId });
    }, []);

    const leaveRoom = useCallback(() => {
        if (!socketRef.current || !currentRoom) return;
        console.log('🚪 Leaving room');
        socketRef.current.emit('leaveRoom', { roomId: currentRoom.id });
        resetGame();
    }, [currentRoom, resetGame]);

    const sendGameAction = useCallback((action: string, payload: any) => {
        if (!socketRef.current) return;
        socketRef.current.emit('gameAction', { action, payload });
    }, []);

    const sendMessage = useCallback((message: string) => {
        if (!socketRef.current || !currentRoom) return;
        socketRef.current.emit('chatMessage', { roomId: currentRoom.id, message });
    }, [currentRoom]);

    return {
        socket: socketRef.current,
        isConnected,
        rooms: roomsList, // Alias pour compatibilité
        currentRoom,
        gameState,
        createRoom,
        joinRoom,
        leaveRoom,
        sendGameAction,
        sendMessage
    };
};
