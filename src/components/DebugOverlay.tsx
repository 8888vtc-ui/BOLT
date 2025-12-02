import React, { useMemo } from 'react';
import { useDebugStore } from '../stores/debugStore';
import { X, Terminal, Trash2, Search, Filter, Download } from 'lucide-react';

export default function DebugOverlay() {
    const { logs, isVisible, toggleVisibility, clearLogs, filter, setFilter, searchTerm, setSearchTerm } = useDebugStore();

    // Filtrer les logs
    const filteredLogs = useMemo(() => {
        let filtered = logs;
        
        // Filtre par type
        if (filter !== 'all') {
            filtered = filtered.filter(log => log.type === filter);
        }
        
        // Recherche
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(log => 
                log.message.toLowerCase().includes(term) ||
                JSON.stringify(log.data || {}).toLowerCase().includes(term)
            );
        }
        
        return filtered;
    }, [logs, filter, searchTerm]);

    // Compteurs
    const counts = useMemo(() => ({
        all: logs.length,
        info: logs.filter(l => l.type === 'info').length,
        error: logs.filter(l => l.type === 'error').length,
        warning: logs.filter(l => l.type === 'warning').length,
        success: logs.filter(l => l.type === 'success').length,
    }), [logs]);

    // Export des logs
    const exportLogs = () => {
        const dataStr = JSON.stringify(logs, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `gurugammon-logs-${new Date().toISOString()}.json`;
        link.click();
        URL.revokeObjectURL(url);
    };

    if (!isVisible) {
        return (
            <button
                onClick={toggleVisibility}
                className="fixed bottom-4 left-4 z-50 bg-black/80 text-[#FFD700] p-2 rounded-full border border-[#FFD700]/30 hover:bg-black relative"
            >
                <Terminal className="w-5 h-5" />
                {counts.error > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] rounded-full w-5 h-5 flex items-center justify-center font-bold">
                        {counts.error}
                    </span>
                )}
            </button>
        );
    }

    return (
        <div className="fixed bottom-4 left-4 z-50 w-[500px] max-h-[600px] flex flex-col bg-black/95 border border-[#FFD700]/30 rounded-lg shadow-2xl font-mono text-xs overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-2 bg-[#111] border-b border-white/10">
                <div className="flex items-center gap-2 text-[#FFD700] font-bold">
                    <Terminal className="w-4 h-4" />
                    <span>SYSTEM LOGS</span>
                    <span className="text-gray-400 text-[10px]">({counts.all})</span>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={exportLogs} className="text-gray-400 hover:text-blue-400" title="Exporter les logs">
                        <Download className="w-4 h-4" />
                    </button>
                    <button onClick={clearLogs} className="text-gray-400 hover:text-red-400" title="Effacer les logs">
                        <Trash2 className="w-4 h-4" />
                    </button>
                    <button onClick={toggleVisibility} className="text-gray-400 hover:text-white" title="Masquer">
                        <X className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Filtres et Recherche */}
            <div className="p-2 bg-[#0a0a0a] border-b border-white/5 space-y-2">
                {/* Recherche */}
                <div className="relative">
                    <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-500" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Rechercher..."
                        className="w-full pl-7 pr-2 py-1 bg-black/50 border border-white/10 rounded text-white placeholder-gray-500 focus:outline-none focus:border-[#FFD700]/50"
                    />
                </div>
                
                {/* Filtres */}
                <div className="flex items-center gap-1 flex-wrap">
                    <button
                        onClick={() => setFilter('all')}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors ${
                            filter === 'all' ? 'bg-[#FFD700] text-black' : 'bg-white/10 text-gray-400 hover:bg-white/20'
                        }`}
                    >
                        Tous ({counts.all})
                    </button>
                    <button
                        onClick={() => setFilter('info')}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors ${
                            filter === 'info' ? 'bg-blue-500 text-white' : 'bg-white/10 text-gray-400 hover:bg-white/20'
                        }`}
                    >
                        Info ({counts.info})
                    </button>
                    <button
                        onClick={() => setFilter('success')}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors ${
                            filter === 'success' ? 'bg-green-500 text-white' : 'bg-white/10 text-gray-400 hover:bg-white/20'
                        }`}
                    >
                        OK ({counts.success})
                    </button>
                    <button
                        onClick={() => setFilter('warning')}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors ${
                            filter === 'warning' ? 'bg-yellow-500 text-black' : 'bg-white/10 text-gray-400 hover:bg-white/20'
                        }`}
                    >
                        ⚠ ({counts.warning})
                    </button>
                    <button
                        onClick={() => setFilter('error')}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors ${
                            filter === 'error' ? 'bg-red-500 text-white' : 'bg-white/10 text-gray-400 hover:bg-white/20'
                        }`}
                    >
                        ❌ ({counts.error})
                    </button>
                </div>
            </div>

            {/* Logs List */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                {filteredLogs.length === 0 && (
                    <div className="text-gray-600 italic text-center py-4">
                        {logs.length === 0 ? 'Aucun log...' : 'Aucun log ne correspond aux filtres'}
                    </div>
                )}
                {filteredLogs.map((log) => (
                    <div key={log.id} className="border-b border-white/5 pb-1 last:border-0 hover:bg-white/5 transition-colors">
                        <div className="flex items-start gap-2">
                            <span className="text-gray-500 shrink-0 text-[10px]">[{log.timestamp}]</span>
                            <span className={`break-words flex-1 ${
                                log.type === 'error' ? 'text-red-400 font-bold' :
                                log.type === 'success' ? 'text-green-400' :
                                log.type === 'warning' ? 'text-yellow-400' :
                                'text-blue-300'
                            }`}>
                                {log.message}
                            </span>
                        </div>
                        {log.data && (
                            <pre className="mt-1 text-[10px] text-gray-500 overflow-x-auto bg-black/50 p-1 rounded max-h-32 overflow-y-auto">
                                {JSON.stringify(log.data, null, 2)}
                            </pre>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
