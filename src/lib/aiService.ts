import { GameState } from '../stores/gameStore';

const BOT_API_URL = 'https://botgammon.netlify.app/.netlify/functions/analyze';

export interface AIAnalysis {
    bestMove: { from: number; to: number }[];
    explanation: string;
    winProbability: number;
    equity?: number;
    strategicAdvice?: {
        analysis: string;
        recommendedStrategy: string;
        riskLevel: string;
    };
}

export const analyzeMove = async (
    gameState: GameState,
    dice: number[]
): Promise<AIAnalysis> => {
    try {
        // Préparer le payload pour l'API BotGammon
        const payload = {
            dice: dice,
            boardState: {
                points: gameState.board.points.map(p => ({
                    player: p.player === 'white' ? 1 : p.player === 'black' ? 2 : 0,
                    count: p.count
                })),
                bar: {
                    white: gameState.board.bar.white,
                    black: gameState.board.bar.black
                },
                off: {
                    white: gameState.board.off.white,
                    black: gameState.board.off.black
                }
            },
            player: gameState.turn === 'white' ? 1 : 2,
            // Ajouter le contexte pour GPT-4o
            context: {
                gamePhase: 'middle', // À calculer dynamiquement idéalement
                matchScore: '0-0',
                opponentTendencies: 'unknown'
            }
        };

        console.log('Calling BotGammon API...', payload);

        const response = await fetch(BOT_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            throw new Error(`BotGammon API Error: ${response.statusText}`);
        }

        const data = await response.json();
        console.log('BotGammon Analysis:', data);

        // Convertir la réponse de l'API au format attendu par le frontend
        const bestMoves = data.bestMoves && data.bestMoves.length > 0
            ? [data.bestMoves[0]] // Prendre le meilleur coup
            : [];

        // Construire une explication riche avec les conseils stratégiques
        let explanation = `Equity: ${data.evaluation?.equity?.toFixed(3) || 'N/A'}. Win: ${(data.evaluation?.winProbability * 100)?.toFixed(1)}%`;

        if (data.strategicAdvice) {
            explanation += `\n\n🧠 STRATÉGIE: ${data.strategicAdvice.recommendedStrategy.toUpperCase()}\n`;
            explanation += `${data.strategicAdvice.analysis}\n`;
            if (data.strategicAdvice.riskLevel) explanation += `⚠️ Risque: ${data.strategicAdvice.riskLevel}\n`;
        }

        return {
            bestMove: bestMoves,
            explanation: explanation,
            winProbability: (data.evaluation?.winProbability || 0.5) * 100,
            equity: data.evaluation?.equity,
            strategicAdvice: data.strategicAdvice // Passer l'objet complet pour l'UI
        };

    } catch (error) {
        console.error('AI Analysis Failed:', error);
        // Fallback silencieux ou erreur
        throw error;
    }
};
