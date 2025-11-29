import { useEffect, useRef, useCallback, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './useAuth';
import { useGameStore, Room, GameState } from '../stores/gameStore';
import { INITIAL_BOARD, getSmartMove, makeMove } from '../lib/gameLogic';

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

    // Local history for Undo functionality
    const [history, setHistory] = useState<GameState[]>([]);

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
                let botDice = dice1 === dice2 ? [dice1, dice1, dice1, dice1] : [dice1, dice2];

                // 2. Jouer les coups (Simulation simple)
                let currentBoard = JSON.parse(JSON.stringify(gameState.board));
                const botColor = 2; // Bot est Rouge (Player 2)

                // Essayer de jouer tous les dés
                for (let i = 0; i < botDice.length; i++) {
                    let moveFound = false;
                    const allPoints = [...Array(24).keys()];

                    for (const pointIndex of allPoints) {
                        const smartMove = getSmartMove(currentBoard, botColor, pointIndex, botDice);
                        if (smartMove) {
                            console.log(`🤖 Bot moves from ${pointIndex} to ${smartMove.to}`);
                            currentBoard = makeMove(currentBoard, botColor, pointIndex, smartMove.to);

                            const dieIndex = botDice.indexOf(smartMove.dieUsed);
                            if (dieIndex > -1) botDice.splice(dieIndex, 1);
                            i--;
                            moveFound = true;
                            break;
                        }
                    }
                    if (!moveFound) break;
                }

                addMessage({
                    id: `msg-bot-${Date.now()}`,
                    userId: 'bot-gnu',
                    username: 'GNU Backgammon',
                    text: `J'ai joué ${dice1} et ${dice2}. À toi !`,
                    timestamp: Date.now()
                });

                updateGame({
                    ...gameState,
                    board: currentBoard,
                    dice: [],
                    turn: user?.id || 'guest-1'
                });

            }, 2000);
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

        socketRef.current = io(SOCKET_URL, {
            auth: { token: 'mock-token', userId: user.id, username: user.username },
            transports: ['websocket'],
            reconnection: true,
        });

        const socket = socketRef.current;

        socket.on('connect', () => { setIsConnected(true); socket.emit('getRooms'); });
        socket.on('disconnect', () => { setIsConnected(false); });
        socket.on('roomsList', (updatedRooms: Room[]) => setRoomsList(updatedRooms));
        socket.on('roomUpdate', (room: Room) => setRoom(room));
        socket.on('gameStarted', (initialState: GameState) => updateGame(initialState));
        socket.on('gameStateUpdate', (newState: GameState) => updateGame(newState));
        socket.on('chatMessage', (msg: any) => addMessage(msg));

        return () => {
            if (socket) { socket.disconnect(); socketRef.current = null; setIsConnected(false); }
        };
    }, [user, setIsConnected, setRoomsList, setRoom, updateGame, addMessage]);

    const playVsBot = useCallback(() => {
        if (DEMO_MODE) {
            const botRoom: Room = {
                id: `room-bot-${Date.now()}`,
                name: 'Partie contre GNU',
                players: [
                    { id: user?.id || 'guest-1', username: user?.username || 'Guest', avatar: user?.avatar },
                    { id: 'bot-gnu', username: 'GNU Backgammon', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=GNU', score: 3500 }
                ],
                status: 'playing'
            };
            setRoom(botRoom);
            setPlayers(botRoom.players);
            const initialState = createMockGameState();
            initialState.turn = Math.random() > 0.5 ? (user?.id || 'guest-1') : 'bot-gnu';
            updateGame(initialState);
            return botRoom.id;
        }
    }, [user, setRoom, setPlayers, updateGame]);

    const createRoom = useCallback((roomName: string) => {
        if (DEMO_MODE) {
            const newRoom: Room = {
                id: `room-${Date.now()}`,
                name: roomName,
                players: [{ id: user?.id || 'guest-1', username: user?.username || 'Guest', avatar: user?.avatar }],
                status: 'waiting'
            };
            setRoomsList([...roomsList, newRoom]);
            return;
        }
        if (!socketRef.current) return;
        socketRef.current.emit('createRoom', { name: roomName });
    }, [user, roomsList, setRoomsList]);

    const joinRoom = useCallback((roomId: string) => {
        if (DEMO_MODE) {
            const room = roomsList.find(r => r.id === roomId);
            if (room) {
                const updatedRoom = {
                    ...room,
                    players: room.players.length < 2 ? [...room.players, { id: user?.id || 'guest-2', username: user?.username || 'Guest', avatar: user?.avatar }] : room.players,
                    status: room.players.length >= 1 ? 'playing' as const : 'waiting' as const
                };
                setRoom(updatedRoom);
                setPlayers(updatedRoom.players);
                if (updatedRoom.status === 'playing') {
                    updateGame(createMockGameState());
                }
            }
            return;
        }
        if (!socketRef.current) return;
        socketRef.current.emit('joinRoom', { roomId });
    }, [user, roomsList, setRoom, setPlayers, updateGame]);

    const leaveRoom = useCallback(() => {
        if (DEMO_MODE) { resetGame(); return; }
        if (!socketRef.current || !currentRoom) return;
        socketRef.current.emit('leaveRoom', { roomId: currentRoom.id });
        resetGame();
    }, [currentRoom, resetGame]);

    const handleCheckerClick = useCallback((index: number) => {
        if (!gameState || !user) return;

        const isMyTurn = gameState.turn === user.id || (DEMO_MODE && gameState.turn === 'guest-1');
        if (!isMyTurn) return;

        const playerColor = 1;

        const point = gameState.board.points[index];
        if (point.player !== playerColor || point.count === 0) return;

        const smartMove = getSmartMove(gameState.board, playerColor, index, gameState.dice);

        if (smartMove) {
            console.log('🚀 Smart Move:', smartMove);
            setHistory(prev => [...prev, JSON.parse(JSON.stringify(gameState))]);

            const newBoard = makeMove(gameState.board, playerColor, index, smartMove.to);
            const newDice = [...gameState.dice];
            const dieIndex = newDice.indexOf(smartMove.dieUsed);
            if (dieIndex > -1) newDice.splice(dieIndex, 1);

            updateGame({
                ...gameState,
                board: newBoard,
                dice: newDice
            });
        }
    }, [gameState, user, updateGame]);

    const undoMove = useCallback(() => {
        if (history.length === 0) return;
        const previousState = history[history.length - 1];
        updateGame(previousState);
        setHistory(prev => prev.slice(0, -1));
    }, [history, updateGame]);

    const sendGameAction = useCallback((action: string, payload: any) => {
        if (DEMO_MODE) {
            if (action === 'rollDice' && gameState) {
                setHistory([]);
                const dice1 = Math.floor(Math.random() * 6) + 1;
                const dice2 = Math.floor(Math.random() * 6) + 1;
                updateGame({
                    ...gameState,
                    dice: dice1 === dice2 ? [dice1, dice2, dice1, dice2] : [dice1, dice2]
                });
            }

            if (action === 'move' && gameState) {
                const { from, to } = payload;
                const playerColor = 1;

                // Drag Inverse (Undo)
                const isBackwardMove = to > from; // Pour Blanc (1), avancer c'est from > to. Donc reculer c'est to > from.

                if (isBackwardMove && history.length > 0) {
                    undoMove();
                    return;
                }

                const distance = from - to;
                const dieIndex = gameState.dice.indexOf(distance);

                if (dieIndex > -1) {
                    setHistory(prev => [...prev, JSON.parse(JSON.stringify(gameState))]);
                    const newBoard = makeMove(gameState.board, playerColor, from, to);
                    const newDice = [...gameState.dice];
                    newDice.splice(dieIndex, 1);

                    updateGame({
                        ...gameState,
                        board: newBoard,
                        dice: newDice
                    });
                }
            }
            return;
        }
        if (!socketRef.current) return;
        socketRef.current.emit('gameAction', { action, payload });
    }, [gameState, updateGame, history, undoMove]);

    const sendMessage = useCallback((message: string) => {
        if (DEMO_MODE) {
            addMessage({ id: `msg-${Date.now()}`, userId: user?.id || 'guest-1', username: user?.username || 'Guest', text: message, timestamp: Date.now() });
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
        playVsBot,
        handleCheckerClick,
        undoMove,
        canUndo: history.length > 0
    };
};
