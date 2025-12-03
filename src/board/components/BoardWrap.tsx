import React, { memo, useCallback, useState, useEffect } from 'react';
import { BoardProps, PipIndex, LegalMove } from '../types';
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

    // LOG STATE AT EVERY RENDER - CRITICAL FOR DEBUG
    useEffect(() => {
        console.error('[BoardWrap] 🚨🚨🚨 STATE UPDATE 🚨🚨🚨', {
            legalMovesCount: state.legalMoves.length,
            checkersCount: state.checkers.length,
            turn: state.turn,
            diceValues: state.dice.values,
            diceUsed: state.dice.used,
            firstLegalMoves: state.legalMoves.slice(0, 5),
            onMoveAvailable: typeof onMove === 'function'
        });
    }, [state.legalMoves, state.checkers.length, state.turn, state.dice.values, onMove]);

    // Announce moves for screen readers
    const announceMove = useCallback((from: PipIndex | 'bar', to: PipIndex | 'borne') => {
        const fromStr = from === 'bar' ? 'bar' : `point ${from}`;
        const toStr = to === 'borne' ? 'home' : `point ${to}`;
        setLastMoveAnnouncement(`Moved checker from ${fromStr} to ${toStr}`);
    }, []);

    /**
     * 🎯 DÉPLACEMENT AUTOMATIQUE EN UN SEUL CLIC
     * Calcule la meilleure destination pour un pion
     * Priorité: frappe > bear off > avancement max
     */
    const getBestDestination = useCallback((fromPip: PipIndex | 'bar'): LegalMove | null => {
        const movesFromPip = state.legalMoves.filter(m => m.from === fromPip);
        
        if (movesFromPip.length === 0) return null;
        if (movesFromPip.length === 1) return movesFromPip[0];
        
        // Priorité 1: Bear off (sortir les pions)
        const bearOffMove = movesFromPip.find(m => m.to === 'borne');
        if (bearOffMove) {
            console.log('[BoardWrap] 🏠 Auto-selecting bear off move');
            return bearOffMove;
        }
        
        // Priorité 2: Frappe (hitting) - destination avec un pion adverse isolé
        const hitMoves = movesFromPip.filter(m => {
            if (m.to === 'borne') return false;
            const destCheckers = state.checkers.filter(c => c.pip === m.to);
            const oppositeColor = state.turn === 'light' ? 'dark' : 'light';
            return destCheckers.length === 1 && destCheckers[0].color === oppositeColor;
        });
        
        if (hitMoves.length > 0) {
            // Prendre le hit avec le plus grand dé utilisé
            const bestHit = hitMoves.reduce((best, curr) => {
                const bestDist = typeof best.from === 'number' && typeof best.to === 'number' 
                    ? Math.abs(best.from - best.to) : 0;
                const currDist = typeof curr.from === 'number' && typeof curr.to === 'number'
                    ? Math.abs(curr.from - curr.to) : 0;
                return currDist > bestDist ? curr : best;
            });
            console.log('[BoardWrap] 💥 Auto-selecting HIT move:', bestHit);
            return bestHit;
        }
        
        // Priorité 3: Avancer le plus loin possible (utiliser le plus grand dé)
        const sortedMoves = [...movesFromPip].sort((a, b) => {
            const aDist = typeof a.from === 'number' && typeof a.to === 'number' 
                ? Math.abs(a.from - a.to) : 0;
            const bDist = typeof b.from === 'number' && typeof b.to === 'number'
                ? Math.abs(b.from - b.to) : 0;
            return bDist - aDist; // Plus grand dé en premier
        });
        
        console.log('[BoardWrap] ➡️ Auto-selecting best advance move:', sortedMoves[0]);
        return sortedMoves[0];
    }, [state.legalMoves, state.checkers, state.turn]);

    const handlePipClick = useCallback((pip: PipIndex | 'bar' | 'borne') => {
        // === VALIDATION: Bloquer si pas de onMove (pas mon tour) ===
        if (!onMove) {
            console.warn('[BoardWrap] ⚠️ onMove non disponible - action bloquée');
            return;
        }
        
        // === VALIDATION: Bloquer si pas de legal moves (pas mon tour) ===
        if (state.legalMoves.length === 0) {
            console.warn('[BoardWrap] ⚠️ Aucun coup légal - probablement pas mon tour');
            return;
        }
        
        console.error('[BoardWrap] 🔥🔥🔥 handlePipClick - AUTO MOVE 🔥🔥🔥', { 
            pip, 
            legalMovesCount: state.legalMoves.length, 
            turn: state.turn,
            hasOnMove: !!onMove,
            timestamp: new Date().toISOString()
        });
        
        // Si clic sur la zone de sortie (borne), bear off automatique
        if (pip === 'borne') {
            const bearOffMoves = state.legalMoves.filter(m => m.to === 'borne');
            if (bearOffMoves.length > 0) {
                const move = bearOffMoves[0];
                console.error('[BoardWrap] 🏠 AUTO BEAR OFF:', move);
                onMove(move.from, 'borne');
                announceMove(move.from, 'borne');
            }
            setSelectedPip(null);
            return;
        }

        // Vérifier si le clic est sur un pion jouable du joueur actuel
        const hasPlayableChecker = state.checkers.some(
            c => c.pip === pip && c.color === state.turn
        );
        const movesFromPip = state.legalMoves.filter(m => m.from === pip);
        const hasLegalMoves = movesFromPip.length > 0;
        
        console.error('[BoardWrap] 🎯 CLICK ANALYSIS:', { 
            pip, 
            hasPlayableChecker, 
            hasLegalMoves, 
            movesFromPip,
            currentTurn: state.turn
        });
        
        // 🎯 DÉPLACEMENT AUTOMATIQUE EN UN CLIC !
        if (hasPlayableChecker && hasLegalMoves) {
            const bestMove = getBestDestination(pip);
            
            if (bestMove) {
                console.error('[BoardWrap] ✅✅✅ AUTO-MOVE EXECUTED ✅✅✅', { 
                    from: pip, 
                    to: bestMove.to,
                    allOptions: movesFromPip,
                    turn: state.turn,
                    timestamp: new Date().toISOString()
                });
                
                onMove(pip, bestMove.to);
                announceMove(pip, bestMove.to as PipIndex | 'borne');
                setSelectedPip(null);
                return;
            }
        }
        
        // Fallback: si on clique sur une destination quand un pion est sélectionné
        if (selectedPip !== null) {
            const isValidMove = state.legalMoves.some(
                m => m.from === selectedPip && m.to === pip
            );
            
            if (isValidMove) {
                console.error('[BoardWrap] ✅ Fallback move:', { from: selectedPip, to: pip });
                onMove(selectedPip, pip as PipIndex);
                announceMove(selectedPip, pip as PipIndex);
            }
            setSelectedPip(null);
        }
    }, [selectedPip, state.checkers, state.turn, state.legalMoves, onMove, announceMove, getBestDestination]);

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
            <div className="gg-board-container" data-testid="board">
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
                            data-testid="roll-dice"
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

            </div>

            {/* Keyboard shortcuts help */}
            <div className="text-center text-xs text-gray-500 mt-2">
                <span className="hidden sm:inline">
                    🎯 Un clic = mouvement auto • Tab pour navigation clavier
                </span>
            </div>
        </div>
    );
});

BoardWrap.displayName = 'BoardWrap';
export default BoardWrap;
