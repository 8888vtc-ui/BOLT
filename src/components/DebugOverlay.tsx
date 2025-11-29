import React from 'react';
import { useDebugStore } from '../stores/debugStore';
import { X, Terminal, Trash2 } from 'lucide-react';

export default function DebugOverlay() {
    const { logs, isVisible, toggleVisibility, clearLogs } = useDebugStore();

    if (!isVisible) {
        return (
            <button
                onClick={toggleVisibility}
                className="fixed bottom-4 left-4 z-50 bg-black/80 text-[#FFD700] p-2 rounded-full border border-[#FFD700]/30 hover:bg-black"
            >
                <Terminal className="w-5 h-5" />
            </button>
        );
    }

    return (
        <div className="fixed bottom-4 left-4 z-50 w-96 max-h-[400px] flex flex-col bg-black/90 border border-[#FFD700]/30 rounded-lg shadow-2xl font-mono text-xs overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-2 bg-[#111] border-b border-white/10">
                <div className="flex items-center gap-2 text-[#FFD700] font-bold">
                    <Terminal className="w-4 h-4" />
                    <span>SYSTEM LOGS</span>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={clearLogs} className="text-gray-400 hover:text-red-400">
                        <Trash2 className="w-4 h-4" />
                    </button>
                    <button onClick={toggleVisibility} className="text-gray-400 hover:text-white">
                        <X className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Logs List */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                {logs.length === 0 && (
                    <div className="text-gray-600 italic text-center py-4">Aucun log...</div>
                )}
                {logs.map((log) => (
                    <div key={log.id} className="border-b border-white/5 pb-1 last:border-0">
                        <div className="flex items-start gap-2">
                            <span className="text-gray-500 shrink-0">[{log.timestamp}]</span>
                            <span className={`break-words ${log.type === 'error' ? 'text-red-400 font-bold' :
                                    log.type === 'success' ? 'text-green-400' : 'text-blue-300'
                                }`}>
                                {log.message}
                            </span>
                        </div>
                        {log.data && (
                            <pre className="mt-1 text-[10px] text-gray-500 overflow-x-auto bg-black/50 p-1 rounded">
                                {JSON.stringify(log.data, null, 2)}
                            </pre>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
