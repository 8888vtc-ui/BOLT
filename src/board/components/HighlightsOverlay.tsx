import React, { memo, useMemo } from 'react';
import { LegalMove, PipIndex } from '../types';
import { getPipCoordinates, CHECKER_RADIUS } from '../utils/coords';

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
    selectedPip,
    boardHeight
}) => {
    // Only show highlights when a checker is selected
    if (!selectedPip) return null;

    // Get moves from selected pip
    const relevantMoves = useMemo(() => 
        legalMoves.filter(m => m.from === selectedPip),
        [legalMoves, selectedPip]
    );

    if (relevantMoves.length === 0) return null;

    return (
        <g pointerEvents="none" aria-hidden="true">
            {/* Defs for highlight effects */}
            <defs>
                <filter id="gg-highlight-glow" x="-100%" y="-100%" width="300%" height="300%">
                    <feGaussianBlur stdDeviation="4" result="blur" />
                    <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
                <marker 
                    id="gg-arrow" 
                    markerWidth="10" 
                    markerHeight="10" 
                    refX="9" 
                    refY="3" 
                    orient="auto" 
                    markerUnits="strokeWidth"
                >
                    <path d="M0,0 L0,6 L9,3 z" fill="var(--gg-primary)" opacity="0.7" />
                </marker>
            </defs>

            {relevantMoves.map((move, i) => {
                const start = getPipCoordinates(move.from, 3); // Start from middle of stack
                const end = getPipCoordinates(move.to, 0); // End at base
                
                // Calculate control point for curved path
                const midX = (start.x + end.x) / 2;
                const midY = (start.y + end.y) / 2;
                const curveOffset = Math.abs(end.x - start.x) * 0.2;
                const controlY = midY + (start.y < boardHeight / 2 ? curveOffset : -curveOffset);

                // Curved path
                const pathD = `M ${start.x} ${start.y} Q ${midX} ${controlY} ${end.x} ${end.y}`;

                return (
                    <g key={`${move.from}-${move.to}-${i}`}>
                        {/* Trajectory path - curved line with arrow */}
                        <path
                            d={pathD}
                            fill="none"
                            stroke="var(--gg-primary)"
                            strokeWidth="2.5"
                            strokeDasharray="6 4"
                            strokeLinecap="round"
                            opacity="0.6"
                            markerEnd="url(#gg-arrow)"
                            style={{
                                animation: 'gg-path-dash 1s linear infinite'
                            }}
                        />

                        {/* Target highlight circle - outer glow */}
                        <circle
                            cx={end.x}
                            cy={end.y}
                            r={CHECKER_RADIUS + 8}
                            fill="none"
                            stroke="var(--gg-primary)"
                            strokeWidth="2"
                            opacity="0.3"
                            filter="url(#gg-highlight-glow)"
                            className="gg-highlight-active"
                        />

                        {/* Target highlight circle - inner */}
                        <circle
                            cx={end.x}
                            cy={end.y}
                            r={CHECKER_RADIUS + 4}
                            fill="var(--gg-highlight)"
                            stroke="var(--gg-primary)"
                            strokeWidth="2"
                            opacity="0.5"
                            className="gg-highlight-active"
                        />

                        {/* Center dot */}
                        <circle
                            cx={end.x}
                            cy={end.y}
                            r={4}
                            fill="var(--gg-primary)"
                            opacity="0.8"
                        />

                        {/* Die value indicator (if we had die info) */}
                        {/* Could add die value badge here */}
                    </g>
                );
            })}

            {/* Source highlight - where the selected checker is */}
            {selectedPip && selectedPip !== 'bar' && (
                <circle
                    cx={getPipCoordinates(selectedPip, 0).x}
                    cy={getPipCoordinates(selectedPip, 0).y}
                    r={CHECKER_RADIUS + 10}
                    fill="none"
                    stroke="var(--gg-secondary)"
                    strokeWidth="2"
                    strokeDasharray="4 4"
                    opacity="0.4"
                />
            )}
        </g>
    );
});

HighlightsOverlay.displayName = 'HighlightsOverlay';
export default HighlightsOverlay;
