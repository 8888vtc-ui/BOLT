import { BoardState, GameState, Move } from './gameLogic';

const BOT_API_URL = 'https://botgammon.netlify.app/.netlify/functions/analyze';

interface AIAnalysisResult {
    bestMove: Move[];
    explanation: string;
    winProbability: number;
    equity: number;
    strategicAdvice?: {
        analysis: string;
        speechScript: string;
        recommendedStrategy: string;
        riskLevel: string;
    };
}

export const analyzeMove = async (
    gameState: GameState,
    dice: number[],
    playerColor?: number
): Promise<AIAnalysisResult> => {
    try {
        // 1. Determine Active Player
        const activePlayer = playerColor || (gameState.turn === 'white' ? 1 : 2);

        addLog('🤖 AI Service: Preparing analysis...', 'info', { dice, turn: gameState.turn, activePlayer });

        // 2. COORDINATE SYSTEM ALIGNMENT (Old Logic restored)
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

        // 3. Construct Payload (Old Format + requestAllMoves)
        const payload = {
            dice: dice,
            boardState: {
                points: mappedPoints,
                bar: bar,
                off: off
            },
            player: targetEnginePlayer,
            requestAllMoves: true, // CRITICAL FIX
            context: {
                gamePhase: 'middle',
                matchScore: '0-0',
                opponentTendencies: 'unknown'
            }
        };

        addLog('🤖 AI Service: Calling BotGammon API...', 'info', JSON.stringify(payload));

        const response = await fetch(BOT_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`BotGammon API Error: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        addLog('🤖 AI Service: Raw Data received', 'info', JSON.stringify(data));

        let bestMoves = data.bestMoves || [];

        // CRITICAL FIX FOR DOUBLES
        // When dice are doubles (e.g., 3-3), the API returns only 2 unique moves
        // We need to duplicate them to get 4 moves total
        const isDouble = dice.length === 2 && dice[0] === dice[1];

        if (isDouble && bestMoves.length === 2) {
            addLog('🎲 Doubles detected - duplicating moves', 'info');
            // Duplicate the moves: [move1, move2] becomes [move1, move2, move1, move2]
            bestMoves = [
                bestMoves[0],
                bestMoves[1],
                bestMoves[0],
                bestMoves[1]
            ];
        }

        // 4. Map moves back to Frontend coordinates if necessary
        // The API returns moves in 0-23 coordinates.
        // Since we mapped P2 (Up) to White (Up), the coordinates should match 1:1.
        // But we should ensure they are valid.

        if (bestMoves.length > 0) {
            bestMoves = bestMoves.map((move: any) => ({
                ...move,
                from: typeof move.from === 'number' ? move.from : move.from,
                to: typeof move.to === 'number' ? move.to : move.to
            }));
        }

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
            strategicAdvice: data.strategicAdvice
        };

    } catch (error) {
        addLog('❌ AI Analysis Failed', 'error', error);
        return {
            bestMove: [],
            explanation: "Impossible de contacter le coach. Vérifiez votre connexion.",
            winProbability: 50,
            equity: 0,
            strategicAdvice: {
                analysis: "Le serveur d'analyse est indisponible.",
                speechScript: "Désolé, je ne peux pas analyser cette position.",
                recommendedStrategy: "Jeu prudent",
                riskLevel: "N/A"
            }
        };
    }
};

// Helper for logs
import { useDebugStore } from '../store/debugStore';
const addLog = (msg: string, type: 'info' | 'success' | 'error' | 'warning' = 'info', data?: any) => {
    try {
        useDebugStore.getState().addLog(msg, type, data);
    } catch (e) {
        console.log(`[${type.toUpperCase()}] ${msg}`, data || '');
    }
};
