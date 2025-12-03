import React, { memo, useCallback, useState, useEffect } from 'react';
import { BoardProps, PipIndex } from '../types';
import BoardSVG from './BoardSVG';
import MatchHeader from './MatchHeader';
import '../styles/gurugammon.css';

const BoardWrap = memo<BoardProps>(({
    state,
    matchState,
    onMove,
    onRollDice,
    onDouble,
    onTake,
    onPass,
    pendingDouble,
    theme = 'dark'
}) => {
    const [selectedPip, setSelectedPip] = useState<PipIndex | 'bar' | null>(null);
    const [lastMoveAnnouncement, setLastMoveAnnouncement] = useState<string>('');

    // Clear selection when turn changes
    useEffect(() => {
        setSelectedPip(null);
    }, [state.turn]);

    // Announce moves for screen readers
    const announceMove = useCallback((from: PipIndex | 'bar', to: PipIndex | 'borne') => {
        const fromStr = from === 'bar' ? 'bar' : `point ${from}`;
        const toStr = to === 'borne' ? 'home' : `point ${to}`;
        setLastMoveAnnouncement(`Moved checker from ${fromStr} to ${toStr}`);
    }, []);

    const handlePipClick = useCallback((pip: PipIndex | 'bar' | 'borne') => {
        // If clicking on borne (home), try to bear off
        if (pip === 'borne') {
            if (selectedPip !== null) {
                // Check if bearing off is a legal move
                const canBearOff = state.legalMoves.some(
                    m => m.from === selectedPip && m.to === 'borne'
                );
                if (canBearOff && onMove) {
                    onMove(selectedPip, 'borne');
                    announceMove(selectedPip, 'borne');
                }
                setSelectedPip(null);
            }
            return;
        }

        if (selectedPip === null) {
            // Select if it has checkers of current turn color AND has legal moves
            const hasPlayableChecker = state.checkers.some(
                c => c.pip === pip && c.color === state.turn
            );
            const hasLegalMoves = state.legalMoves.some(m => m.from === pip);
            
            if (hasPlayableChecker && hasLegalMoves) {
                setSelectedPip(pip);
            }
        } else {
            // Try to move
            const isValidMove = state.legalMoves.some(
                m => m.from === selectedPip && m.to === pip
            );
            
            if (isValidMove && onMove) {
                onMove(selectedPip, pip as PipIndex);
                announceMove(selectedPip, pip as PipIndex);
            }
            
            // Clear selection (even if move was invalid)
            setSelectedPip(null);
        }
    }, [selectedPip, state.checkers, state.turn, state.legalMoves, onMove, announceMove]);

    const handleCheckerDragStart = useCallback((id: string) => {
        const checker = state.checkers.find(c => c.id === id);
        if (checker && checker.color === state.turn) {
            const hasLegalMoves = state.legalMoves.some(m => m.from === checker.pip);
            if (hasLegalMoves) {
                setSelectedPip(checker.pip as PipIndex | 'bar');
            }
        }
    }, [state.checkers, state.turn, state.legalMoves]);

    const handleCheckerDragEnd = useCallback((pip: PipIndex | 'bar' | 'borne' | null) => {
        if (pip && selectedPip) {
            const isValidMove = state.legalMoves.some(
                m => m.from === selectedPip && m.to === pip
            );
            
            if (isValidMove && onMove) {
                onMove(selectedPip, pip as PipIndex | 'borne');
                announceMove(selectedPip, pip as PipIndex | 'borne');
            }
        }
        setSelectedPip(null);
    }, [selectedPip, state.legalMoves, onMove, announceMove]);

    // Determine if current player can roll dice
    const canRoll = !state.dice.values && !state.dice.rolling && !!onRollDice;
    
    // Determine if current player can double
    const canDouble = state.cube.owner === 'center' || state.cube.owner === state.turn;

    return (
        <div 
            className="flex flex-col gap-4 w-full max-w-6xl mx-auto p-4" 
            data-theme={theme}
            role="region"
            aria-label="Backgammon game board"
        >
            {/* Screen reader announcements */}
            <div 
                role="status" 
                aria-live="polite" 
                aria-atomic="true" 
                className="sr-only"
            >
                {lastMoveAnnouncement}
            </div>

            {/* Match Header */}
            {matchState && (
                <MatchHeader
                    state={matchState}
                    cubeValue={state.cube.value}
                    cubeOwner={state.cube.owner}
                />
            )}

            {/* Board Container */}
            <div className="gg-board-container">
                <BoardSVG
                    state={state}
                    selectedPip={selectedPip}
                    onPipClick={handlePipClick}
                    onCheckerDragStart={handleCheckerDragStart}
                    onCheckerDragEnd={handleCheckerDragEnd}
                    onRollDice={onRollDice}
                    onDouble={onDouble}
                    canRoll={canRoll}
                    canDouble={canDouble && !pendingDouble}
                />

                {/* Dice Roll Button Overlay (alternative position) */}
                {canRoll && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                        <button
                            onClick={onRollDice}
                            className="pointer-events-auto px-8 py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold text-lg rounded-full shadow-2xl transform transition-all duration-200 hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-emerald-500/50"
                            aria-label="Roll the dice"
                        >
                            🎲 ROLL DICE
                        </button>
                    </div>
                )}

                {/* Doubling Offer Overlay */}
                {pendingDouble && (
                    <div 
                        className="absolute inset-0 flex items-center justify-center bg-black/70 z-50 backdrop-blur-sm"
                        role="dialog"
                        aria-labelledby="double-title"
                        aria-describedby="double-desc"
                    >
                        <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-8 rounded-2xl border-2 border-yellow-500/50 shadow-2xl text-center max-w-sm mx-4 transform animate-pulse-slow">
                            {/* Cube icon */}
                            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-lg flex items-center justify-center text-3xl font-bold text-gray-900 shadow-lg">
                                {state.cube.value * 2}
                            </div>
                            
                            <h3 
                                id="double-title" 
                                className="text-2xl font-bold text-white mb-2"
                            >
                                Double Offered!
                            </h3>
                            <p 
                                id="double-desc" 
                                className="text-gray-400 mb-6"
                            >
                                Your opponent wants to double the stakes to {state.cube.value * 2}
                            </p>

                            {onTake && onPass ? (
                                <div className="flex gap-4 justify-center">
                                    <button
                                        onClick={onTake}
                                        className="px-8 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold rounded-xl shadow-lg transform transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-green-500/50"
                                        aria-label="Accept the double"
                                    >
                                        ✓ TAKE
                                    </button>
                                    <button
                                        onClick={onPass}
                                        className="px-8 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold rounded-xl shadow-lg transform transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-red-500/50"
                                        aria-label="Decline the double and forfeit"
                                    >
                                        ✗ PASS
                                    </button>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center gap-3">
                                    <div className="w-10 h-10 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin" />
                                    <p className="text-yellow-400 font-semibold animate-pulse">
                                        Waiting for opponent's response...
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Turn Indicator */}
                <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-black/50 px-3 py-2 rounded-lg backdrop-blur-sm">
                    <div 
                        className={`w-4 h-4 rounded-full ${
                            state.turn === 'light' 
                                ? 'bg-gray-100 border-2 border-gray-300' 
                                : 'bg-gray-800 border-2 border-gray-600'
                        }`}
                        aria-hidden="true"
                    />
                    <span className="text-sm font-medium text-white">
                        {state.turn === 'light' ? 'Light' : 'Dark'}'s turn
                    </span>
                </div>

                {/* Selected Checker Indicator */}
                {selectedPip && (
                    <div className="absolute top-4 left-4 bg-blue-500/80 px-3 py-1 rounded-lg text-sm font-medium text-white backdrop-blur-sm">
                        Selected: {selectedPip === 'bar' ? 'Bar' : `Point ${selectedPip}`}
                    </div>
                )}
            </div>

            {/* Keyboard shortcuts help */}
            <div className="text-center text-xs text-gray-500 mt-2">
                <span className="hidden sm:inline">
                    Click to select • Click destination to move • Tab for keyboard navigation
                </span>
            </div>
        </div>
    );
});

BoardWrap.displayName = 'BoardWrap';
export default BoardWrap;
