import { create } from 'zustand';

interface LogEntry {
    id: string;
    timestamp: string;
    message: string;
    type: 'info' | 'error' | 'success';
    data?: any;
}

interface DebugStore {
    logs: LogEntry[];
    addLog: (message: string, type?: 'info' | 'error' | 'success', data?: any) => void;
    clearLogs: () => void;
    isVisible: boolean;
    toggleVisibility: () => void;
}

export const useDebugStore = create<DebugStore>((set) => ({
    logs: [],
    isVisible: true, // Visible par défaut pour le debug
    addLog: (message, type = 'info', data) => set((state) => ({
        logs: [
            {
                id: Math.random().toString(36).substr(2, 9),
                timestamp: new Date().toLocaleTimeString(),
                message,
                type,
                data
            },
            ...state.logs
        ].slice(0, 50) // Garder les 50 derniers logs
    })),
    clearLogs: () => set({ logs: [] }),
    toggleVisibility: () => set((state) => ({ isVisible: !state.isVisible }))
}));
