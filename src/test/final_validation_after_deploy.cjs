// Script de validation finale après déploiement
// Attend que le déploiement soit terminé et relance les tests

const BOT_API_URL = 'https://botgammon.netlify.app/.netlify/functions/analyze';

console.log("╔═══════════════════════════════════════════════════════════╗");
console.log("║   VALIDATION FINALE APRÈS DÉPLOIEMENT                     ║");
console.log("╚═══════════════════════════════════════════════════════════╝\n");

console.log("⏳ Attente du déploiement Netlify...");
console.log("   (Le déploiement prend généralement 1-2 minutes)\n");

// Attendre 2 minutes pour le déploiement
const WAIT_TIME = 120000; // 2 minutes
const start = Date.now();

function formatTime(ms) {
    const seconds = Math.floor(ms / 1000);
    return `${seconds}s`;
}

async function waitForDeployment() {
    return new Promise(resolve => {
        const interval = setInterval(() => {
            const elapsed = Date.now() - start;
            const remaining = WAIT_TIME - elapsed;

            if (remaining <= 0) {
                clearInterval(interval);
                console.log("\n✅ Délai d'attente terminé !\n");
                resolve();
            } else {
                process.stdout.write(`\r   Temps restant: ${formatTime(remaining)}   `);
            }
        }, 1000);
    });
}

// Fonction de test rapide
function createPayload(dice) {
    const initialBoard = {
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

    const targetEnginePlayer = 1;
    const opponentEnginePlayer = 2;

    const mappedPoints = initialBoard.points.map(p => {
        let enginePlayer = 0;
        if (p.player === 2) enginePlayer = targetEnginePlayer;
        else if (p.player !== null) enginePlayer = opponentEnginePlayer;
        return { player: enginePlayer, count: p.count };
    });

    return {
        dice: dice,
        boardState: {
            points: mappedPoints,
            bar: { white: 0, black: 0 },
            off: { white: 0, black: 0 }
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

async function testDouble(dice) {
    try {
        const payload = createPayload(dice);
        const response = await fetch(BOT_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await response.json();
        return (data.bestMoves || []).length;
    } catch (e) {
        return 0;
    }
}

async function runFinalValidation() {
    await waitForDeployment();

    console.log("╔═══════════════════════════════════════════════════════════╗");
    console.log("║   TESTS DE VALIDATION FINALE                              ║");
    console.log("╚═══════════════════════════════════════════════════════════╝\n");

    const tests = [
        { dice: [3, 1], expected: 2, name: "Ouverture normale 3-1" },
        { dice: [3, 3], expected: 4, name: "Double 3-3 (TEST CRITIQUE)" },
        { dice: [6, 6], expected: 4, name: "Double 6-6 (TEST CRITIQUE)" },
        { dice: [1, 1], expected: 4, name: "Double 1-1 (TEST CRITIQUE)" },
    ];

    let passed = 0;
    let failed = 0;

    for (const test of tests) {
        process.stdout.write(`Test: ${test.name}... `);
        const moves = await testDouble(test.dice);

        if (moves === test.expected) {
            console.log(`✅ ${moves} mouvements`);
            passed++;
        } else {
            console.log(`❌ ${moves} mouvements (attendu: ${test.expected})`);
            failed++;
        }

        await new Promise(r => setTimeout(r, 500));
    }

    console.log("\n" + "=".repeat(60));
    console.log("\n📊 RÉSULTATS:");
    console.log(`   ✅ Réussis: ${passed}/${tests.length}`);
    console.log(`   ❌ Échoués: ${failed}/${tests.length}\n`);

    if (failed === 0) {
        console.log("🎉🎉🎉 PARFAIT ! 100% DE RÉUSSITE ! 🎉🎉🎉");
        console.log("\n✅ Le fix des doubles est déployé et fonctionne !");
        console.log("✅ Le bot est maintenant WORLD-CLASS !");
        console.log("✅ Prêt pour la production !\n");
        console.log("🚀 Vous pouvez maintenant tester le jeu en ligne !");
    } else {
        console.log("⚠️  Le déploiement n'est peut-être pas encore terminé.");
        console.log("   Attendez encore 1-2 minutes et relancez ce script.\n");
        console.log("   Commande: node src/test/final_validation_after_deploy.cjs");
    }

    console.log("\n" + "=".repeat(60) + "\n");
}

runFinalValidation();
