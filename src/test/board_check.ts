
import { INITIAL_BOARD } from '../lib/gameLogic';

function testBoardPresence() {
    console.log("Testing Board Presence...");

    if (!INITIAL_BOARD) {
        console.error("FAILURE: INITIAL_BOARD is undefined or null.");
        return;
    }

    if (!INITIAL_BOARD.points || INITIAL_BOARD.points.length !== 24) {
        console.error("FAILURE: Board points array is missing or incorrect length.");
        return;
    }

    // Check specific starting positions
    const p1Start = INITIAL_BOARD.points[23]; // White starts at 24 (index 23)
    const p2Start = INITIAL_BOARD.points[0];  // Black starts at 1 (index 0)

    if (p1Start.player === 1 && p1Start.count === 2) {
        console.log("SUCCESS: Player 1 (White) checkers found at index 23.");
    } else {
        console.error(`FAILURE: Player 1 checkers missing or wrong at index 23. Found: ${JSON.stringify(p1Start)}`);
    }

    if (p2Start.player === 2 && p2Start.count === 2) {
        console.log("SUCCESS: Player 2 (Black) checkers found at index 0.");
    } else {
        console.error(`FAILURE: Player 2 checkers missing or wrong at index 0. Found: ${JSON.stringify(p2Start)}`);
    }

    console.log("Board Structure Verified.");
}

testBoardPresence();
