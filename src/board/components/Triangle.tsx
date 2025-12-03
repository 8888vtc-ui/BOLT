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
    const gradientId = isTop ? 'gg-tri-shine-top' : 'gg-tri-shine-bottom';

    return (
        <g 
            onClick={onClick} 
            role="button" 
            aria-label={`Point ${pip}`}
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && onClick()}
            style={{ cursor: 'pointer' }}
        >
            {/* Triangle body with premium shadow */}
            <polygon
                points={points}
                fill={fillColor}
                stroke="rgba(0,0,0,0.4)"
                strokeWidth="1.5"
                filter="url(#gg-triangle-shadow)"
            />

            {/* Inner glow effect using proper SVG gradient */}
            <polygon
                points={points}
                fill={`url(#${gradientId})`}
                opacity="0.6"
            />

            {/* Edge highlight for 3D effect */}
            <line
                x1={x + width / 2}
                y1={isTop ? y + height : y - height}
                x2={x + (isTop ? 0 : width)}
                y2={y}
                stroke="rgba(255,255,255,0.08)"
                strokeWidth="1"
            />

            {/* Highlight overlay for valid moves */}
            {isHighlighted && (
                <polygon
                    points={points}
                    fill="var(--gg-highlight)"
                    className="gg-highlight-active"
                />
            )}

            {/* Point number with better visibility */}
            <text
                x={x + width / 2}
                y={isTop ? y - 6 : y + 14}
                textAnchor="middle"
                fontSize="11"
                fontWeight="500"
                fill="var(--gg-muted)"
                fontFamily="'SF Pro Display', system-ui, sans-serif"
                opacity="0.7"
            >
                {pip}
            </text>
        </g>
    );
});

Triangle.displayName = 'Triangle';
export default Triangle;
