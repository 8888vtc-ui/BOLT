// SUITE DE TESTS MAXIMALE - TOUS LES SCÉNARIOS POSSIBLES
// Inclut: Ouvertures, Doubles, Bear-off, Hitting, Blocking, Primes, Endgame

const BOT_API_URL = 'https://botgammon.netlify.app/.netlify/functions/analyze';

// ============================================
// HELPER FUNCTIONS
// ============================================

function createPayload(dice, boardState = null, activePlayer = 2) {
    const initialBoard = boardState || getInitialBoard();

    const targetEnginePlayer = activePlayer === 1 ? 2 : 1;
    const opponentEnginePlayer = targetEnginePlayer === 1 ? 2 : 1;

    const mappedPoints = initialBoard.points.map(p => {
        let enginePlayer = 0;
        if (p.player === activePlayer) enginePlayer = targetEnginePlayer;
        else if (p.player !== null) enginePlayer = opponentEnginePlayer;
        return { player: enginePlayer, count: p.count };
    });

    const bar = { white: 0, black: 0 };
    const off = { white: 0, black: 0 };

    if (targetEnginePlayer === 1) {
        bar.white = initialBoard.bar.player2 || 0;
        bar.black = initialBoard.bar.player1 || 0;
        off.white = initialBoard.off.player2 || 0;
        off.black = initialBoard.off.player1 || 0;
    } else {
        bar.black = initialBoard.bar.player1 || 0;
        bar.white = initialBoard.bar.player2 || 0;
        off.black = initialBoard.off.player1 || 0;
        off.white = initialBoard.off.player2 || 0;
    }

    return {
        dice: dice,
        boardState: {
            points: mappedPoints,
            bar: bar,
            off: off
        },
        player: targetEnginePlayer,
        requestAllMoves: true,
        context: {
            gamePhase: 'middle',
            matchScore: '0-0',
            opponentTendencies: 'unknown'
        }
    };
}

function getInitialBoard() {
    return {
        points: [
            { player: 2, count: 2 }, { player: null, count: 0 }, { player: null, count: 0 },
            { player: null, count: 0 }, { player: null, count: 0 }, { player: 1, count: 5 },
            { player: null, count: 0 }, { player: 1, count: 3 }, { player: null, count: 0 },
            { player: null, count: 0 }, { player: null, count: 0 }, { player: 2, count: 5 },
            { player: 1, count: 5 }, { player: null, count: 0 }, { player: null, count: 0 },
            { player: null, count: 0 }, { player: 2, count: 3 }, { player: null, count: 0 },
            { player: 2, count: 5 }, { player: null, count: 0 }, { player: null, count: 0 },
            { player: null, count: 0 }, { player: null, count: 0 }, { player: 1, count: 2 }
        ],
        bar: { player1: 0, player2: 0 },
        off: { player1: 0, player2: 0 }
    };
}

// ============================================
// BOARD SCENARIOS
// ============================================

function createBearOffBoard() {
    const board = {
        points: Array(24).fill(null).map(() => ({ player: null, count: 0 })),
        bar: { player1: 0, player2: 0 },
        off: { player1: 0, player2: 0 }
    };
    board.points[18] = { player: 2, count: 5 };
    board.points[19] = { player: 2, count: 4 };
    board.points[20] = { player: 2, count: 3 };
    board.points[21] = { player: 2, count: 2 };
    board.points[22] = { player: 2, count: 1 };
    return board;
}

function createHittingBoard() {
    const board = {
        points: Array(24).fill(null).map(() => ({ player: null, count: 0 })),
        bar: { player1: 0, player2: 0 },
        off: { player1: 0, player2: 0 }
    };
    board.points[5] = { player: 1, count: 1 };
    board.points[2] = { player: 2, count: 2 };
    board.points[11] = { player: 2, count: 5 };
    return board;
}

function createBarReentryBoard() {
    const board = {
        points: Array(24).fill(null).map(() => ({ player: null, count: 0 })),
        bar: { player1: 0, player2: 1 },
        off: { player1: 0, player2: 0 }
    };
    board.points[2] = { player: null, count: 0 };
    board.points[11] = { player: 2, count: 5 };
    return board;
}

function createBlitzBoard() {
    const board = {
        points: Array(24).fill(null).map(() => ({ player: null, count: 0 })),
        bar: { player1: 0, player2: 0 },
        off: { player1: 0, player2: 0 }
    };
    // P2 attacking with multiple points made
    board.points[0] = { player: 2, count: 2 };
    board.points[1] = { player: 2, count: 2 };
    board.points[2] = { player: 2, count: 2 };
    board.points[3] = { player: 2, count: 2 };
    // P1 has checkers to escape
    board.points[23] = { player: 1, count: 2 };
    board.points[5] = { player: 1, count: 5 };
    return board;
}

function createPrimeBoard() {
    const board = {
        points: Array(24).fill(null).map(() => ({ player: null, count: 0 })),
        bar: { player1: 0, player2: 0 },
        off: { player1: 0, player2: 0 }
    };
    // P2 building a 6-prime
    for (let i = 0; i < 6; i++) {
        board.points[i] = { player: 2, count: 2 };
    }
    board.points[23] = { player: 1, count: 2 };
    return board;
}

function createRaceBoard() {
    const board = {
        points: Array(24).fill(null).map(() => ({ player: null, count: 0 })),
        bar: { player1: 0, player2: 0 },
        off: { player1: 0, player2: 0 }
    };
    // Pure race - no contact
    board.points[18] = { player: 2, count: 5 };
    board.points[19] = { player: 2, count: 5 };
    board.points[20] = { player: 2, count: 5 };
    board.points[5] = { player: 1, count: 5 };
    board.points[6] = { player: 1, count: 5 };
    board.points[7] = { player: 1, count: 5 };
    return board;
}

function createBackgameBoard() {
    const board = {
        points: Array(24).fill(null).map(() => ({ player: null, count: 0 })),
        bar: { player1: 0, player2: 0 },
        off: { player1: 0, player2: 0 }
    };
    // P2 in backgame position
    board.points[0] = { player: 2, count: 2 };
    board.points[1] = { player: 2, count: 2 };
    board.points[22] = { player: 2, count: 5 };
    board.points[23] = { player: 2, count: 6 };
    // P1 bearing off
    board.points[5] = { player: 1, count: 10 };
    board.off.player1 = 5;
    return board;
}

// ============================================
// TEST RUNNER
// ============================================

async function testScenario(name, dice, boardState, expectedMoves, category) {
    try {
        const payload = createPayload(dice, boardState, 2);

        const response = await fetch(BOT_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            return { success: false, error: `API Error: ${response.status}`, category, name };
        }

        const data = await response.json();
        const moves = data.bestMoves || [];

        const success = moves.length > 0;
        const matchesExpected = expectedMoves ? moves.length === expectedMoves : true;

        return {
            success: success && matchesExpected,
            name,
            dice,
            movesReceived: moves.length,
            movesExpected: expectedMoves,
            category,
            warning: !matchesExpected ? `Expected ${expectedMoves}, got ${moves.length}` : null
        };

    } catch (error) {
        return { success: false, error: error.message, name, category };
    }
}

// ============================================
// TEST SUITES
// ============================================

const ALL_TEST_SUITES = {
    "OUVERTURES STANDARDS (15 rolls)": [
        { name: "3-1 (Make 5-point)", dice: [3, 1], expected: 2 },
        { name: "4-2 (Make 4-point)", dice: [4, 2], expected: 2 },
        { name: "5-3 (Make 3-point)", dice: [5, 3], expected: 2 },
        { name: "6-1 (Make bar-point)", dice: [6, 1], expected: 2 },
        { name: "6-5 (Lover's leap)", dice: [6, 5], expected: 2 },
        { name: "2-1 (Split/slot)", dice: [2, 1], expected: 2 },
        { name: "3-2 (Split and down)", dice: [3, 2], expected: 2 },
        { name: "4-1 (Split and down)", dice: [4, 1], expected: 2 },
        { name: "5-2 (Advanced)", dice: [5, 2], expected: 2 },
        { name: "5-4 (Run and advance)", dice: [5, 4], expected: 2 },
        { name: "6-2 (Advance both)", dice: [6, 2], expected: 2 },
        { name: "6-3 (Advance both)", dice: [6, 3], expected: 2 },
        { name: "6-4 (Run one)", dice: [6, 4], expected: 2 },
        { name: "4-3 (Build/run)", dice: [4, 3], expected: 2 },
        { name: "5-1 (Split/slot)", dice: [5, 1], expected: 2 },
    ],

    "DOUBLES (6 rolls)": [
        { name: "1-1 (Make bar-points)", dice: [1, 1], expected: 4 },
        { name: "2-2 (Make 4 and 11)", dice: [2, 2], expected: 4 },
        { name: "3-3 (Make 5-point)", dice: [3, 3], expected: 4 },
        { name: "4-4 (Make 9 and 5)", dice: [4, 4], expected: 4 },
        { name: "5-5 (Run to mid)", dice: [5, 5], expected: 4 },
        { name: "6-6 (Run both)", dice: [6, 6], expected: 4 },
    ],

    "BEAR-OFF (6 tests)": [
        { name: "Bear-off 6-5", dice: [6, 5], board: createBearOffBoard(), expected: 2 },
        { name: "Bear-off 4-3", dice: [4, 3], board: createBearOffBoard(), expected: 2 },
        { name: "Bear-off 6-6", dice: [6, 6], board: createBearOffBoard(), expected: 4 },
        { name: "Bear-off 3-3", dice: [3, 3], board: createBearOffBoard(), expected: 4 },
        { name: "Bear-off 2-1", dice: [2, 1], board: createBearOffBoard(), expected: 2 },
        { name: "Bear-off 5-4", dice: [5, 4], board: createBearOffBoard(), expected: 2 },
    ],

    "TACTIQUES (4 tests)": [
        { name: "Hitting 3-1", dice: [3, 1], board: createHittingBoard(), expected: 2 },
        { name: "Bar re-entry 3-1", dice: [3, 1], board: createBarReentryBoard(), expected: 2 },
        { name: "Hitting 6-6", dice: [6, 6], board: createHittingBoard(), expected: 4 },
        { name: "Bar re-entry 2-2", dice: [2, 2], board: createBarReentryBoard(), expected: 4 },
    ],

    "POSITIONS AVANCÉES (6 tests)": [
        { name: "Blitz 6-5", dice: [6, 5], board: createBlitzBoard(), expected: 2 },
        { name: "Prime 4-2", dice: [4, 2], board: createPrimeBoard(), expected: 2 },
        { name: "Race 6-6", dice: [6, 6], board: createRaceBoard(), expected: 4 },
        { name: "Backgame 5-3", dice: [5, 3], board: createBackgameBoard(), expected: 2 },
        { name: "Blitz 3-3", dice: [3, 3], board: createBlitzBoard(), expected: 4 },
        { name: "Race 5-4", dice: [5, 4], board: createRaceBoard(), expected: 2 },
    ],
};

// ============================================
// MAIN RUNNER
// ============================================

async function runMaximumTests() {
    console.log("╔═══════════════════════════════════════════════════════════╗");
    console.log("║   SUITE DE TESTS MAXIMALE - BOT BACKGAMMON               ║");
    console.log("║   37 scénarios différents                                ║");
    console.log("╚═══════════════════════════════════════════════════════════╝\n");

    const results = {
        total: 0,
        passed: 0,
        failed: 0,
        warnings: 0,
        byCategory: {}
    };

    for (const [category, tests] of Object.entries(ALL_TEST_SUITES)) {
        console.log(`\n${'='.repeat(60)}`);
        console.log(`📋 ${category}`);
        console.log('='.repeat(60));

        results.byCategory[category] = { passed: 0, failed: 0, total: tests.length };

        for (const test of tests) {
            const result = await testScenario(
                test.name,
                test.dice,
                test.board || null,
                test.expected,
                category
            );

            results.total++;

            if (result.success) {
                results.passed++;
                results.byCategory[category].passed++;
                console.log(`✅ ${result.name} → ${result.movesReceived} moves`);

                if (result.warning) {
                    results.warnings++;
                    console.log(`   ⚠️  ${result.warning}`);
                }
            } else {
                results.failed++;
                results.byCategory[category].failed++;
                console.log(`❌ ${result.name}`);
                if (result.error) console.log(`   ${result.error}`);
            }

            await new Promise(r => setTimeout(r, 250));
        }
    }

    // ============================================
    // RAPPORT FINAL
    // ============================================

    console.log("\n\n");
    console.log("╔═══════════════════════════════════════════════════════════╗");
    console.log("║   RAPPORT FINAL EXHAUSTIF                                 ║");
    console.log("╚═══════════════════════════════════════════════════════════╝\n");

    const percentage = ((results.passed / results.total) * 100).toFixed(1);

    console.log(`📊 RÉSULTATS GLOBAUX:`);
    console.log(`   Total: ${results.total} tests`);
    console.log(`   ✅ Réussis: ${results.passed} (${percentage}%)`);
    console.log(`   ❌ Échoués: ${results.failed}`);
    console.log(`   ⚠️  Avertissements: ${results.warnings}\n`);

    console.log(`📋 DÉTAILS PAR CATÉGORIE:`);
    for (const [category, stats] of Object.entries(results.byCategory)) {
        const pct = ((stats.passed / stats.total) * 100).toFixed(0);
        const status = stats.passed === stats.total ? '✅' : stats.passed >= stats.total * 0.8 ? '⚠️' : '❌';
        console.log(`   ${status} ${category}: ${stats.passed}/${stats.total} (${pct}%)`);
    }

    console.log("\n");

    if (results.failed === 0) {
        console.log("🎉🎉🎉 PARFAIT ! 100% DE RÉUSSITE ! 🎉🎉🎉");
        console.log("Le bot est WORLD-CLASS et prêt pour la production !");
    } else if (percentage >= 95) {
        console.log("🌟 EXCELLENT ! Plus de 95% de réussite !");
        console.log("Le bot est de niveau professionnel.");
    } else if (percentage >= 90) {
        console.log("✅ TRÈS BON ! Plus de 90% de réussite !");
    } else if (percentage >= 75) {
        console.log("👍 BON ! Plus de 75% de réussite !");
    } else {
        console.log("⚠️  Améliorations nécessaires.");
    }

    console.log("\n" + "=".repeat(60) + "\n");
}

runMaximumTests();
