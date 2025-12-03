import React, { memo, useMemo, useRef, useCallback } from 'react';
import { BoardState, PipIndex } from '../types';
import Triangle from './Triangle';
import Bar from './Bar';
import HomeZone from './HomeZone';
import CheckersLayer from './CheckersLayer';
import HighlightsOverlay from './HighlightsOverlay';
import Dice from './Dice';
import Cube from './Cube';
import { getPipFromCoordinates, BOARD_WIDTH, BOARD_HEIGHT, BAR_WIDTH, HOME_WIDTH, TRIANGLE_WIDTH, TRIANGLE_HEIGHT } from '../utils/coords';

interface BoardSVGProps {
    state: BoardState;
    selectedPip: PipIndex | 'bar' | null;
    onPipClick: (pip: PipIndex | 'bar' | 'borne') => void;
    onCheckerDragStart: (checkerId: string) => void;
    onCheckerDragEnd: (pip: PipIndex | 'bar' | 'borne' | null) => void;
    onDouble?: () => void;
    canDouble?: boolean;
}

const BoardSVG = memo<BoardSVGProps>(({
    state,
    selectedPip,
    onPipClick,
    onCheckerDragStart,
    onCheckerDragEnd,
    onDouble,
    canDouble = false
}) => {
    const svgRef = useRef<SVGSVGElement>(null);

    // Handle drop detection
    const handleDragEnd = useCallback((checkerId: string) => {
        // For now, just pass null - the actual drop target is handled by click
        onCheckerDragEnd(null);
    }, [onCheckerDragEnd]);

    // Generate triangles with memoization
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
                    isHighlighted={state.legalMoves.some(m => m.to === pip && m.from === selectedPip)}
                    onClick={() => onPipClick(pip)}
                />
            );
        }

        return result;
    }, [state.legalMoves, selectedPip, onPipClick]);

    // Check if current player can bear off
    const canBearOff = useMemo(() => {
        return state.legalMoves.some(m => m.to === 'borne');
    }, [state.legalMoves]);

    return (
        <svg
            ref={svgRef}
            viewBox={`0 0 ${BOARD_WIDTH} ${BOARD_HEIGHT}`}
            className="w-full h-full"
            style={{ background: 'var(--gg-bg)' }}
            role="application"
            aria-label="Backgammon board"
            aria-live="polite"
        >
            {/* Defs for gradients and filters */}
            <defs>
                {/* Board texture gradient */}
                <linearGradient id="gg-board-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#1a2332" />
                    <stop offset="50%" stopColor="var(--gg-bg)" />
                    <stop offset="100%" stopColor="#1a2332" />
                </linearGradient>

                {/* Triangle shine gradients (proper SVG gradients) */}
                <linearGradient id="gg-tri-shine-top" x1="50%" y1="0%" x2="50%" y2="100%">
                    <stop offset="0%" stopColor="rgba(255,255,255,0.12)" />
                    <stop offset="100%" stopColor="transparent" />
                </linearGradient>
                <linearGradient id="gg-tri-shine-bottom" x1="50%" y1="100%" x2="50%" y2="0%">
                    <stop offset="0%" stopColor="rgba(255,255,255,0.12)" />
                    <stop offset="100%" stopColor="transparent" />
                </linearGradient>

                {/* Triangle shadow filter */}
                <filter id="gg-triangle-shadow" x="-5%" y="-5%" width="110%" height="110%">
                    <feDropShadow dx="0" dy="1" stdDeviation="1" floodColor="#000" floodOpacity="0.3" />
                </filter>

                {/* Checker shadow - premium depth */}
                <filter id="gg-checker-shadow" x="-30%" y="-30%" width="160%" height="160%">
                    <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#000" floodOpacity="0.5" />
                </filter>

                {/* Checker glow for playable pieces */}
                <filter id="gg-checker-glow" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="6" result="blur" />
                    <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>

                {/* Light checker gradient - premium ivory look */}
                <radialGradient id="gg-checker-light-gradient" cx="35%" cy="25%" r="65%">
                    <stop offset="0%" stopColor="#FFFFFF" />
                    <stop offset="35%" stopColor="#F8F8F8" />
                    <stop offset="70%" stopColor="#E8E8E8" />
                    <stop offset="100%" stopColor="#B8B8B8" />
                </radialGradient>

                {/* Dark checker gradient - premium onyx look */}
                <radialGradient id="gg-checker-dark-gradient" cx="35%" cy="25%" r="65%">
                    <stop offset="0%" stopColor="#4a4a4a" />
                    <stop offset="35%" stopColor="#2a2a2a" />
                    <stop offset="70%" stopColor="#1a1a1a" />
                    <stop offset="100%" stopColor="#000000" />
                </radialGradient>

                {/* Cube gradient */}
                <linearGradient id="gg-cube-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#F0F0F0" />
                    <stop offset="50%" stopColor="#D0D0D0" />
                    <stop offset="100%" stopColor="#A0A0A0" />
                </linearGradient>

                {/* Board frame gradient */}
                <linearGradient id="gg-frame-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#2a3a4a" />
                    <stop offset="100%" stopColor="#1a2a3a" />
                </linearGradient>
            </defs>

            {/* Board frame/border */}
            <rect
                x="0"
                y="0"
                width={BOARD_WIDTH}
                height={BOARD_HEIGHT}
                fill="url(#gg-frame-gradient)"
                rx="8"
                ry="8"
            />

            {/* Inner board background */}
            <rect
                x="4"
                y="4"
                width={BOARD_WIDTH - 8}
                height={BOARD_HEIGHT - 8}
                fill="url(#gg-board-gradient)"
                rx="4"
                ry="4"
            />

            {/* Home zones */}
            <HomeZone
                x={0}
                y={0}
                width={HOME_WIDTH}
                height={BOARD_HEIGHT}
                side="light"
                onClick={() => onPipClick('borne')}
                isHighlighted={canBearOff && state.turn === 'light' && selectedPip !== null}
            />
            <HomeZone
                x={BOARD_WIDTH - HOME_WIDTH}
                y={0}
                width={HOME_WIDTH}
                height={BOARD_HEIGHT}
                side="dark"
                onClick={() => onPipClick('borne')}
                isHighlighted={canBearOff && state.turn === 'dark' && selectedPip !== null}
            />

            {/* Bar */}
            <Bar
                x={HOME_WIDTH + 6 * TRIANGLE_WIDTH}
                y={0}
                width={BAR_WIDTH}
                height={BOARD_HEIGHT}
                onClick={() => onPipClick('bar')}
            />

            {/* Triangles */}
            {triangles}

            {/* Highlights overlay for move hints */}
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

            {/* Checkers layer */}
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

            {/* Dice - positioned in center */}
            {state.dice.values && (
                <g aria-label="Dice">
                    <Dice
                        value={state.dice.values[0]}
                        x={BOARD_WIDTH / 2 - 55}
                        y={BOARD_HEIGHT / 2 - 22}
                        size={44}
                        rolling={state.dice.rolling}
                        used={state.dice.used?.[0] || false}
                    />
                    <Dice
                        value={state.dice.values[1]}
                        x={BOARD_WIDTH / 2 + 11}
                        y={BOARD_HEIGHT / 2 - 22}
                        size={44}
                        rolling={state.dice.rolling}
                        used={state.dice.used?.[1] || false}
                    />
                </g>
            )}

            {/* Cube - positioned based on owner */}
            <Cube
                state={state.cube}
                x={
                    state.cube.owner === 'center' 
                        ? HOME_WIDTH + 6 * TRIANGLE_WIDTH + BAR_WIDTH / 2 - 20
                        : state.cube.owner === 'light'
                            ? 20
                            : BOARD_WIDTH - 60
                }
                y={
                    state.cube.owner === 'center'
                        ? 20
                        : BOARD_HEIGHT / 2 - 20
                }
                size={40}
                canDouble={canDouble}
                onDouble={onDouble}
            />

        </svg>
    );
});

BoardSVG.displayName = 'BoardSVG';
export default BoardSVG;
