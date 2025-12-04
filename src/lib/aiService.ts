import { GameState } from '../stores/gameStore';
import { useDebugStore } from '../stores/debugStore';

// URL de l'API Bot - configurable via variable d'environnement
const BOT_API_URL = import.meta.env.VITE_BOT_API_URL || 'https://botgammon.netlify.app/.netlify/functions/analyze';

interface Move {
    from: number;
    to: number;
    die?: number;
}

export interface AIAnalysis {
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
): Promise<AIAnalysis> => {
    try {
        const addLog = useDebugStore.getState().addLog;
        // 1. Determine Active Player
        const activePlayer = playerColor || 1;

        addLog('🤖 AI Service: Preparing analysis...', 'info', { dice, activePlayer });

        // 2. COORDINATE SYSTEM ALIGNMENT (Old Logic restored)
        // Frontend: P1 moves DOWN (23->0), P2 moves UP (0->23).
        // Engine: White moves UP (0->23), Black moves DOWN (23->0).

        // Strategy: Map Active Player to the Engine Player that moves in the same direction.
        // If Active is P1 (Down) -> Map to Engine Black (Down).
        // If Active is P2 (Up)   -> Map to Engine White (Up).

        const targetEnginePlayer = activePlayer === 1 ? 2 : 1; // 1=White, 2=Black
        const opponentEnginePlayer = targetEnginePlayer === 1 ? 2 : 1;

        // Protection: vérifier que board et points existent
        if (!gameState || !gameState.board || !Array.isArray(gameState.board.points)) {
            throw new Error('Invalid gameState: board.points is missing or not an array');
        }

        // Map Points avec protection
        const mappedPoints = gameState.board.points.map((p: any, index: number) => {
            // Protection: vérifier que p est un objet valide
            if (!p || typeof p !== 'object') {
                addLog(`⚠️ [AI] Invalid point at index ${index}, using default`, 'warning', { point: p });
                return { player: 0, count: 0 };
            }

            let enginePlayer = 0;
            const player = typeof p.player === 'number' ? p.player : null;
            const count = typeof p.count === 'number' ? p.count : 0;

            if (player === activePlayer) enginePlayer = targetEnginePlayer;
            else if (player !== null && player !== 0) enginePlayer = opponentEnginePlayer;

            return {
                player: enginePlayer,
                count: count
            };
        });

        // Map Bar and Off avec protection
        const bar = { white: 0, black: 0 };
        const off = { white: 0, black: 0 };

        // Protection: vérifier que bar et off existent
        const boardBar = gameState.board.bar || {};
        const boardOff = gameState.board.off || {};

        if (targetEnginePlayer === 1) { // I am White (Up) -> I am P2
            bar.white = typeof boardBar.player2 === 'number' ? boardBar.player2 : 0;
            bar.black = typeof boardBar.player1 === 'number' ? boardBar.player1 : 0;
            off.white = typeof boardOff.player2 === 'number' ? boardOff.player2 : 0;
            off.black = typeof boardOff.player1 === 'number' ? boardOff.player1 : 0;
        } else { // I am Black (Down) -> I am P1
            bar.black = typeof boardBar.player1 === 'number' ? boardBar.player1 : 0;
            bar.white = typeof boardBar.player2 === 'number' ? boardBar.player2 : 0;
            off.black = typeof boardOff.player1 === 'number' ? boardOff.player1 : 0;
            off.white = typeof boardOff.player2 === 'number' ? boardOff.player2 : 0;
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

        addLog('🤖 AI Service: Calling BotGammon API...', 'info', {
            url: BOT_API_URL,
            dice: dice,
            player: targetEnginePlayer
        });

        // Retry logic avec backoff exponentiel
        let lastError: Error | null = null;
        const maxRetries = 3;
        let response: Response | null = null;

        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                const controller = new AbortController();
                // Augmenter le timeout à 30s pour DeepSeek/Ollama qui peut prendre plus de temps
                const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

                response = await fetch(BOT_API_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(payload),
                    signal: controller.signal
                });

                clearTimeout(timeoutId);

                if (response.ok) {
                    break; // Succès, sortir de la boucle
                } else {
                    const errorText = await response.text();
                    lastError = new Error(`BotGammon API Error: ${response.status} - ${errorText}`);
                    addLog(`🤖 AI Service: Attempt ${attempt}/${maxRetries} failed`, 'error', {
                        status: response.status,
                        error: errorText
                    });
                }
            } catch (error: any) {
                lastError = error instanceof Error ? error : new Error(String(error));
                addLog(`🤖 AI Service: Attempt ${attempt}/${maxRetries} failed`, 'error', {
                    error: lastError.message,
                    isTimeout: error.name === 'AbortError'
                });
            }

            // Attendre avant de réessayer (backoff exponentiel)
            if (attempt < maxRetries) {
                const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000); // 1s, 2s, 4s max
                addLog(`🤖 AI Service: Retrying in ${delay}ms...`, 'info');
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }

        if (!response || !response.ok) {
            throw lastError || new Error('BotGammon API: All retry attempts failed');
        }

        // Protection: vérifier que la réponse est valide avant de parser
        let data: any;
        try {
            const responseText = await response.text();
            if (!responseText || responseText.trim() === '') {
                throw new Error('Empty response from BotGammon API');
            }
            data = JSON.parse(responseText);
        } catch (parseError: any) {
            addLog('❌ AI Service: Failed to parse API response', 'error', parseError);
            throw new Error(`BotGammon API: Invalid JSON response - ${parseError.message}`);
        }

        addLog('🤖 AI Service: Raw Data received', 'info', JSON.stringify(data));

        // Protection: vérifier que bestMoves existe et est un tableau
        let bestMoves: any[] = [];
        if (data && Array.isArray(data.bestMoves)) {
            bestMoves = data.bestMoves;
        } else if (data && Array.isArray(data.moves)) {
            bestMoves = data.moves;
        } else if (data && data.bestMove && Array.isArray(data.bestMove)) {
            bestMoves = data.bestMove;
        }

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

        // CRITICAL FIX FOR OPENING MOVES (and general move count)
        // Ensure we don't return more moves than expected
        const expectedMoves = isDouble ? 4 : 2;
        if (bestMoves.length > expectedMoves) {
            addLog(`⚠️ [AI] Too many moves returned (${bestMoves.length}), truncating to ${expectedMoves}`, 'warning');
            bestMoves = bestMoves.slice(0, expectedMoves);
        }

        // 4. Map moves back to Frontend coordinates if necessary
        // The API returns moves in 0-23 coordinates.
        // Since we mapped P2 (Up) to White (Up), the coordinates should match 1:1.
        // But we should ensure they are valid.

        if (bestMoves.length > 0) {
            bestMoves = bestMoves.map((move: any, index: number) => {
                // Protection: vérifier que move est un objet valide
                if (!move || typeof move !== 'object') {
                    addLog(`⚠️ [AI] Invalid move at index ${index}, skipping`, 'warning', { move });
                    return null;
                }

                // Normalisation des coordonnées avec protection
                let from: number;
                let to: number;
                
                try {
                    from = typeof move.from === 'number' ? move.from : parseInt(String(move.from || 0), 10);
                    to = typeof move.to === 'number' ? move.to : parseInt(String(move.to || 0), 10);
                    
                    // Vérifier que from et to sont des nombres valides
                    if (isNaN(from) || isNaN(to)) {
                        addLog(`⚠️ [AI] Invalid coordinates at index ${index}, skipping`, 'warning', { move, from, to });
                        return null;
                    }
                } catch (parseError: any) {
                    addLog(`⚠️ [AI] Error parsing move at index ${index}, skipping`, 'warning', { move, error: parseError });
                    return null;
                }
                
                const die = move.die !== undefined ? move.die : (move.dieUsed !== undefined ? move.dieUsed : undefined);

                // MAPPING CRITIQUE POUR LE JOUEUR 2 (NOIR)
                // L'API renvoie souvent des coups du point de vue "24 -> 1"
                // Mais notre moteur interne pour P2 fonctionne de "0 -> 23" (ou inversement selon l'implémentation)
                // Si P2 joue, on inverse les coordonnées : 24 - x
                // Sauf si c'est "bar" (25) ou "off" (0/25)

                // MAPPING CORRIGÉ (23 - x pour les deux joueurs)
                // Engine White (0->23) vs Frontend P1 (23->0) => Inversion
                // Engine Black (23->0) vs Frontend P2 (0->23) => Inversion
                // Donc on applique 23 - x pour tout le monde (si API 0-23)

                // Gestion du Bar (25 ou -1 selon API)
                if (from === 25 || from === -1) from = -1; // Bar interne
                else if (from >= 0 && from <= 24) from = 23 - from;

                // Gestion du Off (24, 25 ou 0 selon API)
                if (to === 24 || to === 25 || to === -1) to = 24; // Off interne
                else if (to >= 0 && to <= 23) to = 23 - to;

                // Correction temporaire : Si l'API renvoie déjà 0-23, ce mapping peut casser.
                // On va se fier aux logs pour ajuster. 
                // Pour l'instant, on applique le mapping "API 1-24 -> Interne 0-23"

                return {
                    ...move,
                    from,
                    to,
                    die
                };
            }).filter((m: any) => m !== null); // Filtrer les moves invalides
            
            // Protection: vérifier qu'il reste des moves valides
            if (bestMoves.length === 0) {
                addLog('⚠️ [AI] No valid moves after mapping', 'warning');
            } else {
                addLog('🤖 AI Service: Mapped moves', 'info', bestMoves.map((m: any) => ({ from: m.from, to: m.to, die: m.die })));
            }
        }

        // Protection: vérifier que evaluation existe avant d'accéder à ses propriétés
        const evaluation = data?.evaluation || {};
        const winProbability = typeof evaluation.winProbability === 'number' ? evaluation.winProbability : 0.5;
        const equity = typeof evaluation.equity === 'number' ? evaluation.equity : 0;

        let explanation = `Equity: ${equity !== 0 ? equity.toFixed(3) : 'N/A'}. Win: ${(winProbability * 100).toFixed(1)}%`;

        // Protection: vérifier que strategicAdvice existe avant d'accéder à ses propriétés
        const strategicAdvice = data?.strategicAdvice;
        if (strategicAdvice && typeof strategicAdvice === 'object') {
            const strategy = strategicAdvice.recommendedStrategy || 'N/A';
            const analysis = strategicAdvice.analysis || '';
            const riskLevel = strategicAdvice.riskLevel;
            
            explanation += `\n\n🧠 STRATÉGIE: ${typeof strategy === 'string' ? strategy.toUpperCase() : 'N/A'}\n`;
            if (analysis) explanation += `${analysis}\n`;
            if (riskLevel) explanation += `⚠️ Risque: ${riskLevel}\n`;
        }

        return {
            bestMove: bestMoves,
            explanation: explanation,
            winProbability: winProbability * 100,
            equity: equity,
            strategicAdvice: strategicAdvice || undefined
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
import { useDebugStore } from '../stores/debugStore';
const addLog = (msg: string, type: 'info' | 'success' | 'error' = 'info', data?: any) => {
    try {
        useDebugStore.getState().addLog(msg, type, data);
    } catch (e) {
        console.log(`[${type.toUpperCase()}] ${msg}`, data || '');
    }
};
