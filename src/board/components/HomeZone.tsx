import React, { memo } from 'react';
import { Color } from '../types';

interface HomeZoneProps {
    x: number;
    y: number;
    width: number;
    height: number;
    side: Color;
    onClick: () => void;
    isHighlighted: boolean;
}

const HomeZone = memo<HomeZoneProps>(({ x, y, width, height, side, onClick, isHighlighted }) => {
    return (
        <g onClick={onClick} role="button" aria-label={`${side} Home Zone`}>
            <rect
                x={x}
                y={y}
                width={width}
                height={height}
                fill="var(--gg-home)"
                stroke="rgba(0,0,0,0.2)"
            />

            {/* Highlight overlay */}
            {isHighlighted && (
                <rect
                    x={x}
                    y={y}
                    width={width}
                    height={height}
                    fill="var(--gg-highlight)"
                    className="gg-highlight-active"
                />
            )}

            {/* Label */}
            <text
                x={x + width / 2}
                y={y + height / 2}
                transform={`rotate(-90 ${x + width / 2} ${y + height / 2})`}
                textAnchor="middle"
                fontSize="14"
                fontWeight="bold"
                fill="var(--gg-muted)"
                opacity="0.3"
                fontFamily="system-ui, sans-serif"
            >
                {side.toUpperCase()} HOME
            </text>
        </g>
    );
});

HomeZone.displayName = 'HomeZone';
export default HomeZone;
