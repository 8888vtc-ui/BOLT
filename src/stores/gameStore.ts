import { create } from 'zustand';

// Types
export interface User {
    id: string;
    username: string;
    avatar?: string;
}

export interface Player {
    id: string;
    username: string;
    score?: number;
    color?: 'white' | 'black'; // ou 1 | 2
    avatar?: string;
}

export interface Room {
    id: string;
    name: string;
    players: Player[];
    status: 'waiting' | 'playing';
    profiles?: {
        username: string;
        avatar_url: string;
    };
}

export interface GameState {
    board: any; // On pourra typer ça plus finement avec tes types existants
    dice: number[];
    turn: string; // ID du joueur
    score: { [playerId: string]: number };
    cubeValue: number;
    doubleValue?: number;
    canDouble?: boolean;
    matchLength?: number;
    currentPlayer?: number;
}

export interface ChatMessage {
    id: string;
    userId: string;
    username: string;
    text: string;
    timestamp: number;
}

interface GameStore {
    // État
    currentUser: User | null;
    currentRoom: Room | null;
    players: Player[];
    gameState: GameState | null;
    messages: ChatMessage[];
    isConnected: boolean;
    roomsList: Room[]; // Pour le lobby

    // Actions
    setUser: (user: User | null) => void;
    setRoom: (room: Room | null) => void;
    setPlayers: (players: Player[]) => void;
    updateGame: (gameState: GameState) => void;
    addMessage: (message: ChatMessage) => void;
    setMessages: (messages: ChatMessage[]) => void;
    setIsConnected: (status: boolean) => void;
    setRoomsList: (rooms: Room[]) => void;

    // Reset pour quitter une partie proprement
    resetGame: () => void;
}

export const useGameStore = create<GameStore>((set) => ({
    // État initial
    currentUser: null,
    currentRoom: null,
    players: [],
    gameState: null,
    messages: [],
    isConnected: false,
    roomsList: [],

    // Actions
    setUser: (user) => set({ currentUser: user }),
    setRoom: (room) => set({ currentRoom: room }),
    setPlayers: (players) => set({ players }),
    updateGame: (gameState) => set({ gameState }),
    addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),
    setMessages: (messages) => set({ messages }),
    setIsConnected: (status) => set({ isConnected: status }),
    setRoomsList: (rooms) => set({ roomsList: rooms }),

    resetGame: () => set({
        currentRoom: null,
        players: [],
        gameState: null,
        messages: []
    })
}));
