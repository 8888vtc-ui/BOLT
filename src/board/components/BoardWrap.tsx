import React, { memo, useCallback, useState, useMemo } from 'react';
import { BoardProps, PipIndex, LegalMove } from '../types';
import BoardSVG from './BoardSVG';
import MatchHeader from './MatchHeader';
import '../styles/gurugammon.css';

interface ExtendedBoardProps extends BoardProps {
    canDouble?: boolean;
}

const BoardWrap = memo<ExtendedBoardProps>(({
    state,
    matchState,
    onMove,
    onRollDice,
    onDouble,
    onTake,
    onPass,
    pendingDouble,
    canDouble = false,
    theme = 'dark'
}) => {
    const [selectedPip, setSelectedPip] = useState<PipIndex | 'bar' | null>(null);

    // Check if a pip has legal moves from it
    const hasLegalMovesFrom = useCallback((pip: PipIndex | 'bar'): boolean => {
        return state.legalMoves.some(m => m.from === pip);
    }, [state.legalMoves]);

    // Check if a move is legal
    const isLegalMove = useCallback((from: PipIndex | 'bar', to: PipIndex | 'borne'): boolean => {
        return state.legalMoves.some(m => m.from === from && m.to === to);
    }, [state.legalMoves]);

    const handlePipClick = useCallback((pip: PipIndex | 'bar' | 'borne') => {
        // If nothing selected, try to select this pip
        if (selectedPip === null) {
            // Can only select if it has our checkers AND has legal moves
            const hasOurCheckers = state.checkers.some(c => c.pip === pip && c.color === state.turn);
            const hasLegalMoves = pip !== 'borne' && hasLegalMovesFrom(pip as PipIndex | 'bar');
            
            if (hasOurCheckers && hasLegalMoves) {
                setSelectedPip(pip as PipIndex | 'bar');
            }
        } else {
            // Something is selected - try to move there
            if (pip !== 'bar' && isLegalMove(selectedPip, pip as PipIndex | 'borne')) {
                if (onMove) {
                    onMove(selectedPip, pip as PipIndex | 'borne');
                }
            }
            // Always deselect after click
            setSelectedPip(null);
        }
    }, [selectedPip, state.checkers, state.turn, hasLegalMovesFrom, isLegalMove, onMove]);

    const handleCheckerDragStart = useCallback((id: string) => {
        const checker = state.checkers.find(c => c.id === id);
        if (checker && checker.color === state.turn) {
            const pip = checker.pip as PipIndex | 'bar';
            if (hasLegalMovesFrom(pip)) {
                setSelectedPip(pip);
            }
        }
    }, [state.checkers, state.turn, hasLegalMovesFrom]);

    const handleCheckerDragEnd = useCallback((pip: PipIndex | 'bar' | 'borne' | null) => {
        if (pip && selectedPip && pip !== 'bar') {
            if (isLegalMove(selectedPip, pip as PipIndex | 'borne')) {
                if (onMove) {
                    onMove(selectedPip, pip as PipIndex | 'borne');
                }
            }
        }
        setSelectedPip(null);
    }, [selectedPip, isLegalMove, onMove]);

    // Determine if we should show the roll button
    const showRollButton = useMemo(() => {
        return !state.dice.values && !state.dice.rolling && onRollDice;
    }, [state.dice.values, state.dice.rolling, onRollDice]);

    return (
        <div className="flex flex-col gap-4 w-full max-w-6xl mx-auto p-4" data-theme={theme}>
            {matchState && (
                <MatchHeader
                    state={matchState}
                    cubeValue={state.cube.value}
                    cubeOwner={state.cube.owner}
                />
            )}

            <div className="gg-board-container">
                <BoardSVG
                    state={state}
                    selectedPip={selectedPip}
                    onPipClick={handlePipClick}
                    onCheckerDragStart={handleCheckerDragStart}
                    onCheckerDragEnd={handleCheckerDragEnd}
                    onDouble={onDouble}
                    canDouble={canDouble}
                />

                {/* Dice Roll Button Overlay - Premium Style */}
                {showRollButton && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <button
                            onClick={onRollDice}
                            className="pointer-events-auto px-8 py-4 bg-gradient-to-br from-emerald-500 to-emerald-700 hover:from-emerald-400 hover:to-emerald-600 text-white font-bold text-lg rounded-2xl shadow-2xl transform transition-all duration-200 hover:scale-110 active:scale-95 border border-emerald-400/30"
                            style={{
                                textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                                boxShadow: '0 10px 40px rgba(16, 185, 129, 0.4), inset 0 1px 0 rgba(255,255,255,0.2)'
                            }}
                        >
                            🎲 ROLL DICE
                        </button>
                    </div>
                )}

                {/* Double Button - Show when can double and no dice rolled */}
                {canDouble && !state.dice.values && onDouble && !pendingDouble && (
                    <div className="absolute top-4 right-4 pointer-events-auto">
                        <button
                            onClick={onDouble}
                            className="px-4 py-2 bg-gradient-to-br from-amber-500 to-amber-700 hover:from-amber-400 hover:to-amber-600 text-white font-bold rounded-xl shadow-lg transform transition-all duration-200 hover:scale-105 active:scale-95 border border-amber-400/30"
                        >
                            ×2 DOUBLE
                        </button>
                    </div>
                )}

                {/* Doubling Offer Overlay - Premium Style */}
                {pendingDouble && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/70 z-50 backdrop-blur-md">
                        <div 
                            className="bg-gradient-to-br from-gray-900 to-gray-800 p-8 rounded-3xl border-2 border-amber-500/50 shadow-2xl text-center max-w-sm mx-4"
                            style={{
                                boxShadow: '0 25px 80px rgba(245, 158, 11, 0.3), inset 0 1px 0 rgba(255,255,255,0.1)'
                            }}
                        >
                            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl flex items-center justify-center text-3xl font-bold text-gray-900 shadow-lg">
                                {state.cube.value * 2}
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2">Double Proposed!</h3>
                            <p className="text-gray-400 mb-6">Accept the stakes or forfeit the game?</p>

                            {onTake && onPass ? (
                                <div className="flex gap-4 justify-center">
                                    <button
                                        onClick={onTake}
                                        className="px-6 py-3 bg-gradient-to-br from-emerald-500 to-emerald-700 hover:from-emerald-400 hover:to-emerald-600 text-white font-bold rounded-xl shadow-lg transform transition-all duration-200 hover:scale-105 active:scale-95"
                                    >
                                        ✓ TAKE
                                    </button>
                                    <button
                                        onClick={onPass}
                                        className="px-6 py-3 bg-gradient-to-br from-red-500 to-red-700 hover:from-red-400 hover:to-red-600 text-white font-bold rounded-xl shadow-lg transform transition-all duration-200 hover:scale-105 active:scale-95"
                                    >
                                        ✗ PASS
                                    </button>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center gap-3">
                                    <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
                                    <p className="text-amber-400 font-bold animate-pulse">Waiting for opponent...</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
});

BoardWrap.displayName = 'BoardWrap';
export default BoardWrap;
