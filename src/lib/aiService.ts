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

        // COORDINATE SYSTEM ALIGNMENT
        // Frontend: P1 moves DOWN (23->0), P2 moves UP (0->23).
        // Engine: White moves UP (0->23), Black moves DOWN (23->0).

        // Strategy: Map Active Player to the Engine Player that moves in the same direction.
        // If Active is P1 (Down) -> Map to Engine Black (Down).
        // If Active is P2 (Up)   -> Map to Engine White (Up).

        const targetEnginePlayer = activePlayer === 1 ? 2 : 1; // 1=White, 2=Black
        const opponentEnginePlayer = targetEnginePlayer === 1 ? 2 : 1;

        // Map Points
        const mappedPoints = gameState.board.points.map((p: any) => {
            let enginePlayer = 0;
            if (p.player === activePlayer) enginePlayer = targetEnginePlayer;
            else if (p.player !== null) enginePlayer = opponentEnginePlayer;

            return {
                player: enginePlayer,
                count: p.count
            };
        });

        // Map Bar and Off
        // If target is White (1), then My Bar is White Bar.
        // If target is Black (2), then My Bar is Black Bar.
        const bar = { white: 0, black: 0 };
        const off = { white: 0, black: 0 };

        if (targetEnginePlayer === 1) { // I am White (Up) -> I am P2
            bar.white = gameState.board.bar.player2 || 0;
            bar.black = gameState.board.bar.player1 || 0;
            off.white = gameState.board.off.player2 || 0;
            off.black = gameState.board.off.player1 || 0;
        } else { // I am Black (Down) -> I am P1
            bar.black = gameState.board.bar.player1 || 0;
            bar.white = gameState.board.bar.player2 || 0;
            off.black = gameState.board.off.player1 || 0;
            off.white = gameState.board.off.player2 || 0;
        }

        const payload = {
            dice: dice,
            boardState: {
                points: mappedPoints,
                bar: bar,
                off: off
            },
            player: targetEnginePlayer,
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
