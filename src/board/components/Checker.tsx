import React, { memo, useCallback, useRef, useState } from 'react';
import { Color, PipIndex } from '../types';

interface CheckerProps {
    id: string;
    color: Color;
    cx: number;
    cy: number;
    radius: number;
    isPlayable: boolean;
    isSelected: boolean;
    zIndex: number;
    onDragStart: (id: string) => void;
    onDragEnd: (pip: PipIndex | 'bar' | 'borne' | null) => void;
    onClick: () => void;
}

const Checker = memo<CheckerProps>(({
    id,
    color,
    cx,
    cy,
    radius,
    isPlayable,
    isSelected,
    zIndex,
    onDragStart,
    onDragEnd,
    onClick
}) => {
    const isDragging = useRef(false);
    const startPos = useRef({ x: 0, y: 0 });
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const [isHovered, setIsHovered] = useState(false);

    const uniqueId = `checker-${id}`;

    // LUXURY COLOR PALETTE - Premium Ivory & Ebony
    const lightColors = {
        // Ivory Pearl - Luxury white with warm undertones
        highlight: '#FFFEF8',      // Pure warm white
        main: '#F5F3E8',          // Ivory base
        mid: '#E8E4D5',           // Warm beige
        shadow: '#D4C9B0',        // Rich shadow
        rim: '#C4B89A',          // Darker rim
        border: '#D4AF37',        // Gold border accent
        reflection: 'rgba(255, 255, 255, 0.95)',
        innerGlow: 'rgba(255, 248, 220, 0.4)'
    };

    const darkColors = {
        // Ebony Onyx - Deep black with blue undertones
        highlight: '#2A2D35',     // Dark blue-grey highlight
        main: '#1A1C22',          // Deep ebony base
        mid: '#0F1115',           // Almost black
        shadow: '#050608',        // Pure black shadow
        rim: '#000000',           // Black rim
        border: '#FFD700',        // Gold border accent
        reflection: 'rgba(255, 255, 255, 0.12)',
        innerGlow: 'rgba(100, 100, 120, 0.3)'
    };

    const colors = color === 'light' ? lightColors : darkColors;

    const handlePointerDown = useCallback((e: React.PointerEvent) => {
        console.log('[Checker] PointerDown:', { isPlayable, id, color });
        if (!isPlayable) {
            console.log('[Checker] Not playable, ignoring pointerDown');
            return;
        }

        e.preventDefault();
        e.stopPropagation();
        if (e.target instanceof SVGElement) {
            (e.target as SVGElement).setPointerCapture(e.pointerId);
        }
        isDragging.current = true;
        startPos.current = { x: e.clientX, y: e.clientY };
        setDragOffset({ x: 0, y: 0 });
        onDragStart(id);
        console.log('[Checker] PointerDown captured, isDragging set to true');
    }, [isPlayable, id, color, onDragStart]);

    const handlePointerMove = useCallback((e: React.PointerEvent) => {
        if (!isDragging.current) return;

        const dx = e.clientX - startPos.current.x;
        const dy = e.clientY - startPos.current.y;
        setDragOffset({ x: dx, y: dy });
    }, []);

    const handlePointerUp = useCallback((e: React.PointerEvent) => {
        const wasDragging = isDragging.current;
        isDragging.current = false;
        
        if (e.target instanceof SVGElement) {
            (e.target as SVGElement).releasePointerCapture(e.pointerId);
        }

        if (wasDragging) {
            const dx = e.clientX - startPos.current.x;
            const dy = e.clientY - startPos.current.y;

            // If minimal movement, treat as click
            if (Math.abs(dx) < 5 && Math.abs(dy) < 5) {
                console.log('[Checker] Click detected, calling onClick');
                onClick();
            } else {
                // Drop - will be resolved by hit test in parent
                onDragEnd(null);
            }
        } else {
            // If pointerDown was never captured, treat as click anyway
            console.log('[Checker] PointerUp without drag, treating as click');
            if (isPlayable) {
                onClick();
            }
        }
        
        setDragOffset({ x: 0, y: 0 });
    }, [onClick, onDragEnd, isPlayable]);

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (!isPlayable) return;
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onClick();
        }
    }, [isPlayable, onClick]);

    // Apply drag offset for visual feedback
    const displayX = cx + dragOffset.x * 0.5;
    const displayY = cy + dragOffset.y * 0.5;
    const isDraggingNow = dragOffset.x !== 0 || dragOffset.y !== 0;

    return (
        <g
            style={{
                cursor: isPlayable ? (isDraggingNow ? 'grabbing' : 'grab') : 'default',
            }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerEnter={() => setIsHovered(true)}
            onPointerLeave={() => setIsHovered(false)}
            onKeyDown={handleKeyDown}
            role="button"
            aria-label={`${color} checker${isPlayable ? ', playable' : ''}${isSelected ? ', selected' : ''}`}
            tabIndex={isPlayable ? 0 : -1}
            data-z={zIndex}
        >
            {/* LUXURY GRADIENTS */}
            <defs>
                {/* Main body - Ultra premium 3D sphere with multiple stops */}
                <radialGradient 
                    id={`${uniqueId}-body`} 
                    cx="32%" 
                    cy="22%" 
                    r="68%" 
                    fx="28%" 
                    fy="18%"
                >
                    <stop offset="0%" stopColor={colors.highlight} stopOpacity="1" />
                    <stop offset="25%" stopColor={colors.main} stopOpacity="1" />
                    <stop offset="55%" stopColor={colors.mid} stopOpacity="1" />
                    <stop offset="80%" stopColor={colors.shadow} stopOpacity="1" />
                    <stop offset="100%" stopColor={colors.rim} stopOpacity="1" />
                </radialGradient>

                {/* Secondary highlight - side light */}
                <radialGradient 
                    id={`${uniqueId}-side-light`} 
                    cx="70%" 
                    cy="30%" 
                    r="50%"
                >
                    <stop offset="0%" stopColor={color === 'light' ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.15)'} />
                    <stop offset="100%" stopColor="transparent" />
                </radialGradient>

                {/* Top reflection - luxury shine */}
                <radialGradient 
                    id={`${uniqueId}-shine`} 
                    cx="38%" 
                    cy="28%" 
                    r="45%"
                >
                    <stop offset="0%" stopColor={colors.reflection} />
                    <stop offset="40%" stopColor={color === 'light' ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.08)'} />
                    <stop offset="100%" stopColor="transparent" />
                </radialGradient>

                {/* Inner glow - depth effect */}
                <radialGradient 
                    id={`${uniqueId}-inner-glow`} 
                    cx="50%" 
                    cy="50%" 
                    r="50%"
                >
                    <stop offset="0%" stopColor={colors.innerGlow} />
                    <stop offset="100%" stopColor="transparent" />
                </radialGradient>

                {/* Gold border gradient */}
                <linearGradient 
                    id={`${uniqueId}-gold-border`} 
                    x1="0%" 
                    y1="0%" 
                    x2="100%" 
                    y2="100%"
                >
                    <stop offset="0%" stopColor="#FFD700" />
                    <stop offset="50%" stopColor="#FFA500" />
                    <stop offset="100%" stopColor="#FFD700" />
                </linearGradient>

                {/* Premium drop shadow */}
                <filter 
                    id={`${uniqueId}-shadow`} 
                    x="-60%" 
                    y="-60%" 
                    width="220%" 
                    height="220%"
                >
                    <feGaussianBlur in="SourceAlpha" stdDeviation="3" />
                    <feOffset dx="0" dy={isDraggingNow ? "8" : "3"} result="offsetblur" />
                    <feComponentTransfer>
                        <feFuncA type="linear" slope={isDraggingNow ? "0.6" : "0.4"} />
                    </feComponentTransfer>
                    <feMerge>
                        <feMergeNode />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>

                {/* Luxury glow for playable/selected */}
                <filter 
                    id={`${uniqueId}-glow`} 
                    x="-150%" 
                    y="-150%" 
                    width="400%" 
                    height="400%"
                >
                    <feGaussianBlur stdDeviation="5" result="coloredBlur" />
                    <feMerge>
                        <feMergeNode in="coloredBlur" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
            </defs>

            {/* Ground shadow - luxury depth */}
            <ellipse
                cx={displayX}
                cy={displayY + radius * 0.25}
                rx={radius * 0.92}
                ry={radius * 0.28}
                fill="rgba(0,0,0,0.5)"
                opacity={isDraggingNow ? 0.3 : 0.5}
            />

            {/* Main checker body - LUXURY SPHERE */}
            <circle
                cx={displayX}
                cy={displayY}
                r={radius}
                fill={`url(#${uniqueId}-body)`}
                stroke={colors.border}
                strokeWidth={isPlayable || isSelected ? "2.5" : "1.8"}
                filter={`url(#${uniqueId}-shadow)`}
                style={{
                    transition: isDraggingNow ? 'none' : 'all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
                    transform: isDraggingNow ? 'scale(1.12)' : (isHovered && isPlayable ? 'scale(1.06)' : 'scale(1)'),
                    transformOrigin: `${displayX}px ${displayY}px`
                }}
            />

            {/* Side light reflection */}
            <ellipse
                cx={displayX + radius * 0.25}
                cy={displayY - radius * 0.15}
                rx={radius * 0.4}
                ry={radius * 0.25}
                fill={`url(#${uniqueId}-side-light)`}
            />

            {/* Inner glow ring */}
            <circle
                cx={displayX}
                cy={displayY}
                r={radius * 0.75}
                fill={`url(#${uniqueId}-inner-glow)`}
            />

            {/* Inner decorative ring - luxury detail */}
            <circle
                cx={displayX}
                cy={displayY}
                r={radius * 0.68}
                fill="none"
                stroke={color === 'light' ? 'rgba(0,0,0,0.12)' : 'rgba(255,255,255,0.12)'}
                strokeWidth="1.2"
            />

            {/* Center detail ring - premium accent */}
            <circle
                cx={displayX}
                cy={displayY}
                r={radius * 0.48}
                fill="none"
                stroke={color === 'light' ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.08)'}
                strokeWidth="0.8"
            />

            {/* Top highlight reflection - luxury shine */}
            <ellipse
                cx={displayX - radius * 0.2}
                cy={displayY - radius * 0.26}
                rx={radius * 0.38}
                ry={radius * 0.24}
                fill={`url(#${uniqueId}-shine)`}
            />

            {/* Primary specular highlight - bright spot */}
            <circle
                cx={displayX - radius * 0.28}
                cy={displayY - radius * 0.32}
                r={radius * 0.12}
                fill={color === 'light' ? 'rgba(255,255,255,0.98)' : 'rgba(255,255,255,0.3)'}
            />

            {/* Secondary highlight - smaller spot */}
            <circle
                cx={displayX - radius * 0.15}
                cy={displayY - radius * 0.2}
                r={radius * 0.06}
                fill={color === 'light' ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.2)'}
            />

            {/* Playable indicator - luxury gold ring */}
            {isPlayable && !isSelected && (
                <circle
                    cx={displayX}
                    cy={displayY}
                    r={radius + 5}
                    fill="none"
                    stroke="url(#gg-checker-light-gradient)"
                    strokeWidth="3"
                    className="gg-checker-playable"
                    opacity="0.9"
                    style={{
                        stroke: colors.border,
                        filter: 'url(#gg-checker-glow)'
                    }}
                />
            )}

            {/* Selected indicator - premium animated gold ring */}
            {isSelected && (
                <>
                    <circle
                        cx={displayX}
                        cy={displayY}
                        r={radius + 7}
                        fill="none"
                        stroke="url(#gg-checker-light-gradient)"
                        strokeWidth="3.5"
                        strokeDasharray="12 6"
                        filter={`url(#${uniqueId}-glow)`}
                        style={{
                            stroke: colors.border,
                            animation: 'gg-selected-rotate 2s linear infinite'
                        }}
                    />
                    {/* Inner glow for selected */}
                    <circle
                        cx={displayX}
                        cy={displayY}
                        r={radius + 3}
                        fill="none"
                        stroke={colors.border}
                        strokeWidth="1.5"
                        opacity="0.6"
                    />
                </>
            )}

            {/* Hover highlight - subtle luxury glow */}
            {isHovered && isPlayable && !isSelected && (
                <circle
                    cx={displayX}
                    cy={displayY}
                    r={radius + 3}
                    fill="none"
                    stroke={colors.border}
                    strokeWidth="2"
                    opacity="0.7"
                    style={{
                        filter: 'url(#gg-checker-glow)'
                    }}
                />
            )}
        </g>
    );
});

Checker.displayName = 'Checker';
export default Checker;
