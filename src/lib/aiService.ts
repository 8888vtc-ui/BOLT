import { GameState } from '../stores/gameStore';

export interface AIAnalysis {
    bestMove: { from: number; to: number }[];
    explanation: string;
    winProbability: number;
}

export async function analyzePosition(gameState: GameState): Promise<AIAnalysis> {
    try {
        const response = await fetch('/.netlify/functions/analyze-move', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                boardState: gameState.board,
                dice: gameState.dice,
                turn: gameState.turn
            }),
        });

        if (!response.ok) {
            throw new Error('Analysis failed');
        }

        return await response.json();
    } catch (error) {
        console.error('AI Service Error:', error);
        // Fallback mock response if offline or error
        return {
            bestMove: [],
            explanation: "Impossible de contacter le coach (Erreur réseau ou Clé API manquante).",
            winProbability: 50
        };
    }
}
