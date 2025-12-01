import fetch from 'node-fetch';

const BOT_API_URL = 'https://botgammon.netlify.app/.netlify/functions/analyze';

async function testBotApi() {
    console.log("🔍 TEST DE L'API BOTGAMMON");
    console.log("==========================\n");

    // Payload exact utilisé dans le frontend
    const payload = {
        board: {
            points: [
                { player: 2, count: 2 },   // 1
                { player: null, count: 0 },
                { player: null, count: 0 },
                { player: null, count: 0 },
                { player: null, count: 0 },
                { player: 1, count: 5 },   // 6
                { player: null, count: 0 },
                { player: 1, count: 3 },   // 8
                { player: null, count: 0 },
                { player: null, count: 0 },
                { player: null, count: 0 },
                { player: 2, count: 5 },   // 12
                { player: 1, count: 5 },   // 13
                { player: null, count: 0 },
                { player: null, count: 0 },
                { player: 2, count: 3 },   // 17
                { player: null, count: 0 },
                { player: 2, count: 5 },   // 19
                { player: null, count: 0 },
                { player: null, count: 0 },
                { player: null, count: 0 },
                { player: null, count: 0 },
                { player: null, count: 0 },
                { player: 1, count: 2 }    // 24
            ],
            bar: { player1: 0, player2: 0 },
            off: { player1: 0, player2: 0 }
        },
        dice: [3, 1],
        turn: 'bot',
        activePlayer: 2,
        requestAllMoves: true
    };

    console.log("📤 Envoi du payload...");
    // console.log(JSON.stringify(payload, null, 2));

    try {
        const response = await fetch(BOT_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        console.log(`📥 Status: ${response.status}`);

        if (!response.ok) {
            const text = await response.text();
            console.error(`❌ Erreur API: ${text}`);
            return;
        }

        const data = await response.json();
        console.log("✅ Réponse reçue !");
        console.log("-----------------------------------");

        if (data.bestMoves) {
            console.log(`Nombre de mouvements reçus: ${data.bestMoves.length}`);
            console.log("Mouvements:", JSON.stringify(data.bestMoves, null, 2));

            if (data.bestMoves.length === 2) {
                console.log("\n✅ SUCCÈS: L'API renvoie bien la séquence complète (2 mouvements).");
            } else {
                console.log("\n⚠️ ATTENTION: L'API ne renvoie pas le nombre attendu de mouvements (attendu: 2).");
            }
        } else {
            console.log("❌ ERREUR: Pas de 'bestMoves' dans la réponse.");
            console.log("Réponse brute:", JSON.stringify(data, null, 2));
        }

    } catch (error) {
        console.error("❌ Erreur de connexion:", error);
    }
}

testBotApi();
