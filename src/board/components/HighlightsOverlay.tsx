import React, { memo } from 'react';
import { LegalMove, PipIndex } from '../types';
import { getPipCoordinates } from '../utils/coords';

interface HighlightsOverlayProps {
    legalMoves: LegalMove[];
    selectedPip: PipIndex | 'bar' | null;
    triangleWidth: number;
    triangleHeight: number;
    homeWidth: number;
    barWidth: number;
    boardWidth: number;
    boardHeight: number;
}

const HighlightsOverlay = memo<HighlightsOverlayProps>(({
    legalMoves,
    selectedPip
}) => {
    if (!selectedPip) return null;

    const relevantMoves = legalMoves.filter(m => m.from === selectedPip);

    return (
        <g pointerEvents="none">
            {relevantMoves.map((move, i) => {
                const start = getPipCoordinates(move.from, 5); // Start from top of stack
                const end = getPipCoordinates(move.to, 0); // End at base

                return (
                    <g key={i}>
                        {/* Trajectory line */}
                        <line
                            x1={start.x}
                            y1={start.y}
                            x2={end.x}
                            y2={end.y}
                            stroke="var(--gg-primary)"
                            strokeWidth="2"
                            strokeDasharray="4 4"
                            opacity="0.5"
                        />
                        {/* Target highlight */}
                        <circle
                            cx={end.x}
                            cy={end.y}
                            r={10}
                            fill="var(--gg-primary)"
                            opacity="0.3"
                            className="gg-highlight-active"
                        />
                    </g>
                );
            })}
        </g>
    );
});

HighlightsOverlay.displayName = 'HighlightsOverlay';
export default HighlightsOverlay;
