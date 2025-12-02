import { create } from 'zustand';

interface LogEntry {
    id: string;
    timestamp: string;
    message: string;
    type: 'info' | 'error' | 'success' | 'warning';
    data?: any;
}

interface DebugStore {
    logs: LogEntry[];
    addLog: (message: string, type?: 'info' | 'error' | 'success' | 'warning', data?: any) => void;
    clearLogs: () => void;
    isVisible: boolean;
    toggleVisibility: () => void;
    filter: 'all' | 'info' | 'error' | 'success' | 'warning';
    setFilter: (filter: 'all' | 'info' | 'error' | 'success' | 'warning') => void;
    searchTerm: string;
    setSearchTerm: (term: string) => void;
}

export const useDebugStore = create<DebugStore>((set) => ({
    logs: [],
    isVisible: true, // Visible par défaut pour le debug
    filter: 'all',
    searchTerm: '',
    addLog: (message, type = 'info', data) => {
        const logEntry = {
            id: Math.random().toString(36).substr(2, 9),
            timestamp: new Date().toLocaleTimeString('fr-FR', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            message,
            type,
            data
        };
        set((state) => ({
            logs: [logEntry, ...state.logs].slice(0, 200) // Garder les 200 derniers logs
        }));
        // Aussi logger dans la console pour le debug
        if (type === 'error') {
            console.error(`[${logEntry.timestamp}] ${message}`, data);
        } else if (type === 'warning') {
            console.warn(`[${logEntry.timestamp}] ${message}`, data);
        } else {
            console.log(`[${logEntry.timestamp}] ${message}`, data || '');
        }
    },
    clearLogs: () => set({ logs: [] }),
    toggleVisibility: () => set((state) => ({ isVisible: !state.isVisible })),
    setFilter: (filter) => set({ filter }),
    setSearchTerm: (searchTerm) => set({ searchTerm })
}));
