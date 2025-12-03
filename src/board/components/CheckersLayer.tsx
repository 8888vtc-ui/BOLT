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
        legalMoves.forEach(m => pips.add(m.from));
        return pips;
    }, [legalMoves]);

    // Group checkers by pip for proper stacking
    const checkersByPip = useMemo(() => {
        const grouped = new Map<PipIndex | 'bar' | 'borne', CheckerState[]>();
        checkers.forEach(c => {
            const existing = grouped.get(c.pip) || [];
            existing.push(c);
            grouped.set(c.pip, existing);
        });
        // Sort each group by z-index
        grouped.forEach((group) => {
            group.sort((a, b) => (a.z || 0) - (b.z || 0));
        });
        return grouped;
    }, [checkers]);

    // Flatten back with correct z values
    const sortedCheckers = useMemo(() => {
        const result: CheckerState[] = [];
        checkersByPip.forEach((group) => {
            group.forEach((checker, idx) => {
                result.push({ ...checker, z: idx });
            });
        });
        return result;
    }, [checkersByPip]);

    return (
        <g aria-label="Checkers">
            {sortedCheckers.map((checker) => {
                const { x, y } = getPipCoordinates(checker.pip, checker.z || 0, checker.color);
                
                // A checker is playable if:
                // 1. It's the current player's turn
                // 2. It's the current player's color
                // 3. Its pip has at least one legal move
                // 4. It's on top of the stack (highest z-index for this pip)
                const stackForPip = checkersByPip.get(checker.pip) || [];
                const isTopOfStack = stackForPip.length === 0 || 
                    checker.z === stackForPip.length - 1;
                
                const isPlayable = turn === checker.color && 
                    playablePips.has(checker.pip as PipIndex | 'bar') &&
                    isTopOfStack;
                
                const isSelected = checker.pip === selectedPip;

                return (
                    <Checker
                        key={checker.id}
                        id={checker.id}
                        color={checker.color}
                        cx={x}
                        cy={y}
                        radius={CHECKER_RADIUS}
                        isPlayable={isPlayable}
                        isSelected={isSelected}
                        zIndex={10 + (checker.z || 0)}
                        onDragStart={onDragStart}
                        onDragEnd={onDragEnd}
                        onClick={() => onCheckerClick(checker.pip)}
                    />
                );
            })}
        </g>
    );
});

CheckersLayer.displayName = 'CheckersLayer';
export default CheckersLayer;
