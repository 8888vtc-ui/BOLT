
import { describe, it, expect } from 'vitest';
import { INITIAL_BOARD, makeMove, getValidMoves, BoardState } from '../lib/gameLogic';
import { analyzeMove } from '../lib/aiService';

// Mock GameState for testing
const mockGameState = {
    board: JSON.parse(JSON.stringify(INITIAL_BOARD)),
    dice: [3, 1],
    turn: 'bot',
    score: { player1: 0, player2: 0 },
    matchLength: 5,
    currentPlayer: 2, // Bot is Player 2
    availableMoves: [],
    doubleValue: 1,
    canDouble: true
};

describe('Game Logic & AI Integration Tests', () => {

    it('should correctly initialize the board', () => {
        const board = INITIAL_BOARD;
        // P1 (White) at 24 (index 23) -> 2 checkers
        expect(board.points[23].player).toBe(1);
        expect(board.points[23].count).toBe(2);
        // P2 (Red) at 1 (index 0) -> 2 checkers
        expect(board.points[0].player).toBe(2);
        expect(board.points[0].count).toBe(2);
    });

    it('should validate P1 (White) moving DOWN (23 -> 0)', () => {
        const board = JSON.parse(JSON.stringify(INITIAL_BOARD));
        const dice = [3, 1];
        const validMoves = getValidMoves(board, 1, dice); // Player 1

        // From 24 (index 23) with die 3 -> 21 (index 20)
        const movesFrom23 = validMoves.get(23);
        expect(movesFrom23).toBeDefined();
        expect(movesFrom23).toContain(20); // 23 - 3 = 20
        expect(movesFrom23).toContain(22); // 23 - 1 = 22
    });

    it('should validate P2 (Red) moving UP (0 -> 23)', () => {
        const board = JSON.parse(JSON.stringify(INITIAL_BOARD));
        const dice = [3, 1];
        const validMoves = getValidMoves(board, 2, dice); // Player 2

        // From 1 (index 0) with die 3 -> 4 (index 3)
        const movesFrom0 = validMoves.get(0);
        expect(movesFrom0).toBeDefined();
        expect(movesFrom0).toContain(3); // 0 + 3 = 3
        expect(movesFrom0).toContain(1); // 0 + 1 = 1
    });

    it('should execute a P2 move correctly', () => {
        const board = JSON.parse(JSON.stringify(INITIAL_BOARD));
        // Move P2 from index 0 to index 3
        const newBoard = makeMove(board, 2, 0, 3);

        expect(newBoard.points[0].count).toBe(1); // One left
        expect(newBoard.points[3].player).toBe(2);
        expect(newBoard.points[3].count).toBe(1); // New checker there
    });

    // Mocking fetch for AI Service test
    global.fetch = async () => ({
        ok: true,
        json: async () => ({
            bestMoves: [{ from: 0, to: 3, die: 3 }] // Engine says 0->3 (Up)
        })
    }) as any;

    it('should correctly map AI response to P2 move', async () => {
        // Test the aiService logic with P2
        const analysis = await analyzeMove(mockGameState, [3, 1], 2);

        expect(analysis.bestMove).toBeDefined();
        expect(analysis.bestMove.length).toBeGreaterThan(0);

        const move = analysis.bestMove[0];
        // Since we mapped P2 -> Engine White (Up), and Engine returns 0->3
        // The result should be 0->3 directly compatible with our board
        expect(move.from).toBe(0);
        expect(move.to).toBe(3);
    });
});
