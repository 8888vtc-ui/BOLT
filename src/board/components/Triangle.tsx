import React, { memo } from 'react';
import { PipIndex } from '../types';

interface TriangleProps {
    pip: PipIndex;
    x: number;
    y: number;
    width: number;
    height: number;
    isTop: boolean;
    isDark: boolean;
    isHighlighted: boolean;
    onClick: () => void;
}

const Triangle = memo<TriangleProps>(({
    pip,
    x,
    y,
    width,
    height,
    isTop,
    isDark,
    isHighlighted,
    onClick
}) => {
    const points = isTop
        ? `${x},${y} ${x + width},${y} ${x + width / 2},${y + height}`
        : `${x},${y} ${x + width},${y} ${x + width / 2},${y - height}`;

    const fillColor = isDark ? 'var(--gg-tri-a)' : 'var(--gg-tri-b)';
    const uniqueId = `tri-${pip}`;

    return (
        <g 
            data-testid={`point-${pip}`}
            data-point={pip}
            data-valid={isHighlighted ? 'true' : 'false'}
            onClick={(e) => {
                console.error('[Triangle] ✅✅✅ CLICK ON POINT ✅✅✅', { pip });
                e.stopPropagation();
                onClick();
            }}
            onPointerDown={(e) => {
                console.error('[Triangle] ✅✅✅ POINTER DOWN ON POINT ✅✅✅', { pip });
                // Don't stop propagation to allow checkers to also receive the event
            }}
            onMouseDown={(e) => {
                console.error('[Triangle] ✅✅✅ MOUSE DOWN ON POINT ✅✅✅', { pip });
                e.stopPropagation();
            }}
            style={{ 
                cursor: 'pointer', 
                pointerEvents: 'all',
                zIndex: 1 // Ensure triangles are below checkers but still clickable
            }}
            role="button" 
            aria-label={`Point ${pip}`} 
            tabIndex={0}
        >
            {/* Inline gradient for shine effect */}
            <defs>
                <linearGradient 
                    id={`${uniqueId}-shine`} 
                    x1="0%" 
                    y1={isTop ? "0%" : "100%"} 
                    x2="0%" 
                    y2={isTop ? "100%" : "0%"}
                >
                    <stop offset="0%" stopColor="rgba(255,255,255,0.12)" />
                    <stop offset="40%" stopColor="rgba(255,255,255,0.05)" />
                    <stop offset="100%" stopColor="transparent" />
                </linearGradient>
            </defs>

            {/* Triangle body */}
            <polygon
                points={points}
                fill={fillColor}
                stroke="rgba(0,0,0,0.3)"
                strokeWidth="1"
                style={{ cursor: 'pointer', transition: 'fill 0.2s ease' }}
            />

            {/* Subtle gradient overlay - using proper SVG gradient */}
            <polygon
                points={points}
                fill={`url(#${uniqueId}-shine)`}
            />

            {/* Highlight overlay */}
            {isHighlighted && (
                <polygon
                    points={points}
                    fill="var(--gg-highlight)"
                    className="gg-highlight-active"
                />
            )}

            {/* Point number */}
            <text
                x={x + width / 2}
                y={isTop ? y - 8 : y + 16}
                textAnchor="middle"
                fontSize="10"
                fill="var(--gg-muted)"
                fontFamily="'SF Pro Display', system-ui, sans-serif"
                style={{ userSelect: 'none' }}
            >
                {pip}
            </text>
        </g>
    );
});

Triangle.displayName = 'Triangle';
export default Triangle;
