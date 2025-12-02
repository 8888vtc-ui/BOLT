/**
 * Panneau de Test pour exécuter les tests depuis l'interface
 * Accessible via un raccourci clavier ou un bouton dans le DebugOverlay
 */

import { useState } from 'react';
import { Play, CheckCircle, XCircle, Loader2, Gamepad2 } from 'lucide-react';
import { runAllTests, printTestResults, type TestSuite } from '../test/gameTestSuite';
import { runValidationTests, printValidationResults } from '../test/validateGameModes';

type TestMode = 'game' | 'validation';

export default function TestPanel() {
    const [isRunning, setIsRunning] = useState(false);
    const [testMode, setTestMode] = useState<TestMode>('game');
    const [results, setResults] = useState<any>(null);

    const runTests = async () => {
        setIsRunning(true);
        setResults(null);

        try {
            if (testMode === 'game') {
                // Exécuter les tests de jeu
                const testResults = runAllTests();
                setResults(testResults);
                printTestResults(testResults);
            } else {
                // Exécuter les tests de validation des modes
                const validationResults = runValidationTests();
                setResults(validationResults);
                printValidationResults(validationResults);
            }
        } catch (error) {
            console.error('Erreur lors des tests:', error);
            setResults({
                error: error instanceof Error ? error.message : 'Erreur inconnue'
            });
        } finally {
            setIsRunning(false);
        }
    };

    return (
        <div className="fixed top-4 right-4 z-50 w-96 max-h-[600px] flex flex-col bg-black/95 border border-[#FFD700]/30 rounded-lg shadow-2xl font-mono text-xs overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-3 bg-[#111] border-b border-white/10">
                <div className="flex items-center gap-2 text-[#FFD700] font-bold">
                    <Play className="w-4 h-4" />
                    <span>PANEL DE TESTS</span>
                </div>
                <button
                    onClick={runTests}
                    disabled={isRunning}
                    className="px-3 py-1.5 bg-[#FFD700] text-black rounded font-bold hover:bg-[#FFC700] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                    {isRunning ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Exécution...</span>
                        </>
                    ) : (
                        <>
                            <Play className="w-4 h-4" />
                            <span>Lancer Tests</span>
                        </>
                    )}
                </button>
            </div>

            {/* Mode Selection */}
            <div className="p-2 bg-[#0a0a0a] border-b border-white/5">
                <div className="flex gap-1">
                    <button
                        onClick={() => setTestMode('game')}
                        className={`flex-1 px-2 py-1 rounded text-[10px] font-bold transition-colors ${
                            testMode === 'game' 
                                ? 'bg-[#FFD700] text-black' 
                                : 'bg-white/10 text-gray-400 hover:bg-white/20'
                        }`}
                    >
                        <Gamepad2 className="w-3 h-3 inline mr-1" />
                        Jeu
                    </button>
                    <button
                        onClick={() => setTestMode('validation')}
                        className={`flex-1 px-2 py-1 rounded text-[10px] font-bold transition-colors ${
                            testMode === 'validation' 
                                ? 'bg-[#FFD700] text-black' 
                                : 'bg-white/10 text-gray-400 hover:bg-white/20'
                        }`}
                    >
                        <CheckCircle className="w-3 h-3 inline mr-1" />
                        Modes
                    </button>
                </div>
            </div>

            {/* Results */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
                {!results && !isRunning && (
                    <div className="text-center py-8 text-gray-500">
                        <p>Cliquez sur "Lancer Tests" pour exécuter la suite de tests</p>
                    </div>
                )}

                {isRunning && (
                    <div className="text-center py-8">
                        <Loader2 className="w-8 h-8 animate-spin text-[#FFD700] mx-auto mb-4" />
                        <p className="text-gray-400">Exécution des tests...</p>
                    </div>
                )}

                {results && (
                    <>
                        {results.error ? (
                            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3">
                                <div className="text-red-400 font-bold mb-1">Erreur</div>
                                <div className="text-red-300 text-xs">{results.error}</div>
                            </div>
                        ) : testMode === 'game' && results.suites ? (
                            <>
                                {/* Résumé Global */}
                                <div className="bg-[#111] rounded-lg p-3 border border-white/10">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-white font-bold">Résultats Globaux</span>
                                        <span className={`font-bold ${results.successRate === 100 ? 'text-green-400' : results.successRate >= 90 ? 'text-yellow-400' : 'text-red-400'}`}>
                                            {results.successRate.toFixed(1)}%
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
                                        <div>
                                            <div className="text-gray-400">Total</div>
                                            <div className="text-white font-bold">{results.totalTests}</div>
                                        </div>
                                        <div>
                                            <div className="text-gray-400">✅ Réussis</div>
                                            <div className="text-green-400 font-bold">{results.totalPassed}</div>
                                        </div>
                                        <div>
                                            <div className="text-gray-400">❌ Échoués</div>
                                            <div className="text-red-400 font-bold">{results.totalFailed}</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Détails par Suite */}
                                {results.suites.map((suite: any, index: number) => (
                                    <div key={index} className="bg-[#111] rounded-lg p-3 border border-white/10">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-white font-bold">{suite.name}</span>
                                            <span className={`text-xs font-bold ${suite.failed === 0 ? 'text-green-400' : 'text-red-400'}`}>
                                                {suite.passed}/{suite.total}
                                            </span>
                                        </div>
                                        <div className="space-y-1 max-h-32 overflow-y-auto">
                                            {suite.tests.map((test: any, testIndex: number) => (
                                                <div key={testIndex} className="flex items-center gap-2 text-xs">
                                                    {test.passed ? (
                                                        <CheckCircle className="w-3 h-3 text-green-400 shrink-0" />
                                                    ) : (
                                                        <XCircle className="w-3 h-3 text-red-400 shrink-0" />
                                                    )}
                                                    <span className={test.passed ? 'text-gray-300' : 'text-red-400'}>
                                                        {test.name}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </>
                        ) : testMode === 'validation' && results.results ? (
                            <>
                                {/* Résumé Validation */}
                                <div className="bg-[#111] rounded-lg p-3 border border-white/10">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-white font-bold">Validation Modes</span>
                                        <span className={`font-bold ${results.successRate === 100 ? 'text-green-400' : results.successRate >= 90 ? 'text-yellow-400' : 'text-red-400'}`}>
                                            {results.successRate.toFixed(1)}%
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
                                        <div>
                                            <div className="text-gray-400">Total</div>
                                            <div className="text-white font-bold">{results.total}</div>
                                        </div>
                                        <div>
                                            <div className="text-gray-400">✅ Réussis</div>
                                            <div className="text-green-400 font-bold">{results.passed}</div>
                                        </div>
                                        <div>
                                            <div className="text-gray-400">❌ Échoués</div>
                                            <div className="text-red-400 font-bold">{results.failed}</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Détails des Tests */}
                                <div className="bg-[#111] rounded-lg p-3 border border-white/10">
                                    <div className="text-white font-bold mb-2">Détails</div>
                                    <div className="space-y-1 max-h-48 overflow-y-auto">
                                        {results.results.map((result: any, index: number) => (
                                            <div key={index} className="flex items-center gap-2 text-xs">
                                                {result.passed ? (
                                                    <CheckCircle className="w-3 h-3 text-green-400 shrink-0" />
                                                ) : (
                                                    <XCircle className="w-3 h-3 text-red-400 shrink-0" />
                                                )}
                                                <span className={result.passed ? 'text-gray-300' : 'text-red-400'}>
                                                    {result.test}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </>
                        ) : null}
                    </>
                )}
            </div>
        </div>
    );
}

