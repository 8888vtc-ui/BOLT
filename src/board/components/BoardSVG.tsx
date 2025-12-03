import React, { memo, useMemo } from 'react';
import { BoardState, PipIndex } from '../types';
import Triangle from './Triangle';
import Bar from './Bar';
import HomeZone from './HomeZone';
import CheckersLayer from './CheckersLayer';
import HighlightsOverlay from './HighlightsOverlay';
import Dice from './Dice';
import Cube from './Cube';
import { BOARD_WIDTH, BOARD_HEIGHT, BAR_WIDTH, HOME_WIDTH, TRIANGLE_WIDTH, TRIANGLE_HEIGHT } from '../utils/coords';

interface BoardSVGProps {
    state: BoardState;
    selectedPip: PipIndex | 'bar' | null;
    onPipClick: (pip: PipIndex | 'bar' | 'borne') => void;
    onCheckerDragStart: (checkerId: string) => void;
    onCheckerDragEnd: (pip: PipIndex | 'bar' | 'borne' | null) => void;
    onRollDice?: () => void;
    onDouble?: () => void;
    canRoll?: boolean;
    canDouble?: boolean;
}

const BoardSVG = memo<BoardSVGProps>(({
    state,
    selectedPip,
    onPipClick,
    onCheckerDragStart,
    onCheckerDragEnd,
    onRollDice,
    onDouble,
    canRoll = false,
    canDouble = false
}) => {
    // Count checkers in home zones for display
    const lightHomeCount = useMemo(() => 
        state.checkers.filter(c => c.pip === 'borne' && c.color === 'light').length,
        [state.checkers]
    );
    const darkHomeCount = useMemo(() => 
        state.checkers.filter(c => c.pip === 'borne' && c.color === 'dark').length,
        [state.checkers]
    );

    // Generate triangles with proper positioning
    const triangles = useMemo(() => {
        const result: JSX.Element[] = [];

        for (let i = 1; i <= 24; i++) {
            const pip = i as PipIndex;
            const isTop = i >= 13;
            const isLeftHalf = (i >= 7 && i <= 12) || (i >= 13 && i <= 18);

            let x: number;
            if (isLeftHalf) {
                const idx = isTop ? (i - 13) : (12 - i);
                x = HOME_WIDTH + idx * TRIANGLE_WIDTH;
            } else {
                const idx = isTop ? (i - 19) : (6 - i);
                x = HOME_WIDTH + 6 * TRIANGLE_WIDTH + BAR_WIDTH + idx * TRIANGLE_WIDTH;
            }

            const y = isTop ? 0 : BOARD_HEIGHT;
            const isDark = i % 2 === 0;

            // Check if this pip is a valid destination for the selected checker
            const isHighlighted = selectedPip !== null && 
                state.legalMoves.some(m => m.to === pip && m.from === selectedPip);

            result.push(
                <Triangle
                    key={pip}
                    pip={pip}
                    x={x}
                    y={y}
                    width={TRIANGLE_WIDTH}
                    height={TRIANGLE_HEIGHT}
                    isTop={isTop}
                    isDark={isDark}
                    isHighlighted={isHighlighted}
                    onClick={() => onPipClick(pip)}
                />
            );
        }

        return result;
    }, [state.legalMoves, selectedPip, onPipClick]);

    // Check if borne is a valid destination
    const isBorneHighlighted = selectedPip !== null && 
        state.legalMoves.some(m => m.to === 'borne' && m.from === selectedPip);

    return (
        <svg
            viewBox={`0 0 ${BOARD_WIDTH} ${BOARD_HEIGHT}`}
            className="w-full h-full"
            preserveAspectRatio="xMidYMid meet"
            role="application"
            aria-label="Backgammon board - GuruGammon"
        >
            {/* ═══════════════════════════════════════════════════════════════
                SVG Definitions - Gradients, Filters, Patterns
                ═══════════════════════════════════════════════════════════════ */}
            <defs>
                {/* Board background gradient */}
                <linearGradient id="gg-board-bg" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#0d1520" />
                    <stop offset="15%" stopColor="#0B0F1A" />
                    <stop offset="85%" stopColor="#0B0F1A" />
                    <stop offset="100%" stopColor="#0d1520" />
                </linearGradient>

                {/* Playing surface gradient */}
                <linearGradient id="gg-surface-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#111827" />
                    <stop offset="50%" stopColor="#0f1729" />
                    <stop offset="100%" stopColor="#111827" />
                </linearGradient>

                {/* Felt texture pattern */}
                <pattern id="gg-felt" patternUnits="userSpaceOnUse" width="6" height="6">
                    <rect width="6" height="6" fill="transparent" />
                    <circle cx="1" cy="1" r="0.5" fill="rgba(255,255,255,0.01)" />
                    <circle cx="4" cy="4" r="0.5" fill="rgba(0,0,0,0.02)" />
                </pattern>

                {/* Light checker gradient - LUXURY Ivory Pearl */}
                <radialGradient id="gg-checker-light-gradient" cx="32%" cy="22%" r="68%" fx="28%" fy="18%">
                    <stop offset="0%" stopColor="#FFFEF8" />
                    <stop offset="25%" stopColor="#F5F3E8" />
                    <stop offset="55%" stopColor="#E8E4D5" />
                    <stop offset="80%" stopColor="#D4C9B0" />
                    <stop offset="100%" stopColor="#C4B89A" />
                </radialGradient>

                {/* Dark checker gradient - LUXURY Ebony Onyx */}
                <radialGradient id="gg-checker-dark-gradient" cx="32%" cy="22%" r="68%" fx="28%" fy="18%">
                    <stop offset="0%" stopColor="#2A2D35" />
                    <stop offset="25%" stopColor="#1A1C22" />
                    <stop offset="55%" stopColor="#0F1115" />
                    <stop offset="80%" stopColor="#050608" />
                    <stop offset="100%" stopColor="#000000" />
                </radialGradient>

                {/* Checker shadow filter */}
                <filter id="gg-checker-shadow" x="-30%" y="-30%" width="160%" height="160%">
                    <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#000" floodOpacity="0.4" />
                </filter>

                {/* Checker glow filter for playable/selected */}
                <filter id="gg-checker-glow" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="4" result="blur" />
                    <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>

                {/* Board frame shadow */}
                <filter id="gg-frame-shadow" x="-10%" y="-10%" width="120%" height="120%">
                    <feDropShadow dx="0" dy="4" stdDeviation="8" floodColor="#000" floodOpacity="0.5" />
                </filter>

                {/* Inner glow for surface */}
                <filter id="gg-inner-glow" x="-10%" y="-10%" width="120%" height="120%">
                    <feGaussianBlur in="SourceAlpha" stdDeviation="3" result="blur" />
                    <feOffset in="blur" dx="0" dy="0" result="offsetBlur" />
                    <feFlood floodColor="#34D399" floodOpacity="0.1" result="color" />
                    <feComposite in="color" in2="offsetBlur" operator="in" result="shadow" />
                    <feComposite in="shadow" in2="SourceGraphic" operator="over" />
                </filter>
            </defs>

            {/* ═══════════════════════════════════════════════════════════════
                Board Background & Frame
                ═══════════════════════════════════════════════════════════════ */}
            
            {/* Outer background */}
            <rect
                x="0"
                y="0"
                width={BOARD_WIDTH}
                height={BOARD_HEIGHT}
                fill="url(#gg-board-bg)"
            />

            {/* Playing surface */}
            <rect
                x={HOME_WIDTH - 5}
                y="5"
                width={BOARD_WIDTH - 2 * HOME_WIDTH + 10}
                height={BOARD_HEIGHT - 10}
                rx="8"
                fill="url(#gg-surface-gradient)"
                filter="url(#gg-frame-shadow)"
            />

            {/* Felt texture overlay */}
            <rect
                x={HOME_WIDTH - 5}
                y="5"
                width={BOARD_WIDTH - 2 * HOME_WIDTH + 10}
                height={BOARD_HEIGHT - 10}
                rx="8"
                fill="url(#gg-felt)"
            />

            {/* ═══════════════════════════════════════════════════════════════
                Home Zones
                ═══════════════════════════════════════════════════════════════ */}
            <HomeZone
                x={0}
                y={0}
                width={HOME_WIDTH}
                height={BOARD_HEIGHT}
                side="dark"
                onClick={() => onPipClick('borne')}
                isHighlighted={isBorneHighlighted && state.turn === 'dark'}
                checkerCount={darkHomeCount}
            />
            <HomeZone
                x={BOARD_WIDTH - HOME_WIDTH}
                y={0}
                width={HOME_WIDTH}
                height={BOARD_HEIGHT}
                side="light"
                onClick={() => onPipClick('borne')}
                isHighlighted={isBorneHighlighted && state.turn === 'light'}
                checkerCount={lightHomeCount}
            />

            {/* ═══════════════════════════════════════════════════════════════
                Bar (Center)
                ═══════════════════════════════════════════════════════════════ */}
            <Bar
                x={HOME_WIDTH + 6 * TRIANGLE_WIDTH}
                y={0}
                width={BAR_WIDTH}
                height={BOARD_HEIGHT}
                onClick={() => onPipClick('bar')}
            />

            {/* ═══════════════════════════════════════════════════════════════
                Triangles (Points)
                ═══════════════════════════════════════════════════════════════ */}
            {triangles}

            {/* ═══════════════════════════════════════════════════════════════
                Highlights Overlay (Move Hints)
                ═══════════════════════════════════════════════════════════════ */}
            <HighlightsOverlay
                legalMoves={state.legalMoves}
                selectedPip={selectedPip}
                triangleWidth={TRIANGLE_WIDTH}
                triangleHeight={TRIANGLE_HEIGHT}
                homeWidth={HOME_WIDTH}
                barWidth={BAR_WIDTH}
                boardWidth={BOARD_WIDTH}
                boardHeight={BOARD_HEIGHT}
            />

            {/* ═══════════════════════════════════════════════════════════════
                Checkers Layer
                ═══════════════════════════════════════════════════════════════ */}
            <CheckersLayer
                checkers={state.checkers}
                turn={state.turn}
                legalMoves={state.legalMoves}
                selectedPip={selectedPip}
                triangleWidth={TRIANGLE_WIDTH}
                triangleHeight={TRIANGLE_HEIGHT}
                homeWidth={HOME_WIDTH}
                barWidth={BAR_WIDTH}
                boardWidth={BOARD_WIDTH}
                boardHeight={BOARD_HEIGHT}
                onDragStart={onCheckerDragStart}
                onDragEnd={onCheckerDragEnd}
                onCheckerClick={(pip) => onPipClick(pip)}
            />

            {/* ═══════════════════════════════════════════════════════════════
                Dice (Center of board)
                ═══════════════════════════════════════════════════════════════ */}
            {state.dice.values && (
                <g aria-label="Dice">
                    <Dice
                        value={state.dice.values[0]}
                        x={BOARD_WIDTH / 2 - 70}
                        y={BOARD_HEIGHT / 2 - 22}
                        size={44}
                        rolling={state.dice.rolling}
                        used={state.dice.used?.[0] || false}
                    />
                    <Dice
                        value={state.dice.values[1]}
                        x={BOARD_WIDTH / 2 + 26}
                        y={BOARD_HEIGHT / 2 - 22}
                        size={44}
                        rolling={state.dice.rolling}
                        used={state.dice.used?.[1] || false}
                    />
                </g>
            )}

            {/* Roll Dice Button (when no dice shown) */}
            {!state.dice.values && !state.dice.rolling && canRoll && (
                <g 
                    onClick={onRollDice}
                    style={{ cursor: 'pointer' }}
                    role="button"
                    aria-label="Roll dice"
                    tabIndex={0}
                >
                    <rect
                        x={BOARD_WIDTH / 2 - 60}
                        y={BOARD_HEIGHT / 2 - 20}
                        width={120}
                        height={40}
                        rx={20}
                        fill="var(--gg-primary-600)"
                        filter="url(#gg-checker-shadow)"
                    />
                    <text
                        x={BOARD_WIDTH / 2}
                        y={BOARD_HEIGHT / 2}
                        textAnchor="middle"
                        dominantBaseline="central"
                        fontSize="14"
                        fontWeight="bold"
                        fill="white"
                        fontFamily="'SF Pro Display', system-ui, sans-serif"
                    >
                        ROLL DICE
                    </text>
                </g>
            )}

            {/* ═══════════════════════════════════════════════════════════════
                Doubling Cube
                ═══════════════════════════════════════════════════════════════ */}
            <Cube
                state={state.cube}
                x={HOME_WIDTH + 6 * TRIANGLE_WIDTH + BAR_WIDTH / 2 - 22}
                y={BOARD_HEIGHT / 2 - 22}
                size={44}
                canDouble={canDouble}
                onDouble={onDouble}
            />

            {/* ═══════════════════════════════════════════════════════════════
                Board Labels & Decorations
                ═══════════════════════════════════════════════════════════════ */}
            
            {/* GuruGammon watermark */}
            <text
                x={BOARD_WIDTH / 2}
                y={BOARD_HEIGHT - 8}
                textAnchor="middle"
                fontSize="8"
                fill="rgba(255,255,255,0.1)"
                fontFamily="'SF Pro Display', system-ui, sans-serif"
                fontWeight="500"
                style={{ userSelect: 'none' }}
            >
                GURUGAMMON
            </text>
        </svg>
    );
});

BoardSVG.displayName = 'BoardSVG';
export default BoardSVG;
