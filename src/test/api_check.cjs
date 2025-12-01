// const fetch = require('node-fetch'); // Fetch is native in Node 22

const BOT_API_URL = 'https://botgammon.netlify.app/.netlify/functions/analyze';

async function testBotApi() {
    console.log("🔍 TEST DE L'API BOTGAMMON");
    console.log("==========================\n");

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
            bar: { white: 0, black: 0 },
            off: { white: 0, black: 0 }
        },
        dice: [3, 1],
        turn: 'bot',
        activePlayer: 2,
        requestAllMoves: true
    };

    // Test "Old Format" (celui qui fonctionnait avant)
    // Mapping P2 -> 1 (White) car l'ancien code mappait le joueur actif vers le moteur
    const mappedPoints = payload.board.points.map(p => ({
        player: p.player === 2 ? 1 : (p.player === 1 ? 2 : null),
        count: p.count
    }));

    const oldPayload = {
        dice: [3, 1],
        boardState: {
            points: mappedPoints,
            bar: { white: 0, black: 0 },
            off: { white: 0, black: 0 }
        },
        player: 1, // On dit que c'est le joueur 1 (White) qui joue
        requestAllMoves: true,
        context: {
            gamePhase: 'middle',
            matchScore: '0-0',
            opponentTendencies: 'unknown'
        }
    };

    console.log("🔄 Test Old Format (boardState, player=1)...");
    try {
        const response = await fetch(BOT_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(oldPayload)
        });

        const data = await response.json();
        console.log("Réponse:", JSON.stringify(data.bestMoves, null, 2));
    } catch (e) { console.error(e); }
}

testBotApi();
