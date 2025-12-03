import React, { memo, useCallback, useRef } from 'react';
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

    const gradientId = color === 'light'
        ? 'gg-checker-light-gradient'
        : 'gg-checker-dark-gradient';

    const handlePointerDown = useCallback((e: React.PointerEvent) => {
        if (!isPlayable) return;

        e.currentTarget.setPointerCapture(e.pointerId);
        isDragging.current = true;
        startPos.current = { x: e.clientX, y: e.clientY };
        onDragStart(id);
    }, [isPlayable, id, onDragStart]);

    const handlePointerUp = useCallback((e: React.PointerEvent) => {
        if (!isDragging.current) return;

        isDragging.current = false;
        e.currentTarget.releasePointerCapture(e.pointerId);

        const dx = e.clientX - startPos.current.x;
        const dy = e.clientY - startPos.current.y;

        // If minimal movement, treat as click
        if (Math.abs(dx) < 5 && Math.abs(dy) < 5) {
            onClick();
        } else {
            onDragEnd(null); // Will be resolved by hit test
        }
    }, [onClick, onDragEnd]);

    return (
        <g
            style={{
                cursor: isPlayable ? 'grab' : 'default',
                zIndex,
            }}
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
            role="button"
            aria-label={`${color} checker${isPlayable ? ', playable' : ''}`}
            tabIndex={isPlayable ? 0 : -1}
        >
            {/* Shadow */}
            <ellipse
                cx={cx}
                cy={cy + radius * 0.15}
                rx={radius * 0.9}
                ry={radius * 0.3}
                fill="var(--gg-shadow)"
                opacity="0.4"
            />

            {/* Main body */}
            <circle
                cx={cx}
                cy={cy}
                r={radius}
                fill={`url(#${gradientId})`}
                stroke={color === 'light' ? '#a0a0a0' : '#2a2a2a'}
                strokeWidth="1.5"
                filter="url(#gg-checker-shadow)"
            />

            {/* Inner ring */}
            <circle
                cx={cx}
                cy={cy}
                r={radius * 0.7}
                fill="none"
                stroke={color === 'light' ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)'}
                strokeWidth="1"
            />

            {/* Highlight reflection */}
            <ellipse
                cx={cx - radius * 0.25}
                cy={cy - radius * 0.3}
                rx={radius * 0.35}
                ry={radius * 0.2}
                fill={color === 'light' ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.15)'}
            />

            {/* Playable indicator */}
            {isPlayable && (
                <circle
                    cx={cx}
                    cy={cy}
                    r={radius + 3}
                    fill="none"
                    stroke="var(--gg-primary)"
                    strokeWidth="2"
                    className="gg-checker-playable"
                    opacity="0.8"
                />
            )}

            {/* Selected indicator */}
            {isSelected && (
                <circle
                    cx={cx}
                    cy={cy}
                    r={radius + 5}
                    fill="none"
                    stroke="var(--gg-secondary)"
                    strokeWidth="3"
                    strokeDasharray="8 4"
                />
            )}
        </g>
    );
});

Checker.displayName = 'Checker';
export default Checker;
