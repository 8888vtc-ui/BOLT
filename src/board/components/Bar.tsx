import React, { memo } from 'react';

interface BarProps {
    x: number;
    y: number;
    width: number;
    height: number;
    onClick: () => void;
}

const Bar = memo<BarProps>(({ x, y, width, height, onClick }) => {
    return (
        <g onClick={onClick} role="button" aria-label="Bar">
            <rect
                x={x}
                y={y}
                width={width}
                height={height}
                fill="var(--gg-bar)"
                stroke="rgba(0,0,0,0.2)"
            />
            {/* Center line */}
            <line
                x1={x + width / 2}
                y1={y}
                x2={x + width / 2}
                y2={y + height}
                stroke="rgba(255,255,255,0.05)"
                strokeWidth="1"
            />
        </g>
    );
});

Bar.displayName = 'Bar';
export default Bar;
