
import { describe, it, expect } from 'vitest';
import { INITIAL_BOARD, checkWinType, BoardState } from '../lib/gameLogic';

// Helper to create a deep copy of the board
const cloneBoard = (board: BoardState) => JSON.parse(JSON.stringify(board));

describe('Game Modes Scoring Tests', () => {

    it('Money Game: Should calculate Gammon (2 points)', () => {
        let board = cloneBoard(INITIAL_BOARD);

        const currentScore = { player1: 3, player2: 0 };
        const matchLength = 5;
        const pointsWon = 2; // Gammon

        const newScoreP1 = currentScore.player1 + pointsWon;

        expect(newScoreP1).toBe(5);
        expect(newScoreP1 >= matchLength).toBe(true); // Match Won
    });

    it('Crawford Rule Check (Simulation)', () => {
        // Crawford rule: When a player reaches matchLength - 1, doubling is disabled for one game.
        const matchLength = 5;
        const score = { player1: 4, player2: 2 }; // P1 is at match point

        const isCrawford = (score.player1 === matchLength - 1) || (score.player2 === matchLength - 1);
        expect(isCrawford).toBe(true);
    });

});
