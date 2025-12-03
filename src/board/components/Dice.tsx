import React, { memo } from 'react';

interface DiceProps {
    value: number | null;
    x: number;
    y: number;
    size: number;
    rolling: boolean;
    used: boolean;
}

const Dice = memo<DiceProps>(({ value, x, y, size, rolling, used }) => {
    if (value === null) return null;

    const pipPositions: Record<number, [number, number][]> = {
        1: [[0.5, 0.5]],
        2: [[0.25, 0.25], [0.75, 0.75]],
        3: [[0.25, 0.25], [0.5, 0.5], [0.75, 0.75]],
        4: [[0.25, 0.25], [0.75, 0.25], [0.25, 0.75], [0.75, 0.75]],
        5: [[0.25, 0.25], [0.75, 0.25], [0.5, 0.5], [0.25, 0.75], [0.75, 0.75]],
        6: [[0.25, 0.25], [0.75, 0.25], [0.25, 0.5], [0.75, 0.5], [0.25, 0.75], [0.75, 0.75]],
    };

    const pips = pipPositions[value] || [];
    const pipRadius = size * 0.08;
    const cornerRadius = size * 0.15;
    const uniqueId = `dice-${x}-${y}-${value}`;

    return (
        <g
            className={rolling ? 'gg-dice-rolling' : ''}
            opacity={used ? 0.4 : 1}
            aria-label={`Die showing ${value}${used ? ', used' : ''}`}
            role="img"
        >
            {/* Inline gradients */}
            <defs>
                <linearGradient id={`${uniqueId}-face`} x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FFFFFF" />
                    <stop offset="50%" stopColor="#F3F4F6" />
                    <stop offset="100%" stopColor="#E5E7EB" />
                </linearGradient>
                <linearGradient id={`${uniqueId}-shine`} x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="rgba(255,255,255,0.8)" />
                    <stop offset="30%" stopColor="rgba(255,255,255,0.3)" />
                    <stop offset="100%" stopColor="transparent" />
                </linearGradient>
                <filter id={`${uniqueId}-shadow`} x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="1" dy="2" stdDeviation="2" floodColor="#000" floodOpacity="0.3" />
                </filter>
            </defs>

            {/* Die body with 3D effect */}
            <rect
                x={x}
                y={y}
                width={size}
                height={size}
                rx={cornerRadius}
                ry={cornerRadius}
                fill={`url(#${uniqueId}-face)`}
                stroke="rgba(0,0,0,0.15)"
                strokeWidth="1"
                filter={`url(#${uniqueId}-shadow)`}
            />

            {/* Top shine overlay - proper SVG gradient */}
            <rect
                x={x + 2}
                y={y + 2}
                width={size - 4}
                height={size * 0.4}
                rx={cornerRadius - 1}
                ry={cornerRadius - 1}
                fill={`url(#${uniqueId}-shine)`}
            />

            {/* Inner border for depth */}
            <rect
                x={x + 1}
                y={y + 1}
                width={size - 2}
                height={size - 2}
                rx={cornerRadius - 0.5}
                ry={cornerRadius - 0.5}
                fill="none"
                stroke="rgba(255,255,255,0.4)"
                strokeWidth="0.5"
            />

            {/* Pips with shadow effect */}
            {pips.map(([px, py], i) => (
                <g key={i}>
                    {/* Pip shadow */}
                    <circle
                        cx={x + px * size + 0.5}
                        cy={y + py * size + 0.5}
                        r={pipRadius}
                        fill="rgba(0,0,0,0.2)"
                    />
                    {/* Pip */}
                    <circle
                        cx={x + px * size}
                        cy={y + py * size}
                        r={pipRadius}
                        fill="var(--gg-die-pip)"
                    />
                    {/* Pip highlight */}
                    <circle
                        cx={x + px * size - pipRadius * 0.3}
                        cy={y + py * size - pipRadius * 0.3}
                        r={pipRadius * 0.3}
                        fill="rgba(255,255,255,0.15)"
                    />
                </g>
            ))}

            {/* Used indicator - crossed out effect */}
            {used && (
                <line
                    x1={x + size * 0.2}
                    y1={y + size * 0.2}
                    x2={x + size * 0.8}
                    y2={y + size * 0.8}
                    stroke="var(--gg-danger)"
                    strokeWidth="3"
                    strokeLinecap="round"
                    opacity="0.6"
                />
            )}
        </g>
    );
});

Dice.displayName = 'Dice';
export default Dice;
