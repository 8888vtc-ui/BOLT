import React, { memo } from 'react';

interface BarProps {
    x: number;
    y: number;
    width: number;
    height: number;
    onClick: () => void;
}

const Bar = memo<BarProps>(({ x, y, width, height, onClick }) => {
    const uniqueId = `bar-${x}`;
    
    return (
        <g onClick={onClick} role="button" aria-label="Bar - captured checkers area" tabIndex={0}>
            {/* Gradient definitions */}
            <defs>
                <linearGradient id={`${uniqueId}-gradient`} x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#1a2332" />
                    <stop offset="20%" stopColor="#1F2937" />
                    <stop offset="50%" stopColor="#243347" />
                    <stop offset="80%" stopColor="#1F2937" />
                    <stop offset="100%" stopColor="#1a2332" />
                </linearGradient>
                <linearGradient id={`${uniqueId}-shine`} x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="transparent" />
                    <stop offset="50%" stopColor="rgba(255,255,255,0.05)" />
                    <stop offset="100%" stopColor="transparent" />
                </linearGradient>
                {/* Wood grain pattern */}
                <pattern id={`${uniqueId}-grain`} patternUnits="userSpaceOnUse" width="4" height="100">
                    <line x1="0" y1="0" x2="0" y2="100" stroke="rgba(0,0,0,0.03)" strokeWidth="1" />
                    <line x1="2" y1="0" x2="2" y2="100" stroke="rgba(255,255,255,0.02)" strokeWidth="0.5" />
                </pattern>
            </defs>

            {/* Main bar background */}
            <rect
                x={x}
                y={y}
                width={width}
                height={height}
                fill={`url(#${uniqueId}-gradient)`}
            />

            {/* Wood grain texture overlay */}
            <rect
                x={x}
                y={y}
                width={width}
                height={height}
                fill={`url(#${uniqueId}-grain)`}
            />

            {/* Shine overlay */}
            <rect
                x={x}
                y={y}
                width={width}
                height={height}
                fill={`url(#${uniqueId}-shine)`}
            />

            {/* Left edge shadow */}
            <rect
                x={x}
                y={y}
                width={3}
                height={height}
                fill="rgba(0,0,0,0.3)"
            />

            {/* Right edge shadow */}
            <rect
                x={x + width - 3}
                y={y}
                width={3}
                height={height}
                fill="rgba(0,0,0,0.3)"
            />

            {/* Center divider line */}
            <line
                x1={x + width / 2}
                y1={y + 10}
                x2={x + width / 2}
                y2={y + height - 10}
                stroke="rgba(255,255,255,0.08)"
                strokeWidth="1"
                strokeDasharray="8 4"
            />

            {/* Top ornament */}
            <rect
                x={x + width * 0.2}
                y={y + 5}
                width={width * 0.6}
                height={3}
                rx={1.5}
                fill="rgba(255,255,255,0.05)"
            />

            {/* Bottom ornament */}
            <rect
                x={x + width * 0.2}
                y={y + height - 8}
                width={width * 0.6}
                height={3}
                rx={1.5}
                fill="rgba(255,255,255,0.05)"
            />

            {/* "BAR" label - subtle */}
            <text
                x={x + width / 2}
                y={y + height / 2}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize="10"
                fontWeight="bold"
                fill="rgba(255,255,255,0.1)"
                fontFamily="'SF Pro Display', system-ui, sans-serif"
                transform={`rotate(-90 ${x + width / 2} ${y + height / 2})`}
                style={{ userSelect: 'none' }}
            >
                BAR
            </text>
        </g>
    );
});

Bar.displayName = 'Bar';
export default Bar;
