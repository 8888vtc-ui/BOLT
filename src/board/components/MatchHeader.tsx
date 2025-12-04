import React, { memo, useEffect, useState } from 'react';
import { MatchState } from '../types';

interface MatchHeaderProps {
    state: MatchState;
    cubeValue: number;
    cubeOwner: 'center' | 'light' | 'dark';
}

const formatTime = (ms: number): string => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

const MatchHeader = memo<MatchHeaderProps>(({ state, cubeValue, cubeOwner }) => {
    const { players, score, limitPoints, stakes, timers } = state;
    
    // Protection contre players null ou undefined
    if (!players || players.length < 2) {
        return null; // Ne pas rendre si players n'est pas valide
    }
    const [time1, setTime1] = useState(timers[0].msRemaining);
    const [time2, setTime2] = useState(timers[1].msRemaining);

    // Timer effect
    useEffect(() => {
        const interval = setInterval(() => {
            if (document.hasFocus()) {
                if (timers[0].running && time1 > 0) {
                    setTime1(t => Math.max(0, t - 1000));
                }
                if (timers[1].running && time2 > 0) {
                    setTime2(t => Math.max(0, t - 1000));
                }
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [timers, time1, time2]);

    return (
        <div
            className="flex items-center justify-between px-4 py-3 rounded-lg"
            style={{ background: 'var(--gg-surface)' }}
            role="region"
            aria-label="Match information"
        >
            {/* Player 1 */}
            <div className="flex items-center gap-3">
                <div
                    className="w-4 h-4 rounded-full"
                    style={{ background: 'var(--gg-checker-light)' }}
                />
                <div>
                    <div className="flex items-center gap-2">
                        <span className="font-bold" style={{ color: 'var(--gg-text)' }}>
                            {players[0].handle}
                        </span>
                        {players[0].countryCode && (
                            <span className="text-xs" style={{ color: 'var(--gg-muted)' }}>
                                {players[0].countryCode}
                            </span>
                        )}
                        <span
                            className={`w-2 h-2 rounded-full ${players[0].connected ? 'bg-green-500' : 'bg-red-500'}`}
                        />
                    </div>
                    <div className="text-sm" style={{ color: 'var(--gg-muted)' }}>
                        Rating: {players[0].rating}
                    </div>
                </div>
                <div
                    className="px-3 py-1 rounded font-mono text-lg font-bold"
                    style={{
                        background: timers[0].running ? 'var(--gg-primary-600)' : 'var(--gg-bar)',
                        color: 'var(--gg-text)'
                    }}
                >
                    {formatTime(time1)}
                </div>
            </div>

            {/* Score & Cube */}
            <div className="flex items-center gap-6">
                <div className="text-center">
                    <div
                        className="text-3xl font-bold"
                        style={{ color: 'var(--gg-text)' }}
                    >
                        {score[0]} - {score[1]}
                    </div>
                    <div className="text-xs" style={{ color: 'var(--gg-muted)' }}>
                        Match to {limitPoints} {stakes && `• ${stakes}`}
                    </div>
                </div>

                {/* Cube info */}
                <div
                    className="flex items-center gap-2 px-3 py-2 rounded"
                    style={{ background: 'var(--gg-bar)' }}
                >
                    <div
                        className="w-8 h-8 rounded flex items-center justify-center font-bold"
                        style={{
                            background: cubeOwner === 'center' ? 'var(--gg-cube)' : 'var(--gg-cube-owned)',
                            color: 'var(--gg-bg)'
                        }}
                    >
                        {cubeValue}
                    </div>
                    <span className="text-xs" style={{ color: 'var(--gg-muted)' }}>
                        {cubeOwner === 'center' ? 'Center' : cubeOwner === 'light' ? 'Light' : 'Dark'}
                    </span>
                </div>
            </div>

            {/* Player 2 */}
            <div className="flex items-center gap-3">
                <div
                    className="px-3 py-1 rounded font-mono text-lg font-bold"
                    style={{
                        background: timers[1].running ? 'var(--gg-primary-600)' : 'var(--gg-bar)',
                        color: 'var(--gg-text)'
                    }}
                >
                    {formatTime(time2)}
                </div>
                <div className="text-right">
                    <div className="flex items-center gap-2 justify-end">
                        <span
                            className={`w-2 h-2 rounded-full ${players[1].connected ? 'bg-green-500' : 'bg-red-500'}`}
                        />
                        {players[1].countryCode && (
                            <span className="text-xs" style={{ color: 'var(--gg-muted)' }}>
                                {players[1].countryCode}
                            </span>
                        )}
                        <span className="font-bold" style={{ color: 'var(--gg-text)' }}>
                            {players[1].handle}
                        </span>
                    </div>
                    <div className="text-sm" style={{ color: 'var(--gg-muted)' }}>
                        Rating: {players[1].rating}
                    </div>
                </div>
                <div
                    className="w-4 h-4 rounded-full"
                    style={{ background: 'var(--gg-checker-dark)' }}
                />
            </div>
        </div>
    );
});

MatchHeader.displayName = 'MatchHeader';
export default MatchHeader;
