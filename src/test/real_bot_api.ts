
import { INITIAL_BOARD } from '../lib/gameLogic';
import { analyzeMove } from '../lib/aiService';

// Mock GameState
const mockGameState = {
    board: INITIAL_BOARD,
    dice: [3, 1],
    turn: 'bot',
    score: { player1: 0, player2: 0 },
    matchLength: 5,
    currentPlayer: 2,
    availableMoves: [],
    doubleValue: 1,
    canDouble: true
};

async function testBot() {
    console.log("Testing Real Bot API...");
    try {
        // Force Player 2 (Black)
        const result = await analyzeMove(mockGameState, [3, 1], 2);
        console.log("Bot Response:", JSON.stringify(result, null, 2));

        if (result.bestMove && result.bestMove.length > 0) {
            console.log("SUCCESS: Bot returned moves.");

            // Verify move direction for Player 2 (Should be UP, 0->23)
            // Engine returns 0->23. Frontend P2 is 0->23.
            // So if start is < end, it's correct.
            const move = result.bestMove[0];
            if (move.to > move.from) {
                console.log(`SUCCESS: Move direction is correct (UP): ${move.from} -> ${move.to}`);
            } else {
                console.warn(`WARNING: Move direction might be wrong for P2 (Expected UP): ${move.from} -> ${move.to}`);
            }

        } else {
            console.error("FAILURE: Bot returned no moves.");
        }
    } catch (error) {
        console.error("FAILURE: API Call failed", error);
    }
}

testBot();
