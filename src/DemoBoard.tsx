import React, { useState } from 'react';
import BoardWrap from './board/components/BoardWrap';
import { BoardState, MatchState } from './board/types';

const initialBoardState: BoardState = {
    checkers: [
        // White (Light) - Player 1
        { id: 'w1', color: 'light', pip: 24, z: 0 },
        { id: 'w2', color: 'light', pip: 24, z: 1 },
        { id: 'w3', color: 'light', pip: 13, z: 0 },
        { id: 'w4', color: 'light', pip: 13, z: 1 },
        { id: 'w5', color: 'light', pip: 13, z: 2 },
        { id: 'w6', color: 'light', pip: 13, z: 3 },
        { id: 'w7', color: 'light', pip: 13, z: 4 },
        { id: 'w8', color: 'light', pip: 8, z: 0 },
        { id: 'w9', color: 'light', pip: 8, z: 1 },
        { id: 'w10', color: 'light', pip: 8, z: 2 },
        { id: 'w11', color: 'light', pip: 6, z: 0 },
        { id: 'w12', color: 'light', pip: 6, z: 1 },
        { id: 'w13', color: 'light', pip: 6, z: 2 },
        { id: 'w14', color: 'light', pip: 6, z: 3 },
        { id: 'w15', color: 'light', pip: 6, z: 4 },

        // Black (Dark) - Player 2
        { id: 'b1', color: 'dark', pip: 1, z: 0 },
        { id: 'b2', color: 'dark', pip: 1, z: 1 },
        { id: 'b3', color: 'dark', pip: 12, z: 0 },
        { id: 'b4', color: 'dark', pip: 12, z: 1 },
        { id: 'b5', color: 'dark', pip: 12, z: 2 },
        { id: 'b6', color: 'dark', pip: 12, z: 3 },
        { id: 'b7', color: 'dark', pip: 12, z: 4 },
        { id: 'b8', color: 'dark', pip: 17, z: 0 },
        { id: 'b9', color: 'dark', pip: 17, z: 1 },
        { id: 'b10', color: 'dark', pip: 17, z: 2 },
        { id: 'b11', color: 'dark', pip: 19, z: 0 },
        { id: 'b12', color: 'dark', pip: 19, z: 1 },
        { id: 'b13', color: 'dark', pip: 19, z: 2 },
        { id: 'b14', color: 'dark', pip: 19, z: 3 },
        { id: 'b15', color: 'dark', pip: 19, z: 4 },
    ],
    dice: {
        values: [3, 1],
        rolling: false,
        used: [false, false]
    },
    cube: {
        value: 1,
        owner: 'center'
    },
    legalMoves: [
        { from: 8, to: 5 },
        { from: 6, to: 5 },
        { from: 24, to: 21 },
        { from: 13, to: 10 }
    ],
    turn: 'light'
};

const initialMatchState: MatchState = {
    players: [
        { handle: 'Player 1', rating: 1500, connected: true, color: 'light', countryCode: 'US' },
        { handle: 'Bot IA', rating: 2000, connected: true, color: 'dark', countryCode: 'AI' }
    ],
    score: [0, 0],
    limitPoints: 5,
    stakes: '$10',
    timers: [
        { msRemaining: 300000, running: true },
        { msRemaining: 300000, running: false }
    ]
};

const DemoBoard: React.FC = () => {
    const [state, setState] = useState(initialBoardState);

    const handleMove = (from: any, to: any) => {
        console.log('Move:', from, '->', to);
        // Simple optimistic update for demo
        setState(prev => ({
            ...prev,
            checkers: prev.checkers.map(c => {
                if (c.pip === from && c.color === prev.turn) {
                    // Find top checker at 'from'
                    // Ideally we'd pick specific ID, but for demo just move one
                    return { ...c, pip: to, z: 0 }; // Reset z for simplicity
                }
                return c;
            })
        }));
    };

    const handleRoll = () => {
        setState(prev => ({
            ...prev,
            dice: { ...prev.dice, rolling: true }
        }));
        setTimeout(() => {
            setState(prev => ({
                ...prev,
                dice: {
                    values: [Math.ceil(Math.random() * 6), Math.ceil(Math.random() * 6)],
                    rolling: false
                }
            }));
        }, 500);
    };

    return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center">
            <BoardWrap
                state={state}
                matchState={initialMatchState}
                onMove={handleMove}
                onRollDice={handleRoll}
                theme="dark"
            />
        </div>
    );
};

export default DemoBoard;
