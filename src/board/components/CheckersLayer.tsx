import React, { memo, useMemo } from 'react';
import { CheckerState, Color, LegalMove, PipIndex } from '../types';
import Checker from './Checker';
import { getPipCoordinates, CHECKER_RADIUS } from '../utils/coords';

interface CheckersLayerProps {
    checkers: CheckerState[];
    turn: Color;
    legalMoves: LegalMove[];
    selectedPip: PipIndex | 'bar' | null;
    triangleWidth: number;
    triangleHeight: number;
    homeWidth: number;
    barWidth: number;
    boardWidth: number;
    boardHeight: number;
    onDragStart: (id: string) => void;
    onDragEnd: (pip: PipIndex | 'bar' | 'borne' | null) => void;
    onCheckerClick: (pip: PipIndex | 'bar' | 'borne') => void;
}

const CheckersLayer = memo<CheckersLayerProps>(({
    checkers,
    turn,
    legalMoves,
    selectedPip,
    onDragStart,
    onDragEnd,
    onCheckerClick
}) => {
    // Pre-compute which pips have legal moves for performance
    const playablePips = useMemo(() => {
        const pips = new Set<PipIndex | 'bar'>();
        legalMoves.forEach(m => {
            if (m.from === 'bar' || typeof m.from === 'number') {
                pips.add(m.from);
            }
        });
        return pips;
    }, [legalMoves]);

    // Sort checkers by z-index for proper rendering order
    const sortedCheckers = useMemo(() => {
        return [...checkers].sort((a, b) => (a.z || 0) - (b.z || 0));
    }, [checkers]);

    return (
        <g 
            aria-label="Checkers layer"
            style={{ pointerEvents: 'none' }} // Let clicks pass through to triangles
        >
            {sortedCheckers.map((checker) => {
                const { x, y } = getPipCoordinates(checker.pip, checker.z || 0);
                
                // A checker is playable if:
                // 1. It's the current player's turn (same color)
                // 2. There are legal moves from this pip
                const isCurrentPlayerChecker = turn === checker.color;
                const hasLegalMoves = playablePips.has(checker.pip as PipIndex | 'bar');
                const isPlayable = isCurrentPlayerChecker && hasLegalMoves;
                
                // Only the top checker of a stack should be playable
                const isTopOfStack = !checkers.some(
                    c => c.pip === checker.pip && (c.z || 0) > (checker.z || 0)
                );
                const canPlay = isPlayable && isTopOfStack;
                
                // Debug logging for first checker on point 6
                if (checker.pip === 6 && checker.color === 'light' && (checker.z || 0) === 0) {
                    console.error('[CheckersLayer] ⚠️⚠️⚠️ CHECKER ON POINT 6 ⚠️⚠️⚠️', {
                        turn,
                        checkerColor: checker.color,
                        isCurrentPlayerChecker,
                        hasLegalMoves,
                        isTopOfStack,
                        canPlay,
                        playablePips: Array.from(playablePips),
                        legalMovesCount: legalMoves.length,
                        legalMovesFrom6: legalMoves.filter(m => m.from === 6)
                    });
                }
                
                // FORCE LOG FOR ALL LIGHT CHECKERS
                if (checker.color === 'light' && (checker.z || 0) === 0) {
                    console.error(`[CheckersLayer] Light checker on pip ${checker.pip}:`, {
                        canPlay,
                        hasLegalMoves,
                        isCurrentPlayerChecker,
                        legalMovesFromThisPip: legalMoves.filter(m => m.from === checker.pip)
                    });
                }
                
                const isSelected = checker.pip === selectedPip;

                // Extract pip index for data-point attribute
                const pipIndex = typeof checker.pip === 'number' ? checker.pip : 
                                 checker.pip === 'bar' ? 'bar' : 
                                 checker.pip === 'borne' ? 'borne' : 'unknown';
                
                return (
                    <Checker
                        key={checker.id}
                        id={`${checker.color}-${pipIndex}-${checker.z || 0}`}
                        color={checker.color}
                        cx={x}
                        cy={y}
                        radius={CHECKER_RADIUS}
                        isPlayable={canPlay}
                        isSelected={isSelected}
                        zIndex={20 + (checker.z || 0)} // Higher than triangles
                        onDragStart={onDragStart}
                        onDragEnd={onDragEnd}
                        onClick={() => {
                            // ALWAYS call onCheckerClick for debugging, even if canPlay is false
                            console.error('[CheckersLayer] ✅✅✅ CHECKER CLICK ✅✅✅', { 
                                pip: checker.pip, 
                                canPlay, 
                                color: checker.color 
                            });
                            onCheckerClick(checker.pip);
                        }}
                    />
                );
            })}
        </g>
    );
});

CheckersLayer.displayName = 'CheckersLayer';
export default CheckersLayer;
