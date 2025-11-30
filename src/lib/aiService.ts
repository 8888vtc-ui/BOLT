import { GameState } from '../stores/gameStore';
import { useDebugStore } from '../stores/debugStore';

const BOT_API_URL = 'https://botgammon.netlify.app/.netlify/functions/analyze';

export interface AIAnalysis {
    bestMove: { from: number; to: number }[];
    explanation: string;
    winProbability: number;
    equity?: number;
    strategicAdvice?: {
        analysis: string;
        speechScript?: string;
        recommendedStrategy: string;
        riskLevel: string;
        explanation?: string;
    };
}

export const analyzeMove = async (
    gameState: GameState,
    dice: number[],
    playerColor?: number // 1 for White, 2 for Black
): Promise<AIAnalysis> => {
    const addLog = useDebugStore.getState().addLog;

    try {
        // Determine player color if not provided
        // Default logic: if turn is 'white' or 1 -> 1, else 2
        // But gameState.turn is usually a UUID.
        // We rely on the caller passing the correct color.
        // If not passed, we default to 2 (Black/Bot) as a fallback for existing calls.
        const activePlayer = playerColor || (gameState.turn === 'white' ? 1 : 2);

        addLog('🤖 AI Service: Preparing analysis...', 'info', { dice, turn: gameState.turn, activePlayer });

        // Use the payload format requested by the user
        // We send the board state AS IS, without complex mapping, as the API seems to handle it.
        const payload = {
            board: gameState.board,
            dice: dice,
            turn: 'bot',
            activePlayer: activePlayer,
            requestAllMoves: true
        };

        addLog('🤖 AI Service: Calling BotGammon API...', 'info', BOT_API_URL);

        const response = await fetch(BOT_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        addLog(`🤖 AI Service: Response status: ${response.status}`, response.ok ? 'success' : 'error');

        if (!response.ok) {
            const errorText = await response.text();
            addLog('🤖 AI Service: Error response', 'error', errorText);
            throw new Error(`BotGammon API Error: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        addLog('🤖 AI Service: Analysis received', 'success');

        // Convertir la réponse de l'API au format attendu par le frontend
        // Convertir la réponse de l'API au format attendu par le frontend
        // data.bestMoves est supposé être un tableau d'objets {from, to, die} représentant la SÉQUENCE du meilleur coup.
        let bestMoves = data.bestMoves || [];

        // MOVES ARE NOW COMPATIBLE AS-IS
        // Because we mapped to the Engine player moving in the same direction,
        // the returned moves (from/to indices) match our board.
        if (bestMoves.length > 0) {
            bestMoves = bestMoves.map((move: any) => {
                return {
                    ...move,
                    from: typeof move.from === 'number' && move.from >= 0 && move.from <= 23 ? move.from : move.from,
                    to: typeof move.to === 'number' && move.to >= 0 && move.to <= 23 ? move.to : move.to
                };
            });
        }

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
        addLog('❌ AI Analysis Failed', 'error', error);

        // Fallback pour ne pas casser l'UI
        return {
            bestMove: [],
            explanation: "Impossible de contacter le coach. Vérifiez votre connexion.",
            winProbability: 50,
            equity: 0,
            strategicAdvice: {
                analysis: "Le serveur d'analyse est indisponible. Veuillez réessayer plus tard.",
                speechScript: "Désolé, je ne peux pas analyser cette position pour le moment.",
                recommendedStrategy: "Jeu prudent",
                riskLevel: "N/A"
            }
        };
    }
};
