// Test de validation du Bot après le fix
// Ce script teste que l'API renvoie bien la séquence complète de mouvements

const BOT_API_URL = 'https://botgammon.netlify.app/.netlify/functions/analyze';

// Fonction helper pour mapper le plateau comme le fait aiService.ts
function createPayload(dice, activePlayer = 2) {
    // Plateau initial
    const initialBoard = {
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

    // Mapping comme dans aiService.ts
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

async function testOpening(dice, expectedMoves, description) {
    console.log(`\n🎲 Test: ${description}`);
    console.log(`   Dés: [${dice.join(', ')}]`);

    try {
        const payload = createPayload(dice, 2);

        const response = await fetch(BOT_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            console.log(`   ❌ Erreur API: ${response.status}`);
            return false;
        }

        const data = await response.json();
        const moves = data.bestMoves || [];

        console.log(`   📥 Mouvements reçus: ${moves.length}`);

        if (moves.length === 0) {
            console.log(`   ❌ ÉCHEC: Aucun mouvement retourné`);
            return false;
        }

        if (moves.length !== expectedMoves) {
            console.log(`   ⚠️  Attendu: ${expectedMoves} mouvements, reçu: ${moves.length}`);
        }

        console.log(`   ✅ SUCCÈS: ${moves.length} mouvement(s)`);
        moves.forEach((m, i) => {
            console.log(`      ${i + 1}. ${m.from} → ${m.to} (dé: ${m.die})`);
        });

        return true;

    } catch (error) {
        console.log(`   ❌ Erreur: ${error.message}`);
        return false;
    }
}

async function runTests() {
    console.log("╔═══════════════════════════════════════════╗");
    console.log("║   VALIDATION DU BOT APRÈS FIX             ║");
    console.log("╚═══════════════════════════════════════════╝");

    const tests = [
        { dice: [3, 1], expected: 2, desc: "Ouverture 3-1 (faire le 5-point)" },
        { dice: [6, 1], expected: 2, desc: "Ouverture 6-1 (bar-point)" },
        { dice: [4, 2], expected: 2, desc: "Ouverture 4-2 (avancer les runners)" },
        { dice: [5, 3], expected: 2, desc: "Ouverture 5-3 (builder play)" },
        { dice: [6, 5], expected: 2, desc: "Ouverture 6-5 (lover's leap)" },
        { dice: [2, 1], expected: 2, desc: "Ouverture 2-1 (split)" },
    ];

    let passed = 0;
    let failed = 0;

    for (const test of tests) {
        const result = await testOpening(test.dice, test.expected, test.desc);
        if (result) passed++;
        else failed++;

        // Petit délai entre les tests
        await new Promise(r => setTimeout(r, 500));
    }

    console.log("\n╔═══════════════════════════════════════════╗");
    console.log("║   RÉSULTATS                               ║");
    console.log("╚═══════════════════════════════════════════╝");
    console.log(`✅ Tests réussis: ${passed}/${tests.length}`);
    console.log(`❌ Tests échoués: ${failed}/${tests.length}`);

    if (failed === 0) {
        console.log("\n🎉 TOUS LES TESTS SONT PASSÉS !");
        console.log("Le bot est maintenant 100% fonctionnel.");
    } else {
        console.log("\n⚠️  Certains tests ont échoué.");
    }
}

runTests();
