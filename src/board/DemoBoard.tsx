/**
 * DemoBoard - Standalone demo for testing the GuruGammon premium board
 * 
 * This component demonstrates the board with mock data,
 * allowing testing without the full game infrastructure.
 */

import React, { useState, useCallback } from 'react';
import BoardWrap from './components/BoardWrap';
import { BoardState, CheckerState, PipIndex, MatchState, Player, TimerState } from './types';

// Initial backgammon setup - standard starting position
const createInitialCheckers = (): CheckerState[] => {
    const checkers: CheckerState[] = [];
    
    // Light checkers (Player 1) - Standard setup
    // 2 on point 24
    for (let i = 0; i < 2; i++) {
        checkers.push({ id: `light-24-${i}`, color: 'light', pip: 24, z: i });
    }
    // 5 on point 13
    for (let i = 0; i < 5; i++) {
        checkers.push({ id: `light-13-${i}`, color: 'light', pip: 13, z: i });
    }
    // 3 on point 8
    for (let i = 0; i < 3; i++) {
        checkers.push({ id: `light-8-${i}`, color: 'light', pip: 8, z: i });
    }
    // 5 on point 6
    for (let i = 0; i < 5; i++) {
        checkers.push({ id: `light-6-${i}`, color: 'light', pip: 6, z: i });
    }

    // Dark checkers (Player 2) - Standard setup (mirrored)
    // 2 on point 1
    for (let i = 0; i < 2; i++) {
        checkers.push({ id: `dark-1-${i}`, color: 'dark', pip: 1, z: i });
    }
    // 5 on point 12
    for (let i = 0; i < 5; i++) {
        checkers.push({ id: `dark-12-${i}`, color: 'dark', pip: 12, z: i });
    }
    // 3 on point 17
    for (let i = 0; i < 3; i++) {
        checkers.push({ id: `dark-17-${i}`, color: 'dark', pip: 17, z: i });
    }
    // 5 on point 19
    for (let i = 0; i < 5; i++) {
        checkers.push({ id: `dark-19-${i}`, color: 'dark', pip: 19, z: i });
    }

    return checkers;
};

// Demo match state
const createDemoMatchState = (): MatchState => ({
    players: [
        {
            handle: 'You',
            rating: 1650,
            countryCode: 'FR',
            connected: true,
            color: 'light'
        },
        {
            handle: 'GuruBot',
            rating: 1800,
            countryCode: 'AI',
            connected: true,
            color: 'dark'
        }
    ] as [Player, Player],
    score: [2, 1],
    limitPoints: 5,
    stakes: '$10',
    timers: [
        { msRemaining: 180000, running: true },
        { msRemaining: 240000, running: false }
    ] as [TimerState, TimerState]
});

const DemoBoard: React.FC = () => {
    const [boardState, setBoardState] = useState<BoardState>({
        checkers: createInitialCheckers(),
        dice: {
            values: [3, 5],
            rolling: false,
            used: [false, false]
        },
        cube: {
            value: 2,
            owner: 'center'
        },
        legalMoves: [
            // Sample legal moves for light player
            { from: 6, to: 3 },
            { from: 6, to: 1 },
            { from: 8, to: 5 },
            { from: 8, to: 3 },
            { from: 13, to: 10 },
            { from: 13, to: 8 }
        ],
        turn: 'light'
    });

    const [matchState] = useState<MatchState>(createDemoMatchState);
    const [pendingDouble, setPendingDouble] = useState<string | null>(null);
    const [theme, setTheme] = useState<'dark' | 'high-contrast' | 'daltonism'>('dark');
    const [moveLog, setMoveLog] = useState<string[]>([]);

    const handleMove = useCallback((from: PipIndex | 'bar', to: PipIndex | 'borne') => {
        const moveStr = `${from === 'bar' ? 'bar' : from} → ${to === 'borne' ? 'off' : to}`;
        setMoveLog(prev => [...prev.slice(-9), moveStr]);
        
        // Update board state (simplified - doesn't validate moves)
        setBoardState(prev => {
            const newCheckers = [...prev.checkers];
            
            // Find checker to move
            const checkerIndex = newCheckers.findIndex(
                c => c.pip === from && c.color === prev.turn
            );
            
            if (checkerIndex !== -1) {
                // Update checker position
                newCheckers[checkerIndex] = {
                    ...newCheckers[checkerIndex],
                    pip: to,
                    z: newCheckers.filter(c => c.pip === to).length
                };
                
                // Recalculate z indices for source pip
                const sourceCheckers = newCheckers.filter(c => c.pip === from);
                sourceCheckers.forEach((c, i) => {
                    const idx = newCheckers.findIndex(nc => nc.id === c.id);
                    if (idx !== -1) newCheckers[idx] = { ...c, z: i };
                });
            }

            // Mark first unused die as used
            const newUsed = [...(prev.dice.used || [false, false])];
            const unusedIndex = newUsed.findIndex(u => !u);
            if (unusedIndex !== -1) newUsed[unusedIndex] = true;

            return {
                ...prev,
                checkers: newCheckers,
                dice: { ...prev.dice, used: newUsed as [boolean, boolean] }
            };
        });
    }, []);

    const handleRollDice = useCallback(() => {
        // Animate rolling
        setBoardState(prev => ({
            ...prev,
            dice: { ...prev.dice, rolling: true, values: null }
        }));

        // After animation, show new dice
        setTimeout(() => {
            const die1 = Math.floor(Math.random() * 6) + 1;
            const die2 = Math.floor(Math.random() * 6) + 1;
            
            setBoardState(prev => ({
                ...prev,
                dice: {
                    values: [die1, die2],
                    rolling: false,
                    used: [false, false]
                }
            }));
            
            setMoveLog(prev => [...prev.slice(-9), `🎲 Rolled ${die1}-${die2}`]);
        }, 600);
    }, []);

    const handleDouble = useCallback(() => {
        setPendingDouble('opponent');
        setMoveLog(prev => [...prev.slice(-9), '📦 Double offered!']);
    }, []);

    const handleTake = useCallback(() => {
        setBoardState(prev => ({
            ...prev,
            cube: {
                value: (prev.cube.value * 2) as any,
                owner: prev.turn
            }
        }));
        setPendingDouble(null);
        setMoveLog(prev => [...prev.slice(-9), '✓ Double taken!']);
    }, []);

    const handlePass = useCallback(() => {
        setPendingDouble(null);
        setMoveLog(prev => [...prev.slice(-9), '✗ Double passed - Game over!']);
    }, []);

    const resetBoard = useCallback(() => {
        setBoardState({
            checkers: createInitialCheckers(),
            dice: { values: null, rolling: false, used: [false, false] },
            cube: { value: 1, owner: 'center' },
            legalMoves: [],
            turn: 'light'
        });
        setMoveLog([]);
        setPendingDouble(null);
    }, []);

    const switchTurn = useCallback(() => {
        setBoardState(prev => ({
            ...prev,
            turn: prev.turn === 'light' ? 'dark' : 'light',
            dice: { values: null, rolling: false, used: [false, false] },
            legalMoves: []
        }));
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="text-center mb-6">
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                        🎲 GuruGammon Premium Board
                    </h1>
                    <p className="text-gray-400">
                        Demo & Testing Environment
                    </p>
                </div>

                {/* Controls */}
                <div className="flex flex-wrap justify-center gap-3 mb-6">
                    <button
                        onClick={resetBoard}
                        className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition"
                    >
                        🔄 Reset
                    </button>
                    <button
                        onClick={switchTurn}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition"
                    >
                        ↔️ Switch Turn
                    </button>
                    <button
                        onClick={() => setPendingDouble('you')}
                        className="px-4 py-2 bg-yellow-600 hover:bg-yellow-500 text-white rounded-lg font-medium transition"
                    >
                        📦 Test Double
                    </button>
                    
                    {/* Theme selector */}
                    <select
                        value={theme}
                        onChange={(e) => setTheme(e.target.value as any)}
                        className="px-4 py-2 bg-gray-700 text-white rounded-lg font-medium border border-gray-600"
                    >
                        <option value="dark">🌙 Dark Theme</option>
                        <option value="high-contrast">👁️ High Contrast</option>
                        <option value="daltonism">🎨 Color Blind</option>
                    </select>
                </div>

                {/* Main Board */}
                <BoardWrap
                    state={boardState}
                    matchState={matchState}
                    onMove={handleMove}
                    onRollDice={handleRollDice}
                    onDouble={handleDouble}
                    onTake={pendingDouble ? handleTake : undefined}
                    onPass={pendingDouble ? handlePass : undefined}
                    pendingDouble={pendingDouble}
                    theme={theme}
                />

                {/* Move Log */}
                <div className="mt-6 max-w-md mx-auto">
                    <h3 className="text-lg font-bold text-white mb-2">📜 Move Log</h3>
                    <div className="bg-gray-800 rounded-lg p-4 max-h-40 overflow-y-auto">
                        {moveLog.length === 0 ? (
                            <p className="text-gray-500 text-sm">No moves yet...</p>
                        ) : (
                            moveLog.map((log, i) => (
                                <div key={i} className="text-gray-300 text-sm py-1 border-b border-gray-700 last:border-0">
                                    {log}
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Instructions */}
                <div className="mt-6 text-center text-gray-500 text-sm">
                    <p>Click a checker to select • Click destination to move</p>
                    <p>Use keyboard Tab to navigate • Enter/Space to select</p>
                </div>
            </div>
        </div>
    );
};

export default DemoBoard;



