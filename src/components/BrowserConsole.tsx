import { useEffect, useState, useRef } from 'react';
import { X, Terminal, Trash2, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';

interface ConsoleEntry {
    id: string;
    timestamp: string;
    type: 'log' | 'error' | 'warn' | 'info';
    message: string;
    args: any[];
}

export default function BrowserConsole() {
    const [logs, setLogs] = useState<ConsoleEntry[]>([]);
    const [isVisible, setIsVisible] = useState(true);
    const [isMinimized, setIsMinimized] = useState(false);
    const [filter, setFilter] = useState<'all' | 'log' | 'error' | 'warn' | 'info'>('all');
    const logsEndRef = useRef<HTMLDivElement>(null);

    // Auto-scroll vers le bas
    useEffect(() => {
        if (logsEndRef.current && !isMinimized) {
            logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [logs, isMinimized]);

    // Intercepter console.log, console.error, etc.
    useEffect(() => {
        const originalLog = console.log;
        const originalError = console.error;
        const originalWarn = console.warn;
        const originalInfo = console.info;

        const addLog = (type: 'log' | 'error' | 'warn' | 'info', args: any[]) => {
            const message = args.map(arg => {
                if (typeof arg === 'object') {
                    try {
                        return JSON.stringify(arg, null, 2);
                    } catch {
                        return String(arg);
                    }
                }
                return String(arg);
            }).join(' ');

            const entry: ConsoleEntry = {
                id: Math.random().toString(36).substr(2, 9) + Date.now(),
                timestamp: new Date().toLocaleTimeString('fr-FR', { 
                    hour12: false, 
                    hour: '2-digit', 
                    minute: '2-digit', 
                    second: '2-digit',
                    fractionalSecondDigits: 3
                }),
                type,
                message,
                args
            };

            setLogs(prev => [...prev, entry].slice(-500)); // Garder les 500 derniers
        };

        console.log = (...args: any[]) => {
            originalLog.apply(console, args);
            addLog('log', args);
        };

        console.error = (...args: any[]) => {
            originalError.apply(console, args);
            addLog('error', args);
        };

        console.warn = (...args: any[]) => {
            originalWarn.apply(console, args);
            addLog('warn', args);
        };

        console.info = (...args: any[]) => {
            originalInfo.apply(console, args);
            addLog('info', args);
        };

        // Intercepter les erreurs non capturées
        window.addEventListener('error', (event) => {
            addLog('error', [
                `Uncaught Error: ${event.message}`,
                `File: ${event.filename}:${event.lineno}:${event.colno}`,
                event.error?.stack
            ]);
        });

        window.addEventListener('unhandledrejection', (event) => {
            addLog('error', [
                `Unhandled Promise Rejection:`,
                event.reason?.message || event.reason,
                event.reason?.stack
            ]);
        });

        return () => {
            console.log = originalLog;
            console.error = originalError;
            console.warn = originalWarn;
            console.info = originalInfo;
        };
    }, []);

    const filteredLogs = filter === 'all' 
        ? logs 
        : logs.filter(log => log.type === filter);

    const errorCount = logs.filter(l => l.type === 'error').length;

    if (!isVisible) {
        return (
            <button
                onClick={() => setIsVisible(true)}
                className="fixed bottom-4 right-4 z-[9999] bg-red-600 text-white p-3 rounded-full border-2 border-red-400 hover:bg-red-700 shadow-lg relative"
                title="Afficher la console JavaScript"
            >
                <Terminal className="w-6 h-6" />
                {errorCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-white text-red-600 text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold border-2 border-red-600">
                        {errorCount}
                    </span>
                )}
            </button>
        );
    }

    return (
        <div className={`fixed ${isMinimized ? 'bottom-4 right-4 w-96' : 'bottom-0 right-0 w-full md:w-[600px]'} z-[9999] bg-black/98 border-t-2 border-l-2 border-r-2 border-red-500/50 shadow-2xl font-mono text-xs transition-all duration-300`}>
            {/* Header */}
            <div className="flex items-center justify-between p-3 bg-red-900/50 border-b border-red-500/30">
                <div className="flex items-center gap-2 text-white font-bold">
                    <Terminal className="w-5 h-5" />
                    <span>CONSOLE JAVASCRIPT</span>
                    <span className="text-red-300 text-xs">({logs.length} logs)</span>
                    {errorCount > 0 && (
                        <span className="bg-red-600 text-white px-2 py-0.5 rounded text-xs flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            {errorCount} erreur(s)
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setIsMinimized(!isMinimized)}
                        className="text-white hover:text-red-300 transition-colors"
                        title={isMinimized ? 'Agrandir' : 'Réduire'}
                    >
                        {isMinimized ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </button>
                    <button
                        onClick={() => setLogs([])}
                        className="text-white hover:text-red-300 transition-colors"
                        title="Effacer les logs"
                    >
                        <Trash2 className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => setIsVisible(false)}
                        className="text-white hover:text-red-300 transition-colors"
                        title="Masquer"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {!isMinimized && (
                <>
                    {/* Filtres */}
                    <div className="flex items-center gap-2 p-2 bg-red-950/50 border-b border-red-500/20 flex-wrap">
                        {(['all', 'log', 'info', 'warn', 'error'] as const).map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-3 py-1 rounded text-xs font-bold transition-colors ${
                                    filter === f
                                        ? f === 'error' ? 'bg-red-600 text-white' :
                                          f === 'warn' ? 'bg-yellow-600 text-white' :
                                          f === 'info' ? 'bg-blue-600 text-white' :
                                          'bg-white text-black'
                                        : 'bg-white/10 text-gray-400 hover:bg-white/20'
                                }`}
                            >
                                {f.toUpperCase()} {f !== 'all' && `(${logs.filter(l => l.type === f).length})`}
                            </button>
                        ))}
                    </div>

                    {/* Logs */}
                    <div className="h-[400px] overflow-y-auto bg-black/90 p-3 space-y-1 custom-scrollbar">
                        {filteredLogs.length === 0 ? (
                            <div className="text-gray-600 italic text-center py-8">
                                {logs.length === 0 ? 'Aucun log...' : 'Aucun log ne correspond au filtre'}
                            </div>
                        ) : (
                            filteredLogs.map((log) => (
                                <div
                                    key={log.id}
                                    className={`border-l-2 pl-2 py-1 break-words ${
                                        log.type === 'error' ? 'border-red-500 bg-red-950/20 text-red-300' :
                                        log.type === 'warn' ? 'border-yellow-500 bg-yellow-950/20 text-yellow-300' :
                                        log.type === 'info' ? 'border-blue-500 bg-blue-950/20 text-blue-300' :
                                        'border-gray-500 bg-gray-950/20 text-gray-300'
                                    }`}
                                >
                                    <div className="flex items-start gap-2">
                                        <span className="text-gray-500 shrink-0 text-[10px]">[{log.timestamp}]</span>
                                        <span className="text-[10px] font-bold uppercase text-gray-400">{log.type}</span>
                                    </div>
                                    <div className="mt-1 text-sm whitespace-pre-wrap font-mono">
                                        {log.message}
                                    </div>
                                </div>
                            ))
                        )}
                        <div ref={logsEndRef} />
                    </div>
                </>
            )}
        </div>
    );
}




