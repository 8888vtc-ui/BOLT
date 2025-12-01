// SUITE DE TESTS EXHAUSTIVE POUR LE BOT BACKGAMMON
// Basée sur les standards GNU Backgammon et les scénarios critiques

const BOT_API_URL = 'https://botgammon.netlify.app/.netlify/functions/analyze';

// ============================================
// HELPER FUNCTIONS
// ============================================

function createPayload(dice, boardState = null, activePlayer = 2) {
    const initialBoard = boardState || {
        points: [
            { player: 2, count: 2 },   // 0
            { player: null, count: 0 },
            { player: null, count: 0 },
            { player: null, count: 0 },
            { player: null, count: 0 },
            { player: 1, count: 5 },   // 5
            { player: null, count: 0 },
            { player: 1, count: 3 },   // 7
            { player: null, count: 0 },
            { player: null, count: 0 },
            { player: null, count: 0 },
            { player: 2, count: 5 },   // 11
            { player: 1, count: 5 },   // 12
            { player: null, count: 0 },
            { player: null, count: 0 },
            { player: null, count: 0 },
            { player: 2, count: 3 },   // 16
            { player: null, count: 0 },
            { player: 2, count: 5 },   // 18
            { player: null, count: 0 },
            { player: null, count: 0 },
            { player: null, count: 0 },
            { player: null, count: 0 },
            { player: 1, count: 2 }    // 23
        ],
        bar: { player1: 0, player2: 0 },
        off: { player1: 0, player2: 0 }
    };

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

async function testScenario(name, dice, boardState, expectedMoves, category) {
    try {
        const payload = createPayload(dice, boardState, 2);

        const response = await fetch(BOT_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            return { success: false, error: `API Error: ${response.status}`, category };
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
            moves: moves,
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

const OPENING_TESTS = [
    { name: "3-1 (Best opening - Make 5-point)", dice: [3, 1], expected: 2 },
    { name: "4-2 (Make 4-point)", dice: [4, 2], expected: 2 },
    { name: "5-3 (Make 3-point)", dice: [5, 3], expected: 2 },
    { name: "6-1 (Make bar-point)", dice: [6, 1], expected: 2 },
    { name: "6-5 (Lover's leap)", dice: [6, 5], expected: 2 },
    { name: "2-1 (Split or slot)", dice: [2, 1], expected: 2 },
    { name: "3-2 (Split and down)", dice: [3, 2], expected: 2 },
    { name: "4-1 (Split and down)", dice: [4, 1], expected: 2 },
    { name: "5-2 (Advanced position)", dice: [5, 2], expected: 2 },
    { name: "5-4 (Run and advance)", dice: [5, 4], expected: 2 },
    { name: "6-2 (Advance both sides)", dice: [6, 2], expected: 2 },
    { name: "6-3 (Advance both sides)", dice: [6, 3], expected: 2 },
    { name: "6-4 (Run one checker)", dice: [6, 4], expected: 2 },
    { name: "4-3 (Build or run)", dice: [4, 3], expected: 2 },
    { name: "5-1 (Split or slot)", dice: [5, 1], expected: 2 },
];

const DOUBLES_TESTS = [
    { name: "1-1 (Make both bar-points)", dice: [1, 1], expected: 4 },
    { name: "2-2 (Make 4 and 11 points)", dice: [2, 2], expected: 4 },
    { name: "3-3 (Make 5-point and advance)", dice: [3, 3], expected: 4 },
    { name: "4-4 (Make 9 and 5 points)", dice: [4, 4], expected: 4 },
    { name: "5-5 (Run to midpoint)", dice: [5, 5], expected: 4 },
    { name: "6-6 (Run both checkers)", dice: [6, 6], expected: 4 },
];

function createBearOffBoard() {
    const board = {
        points: Array(24).fill(null).map(() => ({ player: null, count: 0 })),
        bar: { player1: 0, player2: 0 },
        off: { player1: 0, player2: 0 }
    };
    // P2 has all checkers in home board
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
    // P2 can hit P1 blot
    board.points[5] = { player: 1, count: 1 };  // P1 blot
    board.points[2] = { player: 2, count: 2 };  // P2 can hit with 3
    board.points[11] = { player: 2, count: 5 };
    return board;
}

function createBarReentryBoard() {
    const board = {
        points: Array(24).fill(null).map(() => ({ player: null, count: 0 })),
        bar: { player1: 0, player2: 1 },  // P2 on bar
        off: { player1: 0, player2: 0 }
    };
    // P2 must re-enter
    board.points[2] = { player: null, count: 0 };  // Open point for re-entry
    board.points[11] = { player: 2, count: 5 };
    return board;
}

const BEAROFF_TESTS = [
    { name: "Bear-off 6-5 (exact)", dice: [6, 5], board: createBearOffBoard(), expected: 2 },
    { name: "Bear-off 6-6 (doubles)", dice: [6, 6], board: createBearOffBoard(), expected: 4 },
    { name: "Bear-off 4-3 (mixed)", dice: [4, 3], board: createBearOffBoard(), expected: 2 },
];

const TACTICAL_TESTS = [
    { name: "Hitting opportunity 3-1", dice: [3, 1], board: createHittingBoard(), expected: 2 },
    { name: "Bar re-entry 3-1", dice: [3, 1], board: createBarReentryBoard(), expected: 2 },
];

// ============================================
// MAIN TEST RUNNER
// ============================================

async function runAllTests() {
    console.log("╔═══════════════════════════════════════════════════════════╗");
    console.log("║   SUITE DE TESTS EXHAUSTIVE - BOT BACKGAMMON             ║");
    console.log("║   Basée sur les standards GNU Backgammon                 ║");
    console.log("╚═══════════════════════════════════════════════════════════╝\n");

    const allTests = [
        { category: "OUVERTURES STANDARDS (15 rolls)", tests: OPENING_TESTS },
        { category: "DOUBLES (6 rolls)", tests: DOUBLES_TESTS },
        { category: "BEAR-OFF", tests: BEAROFF_TESTS },
        { category: "TACTIQUES SPÉCIALES", tests: TACTICAL_TESTS },
    ];

    const results = {
        total: 0,
        passed: 0,
        failed: 0,
        warnings: 0,
        byCategory: {}
    };

    for (const suite of allTests) {
        console.log(`\n${'='.repeat(60)}`);
        console.log(`📋 ${suite.category}`);
        console.log('='.repeat(60));

        results.byCategory[suite.category] = { passed: 0, failed: 0, warnings: 0 };

        for (const test of suite.tests) {
            const result = await testScenario(
                test.name,
                test.dice,
                test.board || null,
                test.expected,
                suite.category
            );

            results.total++;

            if (result.success) {
                results.passed++;
                results.byCategory[suite.category].passed++;
                console.log(`✅ ${result.name}`);
                console.log(`   Dés: [${result.dice.join(', ')}] → ${result.movesReceived} mouvements`);

                if (result.warning) {
                    results.warnings++;
                    results.byCategory[suite.category].warnings++;
                    console.log(`   ⚠️  ${result.warning}`);
                }
            } else {
                results.failed++;
                results.byCategory[suite.category].failed++;
                console.log(`❌ ${result.name}`);
                console.log(`   Erreur: ${result.error || 'Aucun mouvement retourné'}`);
            }

            // Délai entre tests pour ne pas surcharger l'API
            await new Promise(r => setTimeout(r, 300));
        }
    }

    // ============================================
    // RAPPORT FINAL
    // ============================================

    console.log("\n\n");
    console.log("╔═══════════════════════════════════════════════════════════╗");
    console.log("║   RAPPORT FINAL                                           ║");
    console.log("╚═══════════════════════════════════════════════════════════╝\n");

    console.log(`📊 RÉSULTATS GLOBAUX:`);
    console.log(`   Total de tests: ${results.total}`);
    console.log(`   ✅ Réussis: ${results.passed} (${((results.passed / results.total) * 100).toFixed(1)}%)`);
    console.log(`   ❌ Échoués: ${results.failed} (${((results.failed / results.total) * 100).toFixed(1)}%)`);
    console.log(`   ⚠️  Avertissements: ${results.warnings}\n`);

    console.log(`📋 DÉTAILS PAR CATÉGORIE:`);
    for (const [category, stats] of Object.entries(results.byCategory)) {
        const total = stats.passed + stats.failed;
        const percentage = total > 0 ? ((stats.passed / total) * 100).toFixed(1) : 0;
        console.log(`   ${category}:`);
        console.log(`      ${stats.passed}/${total} réussis (${percentage}%)`);
    }

    console.log("\n");

    if (results.failed === 0) {
        console.log("🎉 PARFAIT ! TOUS LES TESTS SONT PASSÉS !");
        console.log("Le bot est validé selon les standards GNU Backgammon.");
    } else if (results.passed / results.total >= 0.9) {
        console.log("✅ EXCELLENT ! Plus de 90% de réussite.");
        console.log(`${results.failed} test(s) à améliorer.`);
    } else if (results.passed / results.total >= 0.75) {
        console.log("👍 BON ! Plus de 75% de réussite.");
        console.log(`${results.failed} test(s) nécessitent une attention.`);
    } else {
        console.log("⚠️  ATTENTION ! Moins de 75% de réussite.");
        console.log("Le bot nécessite des améliorations significatives.");
    }

    console.log("\n" + "=".repeat(60) + "\n");
}

runAllTests();
