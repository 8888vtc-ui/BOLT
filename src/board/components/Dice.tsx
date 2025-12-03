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
    const pipRadius = size * 0.09;
    const cornerRadius = size * 0.18;
    const uniqueId = `dice-${x}-${y}`;

    return (
        <g
            className={rolling ? 'gg-dice-rolling' : ''}
            opacity={used ? 0.35 : 1}
            role="img"
            aria-label={`Die showing ${value}${used ? ', used' : ''}`}
        >
            {/* Die shadow */}
            <rect
                x={x + 2}
                y={y + 3}
                width={size}
                height={size}
                rx={cornerRadius}
                ry={cornerRadius}
                fill="rgba(0,0,0,0.3)"
            />

            {/* Die body */}
            <rect
                x={x}
                y={y}
                width={size}
                height={size}
                rx={cornerRadius}
                ry={cornerRadius}
                fill={`url(#${uniqueId}-gradient)`}
                stroke="rgba(0,0,0,0.15)"
                strokeWidth="1"
            />

            {/* Proper SVG gradient defined inline */}
            <defs>
                <linearGradient id={`${uniqueId}-gradient`} x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FFFFFF" />
                    <stop offset="30%" stopColor="var(--gg-die-face)" />
                    <stop offset="100%" stopColor="#D1D5DB" />
                </linearGradient>
            </defs>

            {/* Top highlight reflection */}
            <rect
                x={x + 2}
                y={y + 2}
                width={size - 4}
                height={size * 0.4}
                rx={cornerRadius - 2}
                fill="rgba(255,255,255,0.25)"
            />

            {/* Pips with depth effect */}
            {pips.map(([px, py], i) => (
                <g key={i}>
                    {/* Pip shadow */}
                    <circle
                        cx={x + px * size + 0.5}
                        cy={y + py * size + 0.5}
                        r={pipRadius}
                        fill="rgba(0,0,0,0.2)"
                    />
                    {/* Pip body */}
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

            {/* Used indicator - strikethrough */}
            {used && (
                <line
                    x1={x}
                    y1={y}
                    x2={x + size}
                    y2={y + size}
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
