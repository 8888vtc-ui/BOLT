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

    // Premium gradient colors
    const lightColors = {
        highlight: '#FFFFFF',
        main: '#F8FAFC',
        shadow: '#CBD5E1',
        rim: '#94A3B8',
        reflection: 'rgba(255,255,255,0.9)'
    };

    const darkColors = {
        highlight: '#475569',
        main: '#1E293B',
        shadow: '#0F172A',
        rim: '#334155',
        reflection: 'rgba(255,255,255,0.15)'
    };

    const colors = color === 'light' ? lightColors : darkColors;

    const handlePointerDown = useCallback((e: React.PointerEvent) => {
        if (!isPlayable) return;

        e.preventDefault();
        e.stopPropagation();
        (e.target as SVGElement).setPointerCapture(e.pointerId);
        isDragging.current = true;
        startPos.current = { x: e.clientX, y: e.clientY };
        setDragOffset({ x: 0, y: 0 });
        onDragStart(id);
    }, [isPlayable, id, onDragStart]);

    const handlePointerMove = useCallback((e: React.PointerEvent) => {
        if (!isDragging.current) return;

        const dx = e.clientX - startPos.current.x;
        const dy = e.clientY - startPos.current.y;
        setDragOffset({ x: dx, y: dy });
    }, []);

    const handlePointerUp = useCallback((e: React.PointerEvent) => {
        if (!isDragging.current) return;

        isDragging.current = false;
        (e.target as SVGElement).releasePointerCapture(e.pointerId);

        const dx = e.clientX - startPos.current.x;
        const dy = e.clientY - startPos.current.y;

        // If minimal movement, treat as click
        if (Math.abs(dx) < 5 && Math.abs(dy) < 5) {
            onClick();
        } else {
            // Drop - will be resolved by hit test in parent
            onDragEnd(null);
        }
        
        setDragOffset({ x: 0, y: 0 });
    }, [onClick, onDragEnd]);

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (!isPlayable) return;
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onClick();
        }
    }, [isPlayable, onClick]);

    // Apply drag offset for visual feedback
    const displayX = cx + dragOffset.x * 0.5; // Scale down SVG movement
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
            {/* Inline gradients for this checker */}
            <defs>
                {/* Main body gradient - 3D sphere effect */}
                <radialGradient 
                    id={`${uniqueId}-body`} 
                    cx="35%" 
                    cy="25%" 
                    r="65%" 
                    fx="30%" 
                    fy="20%"
                >
                    <stop offset="0%" stopColor={colors.highlight} />
                    <stop offset="45%" stopColor={colors.main} />
                    <stop offset="85%" stopColor={colors.shadow} />
                    <stop offset="100%" stopColor={colors.rim} />
                </radialGradient>

                {/* Top reflection */}
                <radialGradient 
                    id={`${uniqueId}-shine`} 
                    cx="40%" 
                    cy="30%" 
                    r="40%"
                >
                    <stop offset="0%" stopColor={colors.reflection} />
                    <stop offset="100%" stopColor="transparent" />
                </radialGradient>

                {/* Drop shadow filter */}
                <filter 
                    id={`${uniqueId}-shadow`} 
                    x="-50%" 
                    y="-50%" 
                    width="200%" 
                    height="200%"
                >
                    <feDropShadow 
                        dx="0" 
                        dy={isDraggingNow ? "6" : "2"} 
                        stdDeviation={isDraggingNow ? "4" : "2"} 
                        floodColor="#000" 
                        floodOpacity={isDraggingNow ? "0.5" : "0.35"} 
                    />
                </filter>

                {/* Glow filter for playable/selected */}
                <filter 
                    id={`${uniqueId}-glow`} 
                    x="-100%" 
                    y="-100%" 
                    width="300%" 
                    height="300%"
                >
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
            </defs>

            {/* Shadow ellipse - ground shadow */}
            <ellipse
                cx={displayX}
                cy={displayY + radius * 0.2}
                rx={radius * 0.85}
                ry={radius * 0.25}
                fill="rgba(0,0,0,0.3)"
                opacity={isDraggingNow ? 0.2 : 0.4}
            />

            {/* Main checker body */}
            <circle
                cx={displayX}
                cy={displayY}
                r={radius}
                fill={`url(#${uniqueId}-body)`}
                stroke={colors.rim}
                strokeWidth="1.5"
                filter={`url(#${uniqueId}-shadow)`}
                style={{
                    transition: isDraggingNow ? 'none' : 'all 0.15s ease-out',
                    transform: isDraggingNow ? 'scale(1.1)' : (isHovered && isPlayable ? 'scale(1.05)' : 'scale(1)'),
                    transformOrigin: `${displayX}px ${displayY}px`
                }}
            />

            {/* Inner ring - depth effect */}
            <circle
                cx={displayX}
                cy={displayY}
                r={radius * 0.72}
                fill="none"
                stroke={color === 'light' ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.08)'}
                strokeWidth="1"
            />

            {/* Center detail ring */}
            <circle
                cx={displayX}
                cy={displayY}
                r={radius * 0.5}
                fill="none"
                stroke={color === 'light' ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)'}
                strokeWidth="0.5"
            />

            {/* Top highlight reflection */}
            <ellipse
                cx={displayX - radius * 0.22}
                cy={displayY - radius * 0.28}
                rx={radius * 0.35}
                ry={radius * 0.22}
                fill={`url(#${uniqueId}-shine)`}
            />

            {/* Small specular highlight */}
            <circle
                cx={displayX - radius * 0.3}
                cy={displayY - radius * 0.35}
                r={radius * 0.08}
                fill={color === 'light' ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.25)'}
            />

            {/* Playable indicator - pulsing ring */}
            {isPlayable && !isSelected && (
                <circle
                    cx={displayX}
                    cy={displayY}
                    r={radius + 4}
                    fill="none"
                    stroke="var(--gg-primary)"
                    strokeWidth="2.5"
                    className="gg-checker-playable"
                    opacity="0.85"
                />
            )}

            {/* Selected indicator - animated dashed ring */}
            {isSelected && (
                <>
                    <circle
                        cx={displayX}
                        cy={displayY}
                        r={radius + 6}
                        fill="none"
                        stroke="var(--gg-secondary)"
                        strokeWidth="3"
                        strokeDasharray="10 5"
                        filter={`url(#${uniqueId}-glow)`}
                        style={{
                            animation: 'gg-selected-rotate 2s linear infinite'
                        }}
                    />
                    {/* Inner glow for selected */}
                    <circle
                        cx={displayX}
                        cy={displayY}
                        r={radius + 2}
                        fill="none"
                        stroke="var(--gg-secondary)"
                        strokeWidth="1"
                        opacity="0.5"
                    />
                </>
            )}

            {/* Hover highlight */}
            {isHovered && isPlayable && !isSelected && (
                <circle
                    cx={displayX}
                    cy={displayY}
                    r={radius + 2}
                    fill="none"
                    stroke="var(--gg-primary)"
                    strokeWidth="1.5"
                    opacity="0.6"
                />
            )}
        </g>
    );
});

Checker.displayName = 'Checker';
export default Checker;
