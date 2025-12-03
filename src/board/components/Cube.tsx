import React, { memo } from 'react';
import { CubeState } from '../types';

interface CubeProps {
    state: CubeState;
    x: number;
    y: number;
    size: number;
    canDouble: boolean;
    onDouble?: () => void;
}

const Cube = memo<CubeProps>(({ state, x, y, size, canDouble, onDouble }) => {
    const { value, owner } = state;
    const cornerRadius = size * 0.12;
    const uniqueId = `cube-${x}-${y}`;

    // Determine colors based on owner
    const isOwned = owner !== 'center';
    const baseColor = isOwned ? '#34D399' : '#E5E7EB'; // Green if owned, gray if center
    const darkColor = isOwned ? '#10B981' : '#9CA3AF';
    const textColor = isOwned ? '#064E3B' : '#1F2937';

    return (
        <g
            onClick={canDouble ? onDouble : undefined}
            onKeyDown={(e) => canDouble && e.key === 'Enter' && onDouble?.()}
            style={{ cursor: canDouble ? 'pointer' : 'default' }}
            role="button"
            aria-label={`Doubling cube showing ${value}${owner !== 'center' ? `, owned by ${owner}` : ''}`}
            tabIndex={canDouble ? 0 : -1}
        >
            {/* Inline gradient definitions */}
            <defs>
                <linearGradient id={`${uniqueId}-gradient`} x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor={baseColor} />
                    <stop offset="50%" stopColor={darkColor} />
                    <stop offset="100%" stopColor={baseColor} />
                </linearGradient>
                <linearGradient id={`${uniqueId}-shine`} x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="rgba(255,255,255,0.5)" />
                    <stop offset="50%" stopColor="rgba(255,255,255,0.1)" />
                    <stop offset="100%" stopColor="transparent" />
                </linearGradient>
            </defs>

            {/* Shadow */}
            <rect
                x={x + 2}
                y={y + 3}
                width={size}
                height={size}
                rx={cornerRadius}
                ry={cornerRadius}
                fill="rgba(0,0,0,0.3)"
            />

            {/* Cube body with 3D effect */}
            <rect
                x={x}
                y={y}
                width={size}
                height={size}
                rx={cornerRadius}
                ry={cornerRadius}
                fill={`url(#${uniqueId}-gradient)`}
                stroke="rgba(0,0,0,0.2)"
                strokeWidth="1"
            />

            {/* Top shine overlay */}
            <rect
                x={x + 2}
                y={y + 2}
                width={size - 4}
                height={size / 2 - 2}
                rx={cornerRadius - 1}
                ry={cornerRadius - 1}
                fill={`url(#${uniqueId}-shine)`}
            />

            {/* Inner border for depth */}
            <rect
                x={x + 3}
                y={y + 3}
                width={size - 6}
                height={size - 6}
                rx={cornerRadius - 2}
                ry={cornerRadius - 2}
                fill="none"
                stroke="rgba(255,255,255,0.15)"
                strokeWidth="1"
            />

            {/* Value text with shadow */}
            <text
                x={x + size / 2 + 0.5}
                y={y + size / 2 + 1.5}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={size * 0.55}
                fontWeight="bold"
                fill="rgba(0,0,0,0.2)"
                fontFamily="'SF Pro Display', system-ui, sans-serif"
            >
                {value}
            </text>
            <text
                x={x + size / 2}
                y={y + size / 2}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={size * 0.55}
                fontWeight="bold"
                fill={textColor}
                fontFamily="'SF Pro Display', system-ui, sans-serif"
            >
                {value}
            </text>

            {/* Can double indicator - pulsing border */}
            {canDouble && (
                <rect
                    x={x - 3}
                    y={y - 3}
                    width={size + 6}
                    height={size + 6}
                    rx={cornerRadius + 3}
                    ry={cornerRadius + 3}
                    fill="none"
                    stroke="var(--gg-primary)"
                    strokeWidth="2"
                    strokeDasharray="6 3"
                    className="gg-checker-playable"
                />
            )}

            {/* Owner indicator arrow */}
            {owner !== 'center' && (
                <polygon
                    points={
                        owner === 'light'
                            ? `${x + size / 2},${y + size + 8} ${x + size / 2 - 6},${y + size + 2} ${x + size / 2 + 6},${y + size + 2}`
                            : `${x + size / 2},${y - 8} ${x + size / 2 - 6},${y - 2} ${x + size / 2 + 6},${y - 2}`
                    }
                    fill={baseColor}
                    stroke="rgba(0,0,0,0.2)"
                    strokeWidth="1"
                />
            )}
        </g>
    );
});

Cube.displayName = 'Cube';
export default Cube;
