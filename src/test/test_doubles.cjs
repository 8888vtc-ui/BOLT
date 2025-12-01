// Test spécifique pour les doubles

const BOT_API_URL = 'https://botgammon.netlify.app/.netlify/functions/analyze';

function createPayload(dice, activePlayer = 2) {
    const initialBoard = {
        points: [
            { player: 2, count: 2 },
            { player: null, count: 0 },
            { player: null, count: 0 },
            { player: null, count: 0 },
            { player: null, count: 0 },
            { player: 1, count: 5 },
            { player: null, count: 0 },
            { player: 1, count: 3 },
            { player: null, count: 0 },
            { player: null, count: 0 },
            { player: null, count: 0 },
            { player: 2, count: 5 },
            { player: 1, count: 5 },
            { player: null, count: 0 },
            { player: null, count: 0 },
            { player: null, count: 0 },
            { player: 2, count: 3 },
            { player: null, count: 0 },
            { player: 2, count: 5 },
            { player: null, count: 0 },
            { player: null, count: 0 },
            { player: null, count: 0 },
            { player: null, count: 0 },
            { player: 1, count: 2 }
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

async function testDoubles() {
    console.log("🎲 TEST DES DOUBLES\n");
    console.log("Les doubles devraient retourner 4 mouvements.\n");

    const doubles = [
        [1, 1],
        [2, 2],
        [3, 3],
        [4, 4],
        [5, 5],
        [6, 6]
    ];

    for (const dice of doubles) {
        console.log(`\nTest: ${dice[0]}-${dice[1]}`);

        const payload = createPayload(dice, 2);

        try {
            const response = await fetch(BOT_API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await response.json();
            const moves = data.bestMoves || [];

            console.log(`Mouvements reçus: ${moves.length}`);

            if (moves.length === 4) {
                console.log("✅ CORRECT - 4 mouvements");
            } else if (moves.length === 2) {
                console.log("⚠️  PROBLÈME - Seulement 2 mouvements (devrait être 4)");
                console.log("L'API ne duplique peut-être pas automatiquement les doubles.");
            } else {
                console.log(`❌ ERREUR - ${moves.length} mouvements`);
            }

            moves.forEach((m, i) => {
                console.log(`   ${i + 1}. ${m.from} → ${m.to} (dé: ${m.die})`);
            });

        } catch (error) {
            console.log(`❌ Erreur: ${error.message}`);
        }

        await new Promise(r => setTimeout(r, 500));
    }

    console.log("\n" + "=".repeat(60));
    console.log("\n💡 CONCLUSION:");
    console.log("Si tous les doubles retournent 2 mouvements au lieu de 4,");
    console.log("c'est que l'API attend que nous dupliquions nous-mêmes");
    console.log("les mouvements pour les doubles dans le frontend.");
}

testDoubles();
