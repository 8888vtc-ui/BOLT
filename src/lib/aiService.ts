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

        // TRANSFORM BOARD FOR ENGINE
        // Frontend: White 23->0, Black 0->23
        // Engine: White 0->23, Black 23->0
        // Solution: ALWAYS invert indices (i -> 23-i)

        const invertedPoints = new Array(24).fill(null).map((_, i) => {
            const originalPoint = gameState.board.points[23 - i];
            return {
                player: originalPoint.player,
                count: originalPoint.count
            };
        });

        const payload = {
            dice: dice,
            boardState: {
                points: invertedPoints.map((p: any) => ({
                    player: p.player === 1 ? 1 : p.player === 2 ? 2 : 0,
                    count: p.count
                })),
                bar: {
                    white: gameState.board.bar.player1 || 0,
                    black: gameState.board.bar.player2 || 0
                },
                off: {
                    white: gameState.board.off.player1 || 0,
                    black: gameState.board.off.player2 || 0
                }
            },
            player: activePlayer, // Send actual player (1 or 2)
            context: {
                gamePhase: 'middle',
                matchScore: '0-0',
                opponentTendencies: 'unknown'
            }
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
        let bestMoves = data.bestMoves && data.bestMoves.length > 0
            ? [data.bestMoves[0]] // Prendre le meilleur coup
            : [];

        // INVERT MOVES BACK TO FRONTEND COORDINATES
        // Engine returns moves in its coordinate system (White 0->23, Black 23->0)
        // Frontend expects White 23->0, Black 0->23
        // So we must invert: i -> 23 - i
        if (bestMoves.length > 0) {
            bestMoves = bestMoves.map((move: any) => {
                // Handle Bar (25) -> -1 or similar if needed. 
                // Assuming API returns 0-23 indices or 1-24 points.
                // If API returns 0-23 indices:
                // 23 - from
                // 23 - to

                // Check if move is from Bar (often 24 or 25 in some APIs, or 'bar')
                // For now assuming indices 0-23.

                return {
                    ...move,
                    from: typeof move.from === 'number' && move.from >= 0 && move.from <= 23 ? 23 - move.from : move.from,
                    to: typeof move.to === 'number' && move.to >= 0 && move.to <= 23 ? 23 - move.to : move.to
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
