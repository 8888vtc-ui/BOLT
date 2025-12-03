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
    checkerCount?: number;
}

const HomeZone = memo<HomeZoneProps>(({ 
    x, 
    y, 
    width, 
    height, 
    side, 
    onClick, 
    isHighlighted,
    checkerCount = 0
}) => {
    const uniqueId = `home-${side}`;
    const isLight = side === 'light';
    
    return (
        <g 
            onClick={onClick} 
            role="button" 
            aria-label={`${side} Home Zone - bear off area${checkerCount > 0 ? `, ${checkerCount} checkers` : ''}`}
            tabIndex={0}
            style={{ cursor: 'pointer' }}
        >
            {/* Gradient definitions */}
            <defs>
                <linearGradient 
                    id={`${uniqueId}-bg`} 
                    x1={isLight ? "100%" : "0%"} 
                    y1="0%" 
                    x2={isLight ? "0%" : "100%"} 
                    y2="0%"
                >
                    <stop offset="0%" stopColor="#0d1520" />
                    <stop offset="100%" stopColor="#162133" />
                </linearGradient>
                <linearGradient id={`${uniqueId}-shine`} x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="rgba(255,255,255,0.03)" />
                    <stop offset="50%" stopColor="transparent" />
                    <stop offset="100%" stopColor="rgba(255,255,255,0.02)" />
                </linearGradient>
            </defs>

            {/* Main background */}
            <rect
                x={x}
                y={y}
                width={width}
                height={height}
                fill={`url(#${uniqueId}-bg)`}
            />

            {/* Shine overlay */}
            <rect
                x={x}
                y={y}
                width={width}
                height={height}
                fill={`url(#${uniqueId}-shine)`}
            />

            {/* Inner border */}
            <rect
                x={x + 2}
                y={y + 2}
                width={width - 4}
                height={height - 4}
                fill="none"
                stroke="rgba(255,255,255,0.05)"
                strokeWidth="1"
                rx={4}
            />

            {/* Checker slots visualization */}
            {Array.from({ length: 15 }).map((_, i) => {
                const slotY = y + 15 + i * ((height - 30) / 15);
                const isFilled = i < checkerCount;
                
                return (
                    <rect
                        key={i}
                        x={x + width * 0.15}
                        y={slotY}
                        width={width * 0.7}
                        height={((height - 30) / 15) - 2}
                        rx={2}
                        fill={isFilled 
                            ? (isLight ? 'rgba(248,250,252,0.3)' : 'rgba(30,41,59,0.5)')
                            : 'rgba(255,255,255,0.02)'
                        }
                        stroke={isFilled 
                            ? (isLight ? 'rgba(148,163,184,0.3)' : 'rgba(51,65,85,0.3)')
                            : 'transparent'
                        }
                        strokeWidth="0.5"
                    />
                );
            })}

            {/* Highlight overlay when valid drop target */}
            {isHighlighted && (
                <>
                    <rect
                        x={x}
                        y={y}
                        width={width}
                        height={height}
                        fill="var(--gg-highlight)"
                        className="gg-highlight-active"
                    />
                    {/* Animated border */}
                    <rect
                        x={x + 2}
                        y={y + 2}
                        width={width - 4}
                        height={height - 4}
                        fill="none"
                        stroke="var(--gg-primary)"
                        strokeWidth="2"
                        strokeDasharray="8 4"
                        rx={4}
                        className="gg-highlight-active"
                    />
                </>
            )}

            {/* Label */}
            <text
                x={x + width / 2}
                y={y + height / 2}
                transform={`rotate(-90 ${x + width / 2} ${y + height / 2})`}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize="12"
                fontWeight="600"
                fill="rgba(255,255,255,0.15)"
                fontFamily="'SF Pro Display', system-ui, sans-serif"
                style={{ userSelect: 'none' }}
            >
                {side.toUpperCase()} HOME
            </text>

            {/* Counter badge */}
            {checkerCount > 0 && (
                <g>
                    <circle
                        cx={x + width / 2}
                        cy={y + height - 25}
                        r={14}
                        fill={isLight ? '#F8FAFC' : '#1E293B'}
                        stroke={isLight ? '#94A3B8' : '#475569'}
                        strokeWidth="2"
                    />
                    <text
                        x={x + width / 2}
                        y={y + height - 25}
                        textAnchor="middle"
                        dominantBaseline="central"
                        fontSize="11"
                        fontWeight="bold"
                        fill={isLight ? '#1E293B' : '#F8FAFC'}
                        fontFamily="'SF Pro Display', system-ui, sans-serif"
                    >
                        {checkerCount}
                    </text>
                </g>
            )}
        </g>
    );
});

HomeZone.displayName = 'HomeZone';
export default HomeZone;
