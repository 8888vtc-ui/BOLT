import { BoardState, CheckerState, Color, CubeState, DiceState, LegalMove, PipIndex } from '../types';
import { getValidMoves, PlayerColor, Point } from '../../lib/gameLogic';

// Import debug store for visible logging
let debugStore: any = null;
try {
    const debugModule = require('../../stores/debugStore');
    debugStore = debugModule.useDebugStore;
} catch (e) {
    // Fallback if debug store not available
}

// Define the shape of the existing GameState (approximate)
interface LegacyGameState {
    board: {
        points?: { player: number | null; count: number }[];
    } | { player: number | null; count: number }[];
    dice: number[];
    turn: string;
    bar: { player1?: number; player2?: number;[key: string]: number | undefined };
    off: { player1?: number; player2?: number;[key: string]: number | undefined };
    cubeValue?: number;
    cubeOwner?: string | null;
    validMoves?: any[];
    matchLength?: number;
}

// Helper to get points array from various legacy formats
const getPointsArray = (board: LegacyGameState['board']): { player: number | null; count: number }[] => {
    if (Array.isArray(board)) {
        return board;
    }
    if (board && typeof board === 'object' && 'points' in board && Array.isArray((board as any).points)) {
        return (board as any).points;
    }
    // Fallback: create empty board
    return Array(24).fill({ player: null, count: 0 });
};

export const mapGameStateToBoardState = (
    gameState: LegacyGameState,
    myId: string,
    players: { id: string; color: number }[]
): BoardState => {
    const checkers: CheckerState[] = [];

    // Helper to determine color from player ID or number
    const getColor = (playerId: string | number | null | undefined): Color => {
        if (playerId === null || playerId === undefined) return 'light';

        // Numeric player ID (1 or 2)
        if (playerId === 1) return 'light';
        if (playerId === 2) return 'dark';

        // String ID - look up in players array
        // Vérifier que players est valide et non vide
        if (players && players.length > 0) {
            const p = players.find(p => p && p.id === String(playerId));
            if (p) {
                return p.color === 1 ? 'light' : 'dark';
            }
        }

        // CRITICAL: Map specific player IDs
        const playerIdStr = String(playerId);
        if (playerIdStr === 'guest' || playerIdStr === myId) {
            // Guest or current user is always light (player 1)
            return 'light';
        }
        if (playerIdStr === 'bot') {
            // Bot is always dark (player 2)
            return 'dark';
        }

        // Fallback: Check if it's the current user
        if (playerIdStr === myId) return 'light';

        // Default to dark for opponent/bot
        return 'dark';
    };

    // Get points array safely
    const points = getPointsArray(gameState.board);

    // Map Board Points (0-23 in legacy -> 1-24 in GuruGammon)
    points.forEach((point, index) => {
        if (point && point.count > 0 && point.player !== null) {
            const color = getColor(point.player);
            // Map index 0-23 to PipIndex 1-24
            const pip = (index + 1) as PipIndex;

            for (let i = 0; i < point.count; i++) {
                checkers.push({
                    id: `checker-${pip}-${i}`,
                    color,
                    pip,
                    z: i
                });
            }
        }
    });

    // Map Bar - handle both formats: { player1: n, player2: n } and { 'user-id': n }
    // FIX: Éviter le double comptage - utiliser soit player1/player2, soit Object.entries, pas les deux
    if (gameState.bar) {
        // Vérifier si on a le format player1/player2
        const hasPlayerFormat = typeof gameState.bar.player1 === 'number' || typeof gameState.bar.player2 === 'number';

        if (hasPlayerFormat) {
            // Utiliser le format player1/player2 uniquement
            if (typeof gameState.bar.player1 === 'number' && gameState.bar.player1 > 0) {
                for (let i = 0; i < gameState.bar.player1; i++) {
                    checkers.push({
                        id: `bar-light-${i}`,
                        color: 'light',
                        pip: 'bar',
                        z: i
                    });
                }
            }
            if (typeof gameState.bar.player2 === 'number' && gameState.bar.player2 > 0) {
                for (let i = 0; i < gameState.bar.player2; i++) {
                    checkers.push({
                        id: `bar-dark-${i}`,
                        color: 'dark',
                        pip: 'bar',
                        z: i
                    });
                }
            }
        } else {
            // Utiliser Object.entries uniquement si pas de format player1/player2
            // PROTECTION: Éviter de compter 'player1' et 'player2' comme clés si elles existent déjà
            Object.entries(gameState.bar).forEach(([playerId, count]) => {
                // Éviter le double comptage: si playerId est 'player1' ou 'player2', skip (déjà traité)
                if (playerId !== 'player1' && playerId !== 'player2' && typeof count === 'number' && count > 0) {
                    const color = getColor(playerId);
                    for (let i = 0; i < count; i++) {
                        checkers.push({
                            id: `bar-${playerId}-${i}`,
                            color,
                            pip: 'bar',
                            z: i
                        });
                    }
                }
            });
        }
    }

    // Map Off (Borne) - same dual format handling
    // FIX: Éviter le double comptage - utiliser soit player1/player2, soit Object.entries, pas les deux
    if (gameState.off) {
        // Vérifier si on a le format player1/player2
        const hasPlayerFormat = typeof gameState.off.player1 === 'number' || typeof gameState.off.player2 === 'number';

        if (hasPlayerFormat) {
            // Utiliser le format player1/player2 uniquement
            if (typeof gameState.off.player1 === 'number' && gameState.off.player1 > 0) {
                for (let i = 0; i < gameState.off.player1; i++) {
                    checkers.push({
                        id: `off-light-${i}`,
                        color: 'light',
                        pip: 'borne',
                        z: i
                    });
                }
            }
            if (typeof gameState.off.player2 === 'number' && gameState.off.player2 > 0) {
                for (let i = 0; i < gameState.off.player2; i++) {
                    checkers.push({
                        id: `off-dark-${i}`,
                        color: 'dark',
                        pip: 'borne',
                        z: i
                    });
                }
            }
        } else {
            // Utiliser Object.entries uniquement si pas de format player1/player2
            // PROTECTION: Éviter de compter 'player1' et 'player2' comme clés si elles existent déjà
            Object.entries(gameState.off).forEach(([playerId, count]) => {
                // Éviter le double comptage: si playerId est 'player1' ou 'player2', skip (déjà traité)
                if (playerId !== 'player1' && playerId !== 'player2' && typeof count === 'number' && count > 0) {
                    const color = getColor(playerId);
                    for (let i = 0; i < count; i++) {
                        checkers.push({
                            id: `off-${playerId}-${i}`,
                            color,
                            pip: 'borne',
                            z: i
                        });
                    }
                }
            });
        }
    }

    // Map Dice
    const diceValues = gameState.dice && gameState.dice.length >= 2
        ? [gameState.dice[0], gameState.dice[1]] as [number, number]
        : null;

    const dice: DiceState = {
        values: diceValues,
        rolling: false,
        used: gameState.dice?.length > 2
            ? [gameState.dice[2] === 0, gameState.dice[3] === 0] // Some formats store used state
            : [false, false]
    };

    // Map Cube
    const cubeValue = (gameState.cubeValue || 1) as 1 | 2 | 4 | 8 | 16 | 32 | 64;
    let cubeOwner: 'center' | 'light' | 'dark' = 'center';

    if (gameState.cubeOwner) {
        const ownerColor = getColor(gameState.cubeOwner);
        cubeOwner = ownerColor;
    }

    const cube: CubeState = {
        value: cubeValue,
        owner: cubeOwner
    };

    // Map Turn
    const turn = getColor(gameState.turn);

    // Calculate Legal Moves dynamically using gameLogic
    const legalMoves: LegalMove[] = [];

    // === VALIDATION: Ne pas calculer les moves si c'est le tour du BOT ===
    // Vérifier que players est valide avant d'accéder à ses éléments
    const isBotTurn = gameState.turn === 'bot' ||
        (players && players.length > 1 && players[1] && gameState.turn === players[1].id && players[1].id !== myId);

    // Déterminer si c'est vraiment le tour du joueur humain
    const isMyTurn = !isBotTurn && (
        gameState.turn === myId ||
        gameState.turn === 'guest' ||
        gameState.turn === 'guest-1' ||
        gameState.turn === undefined ||
        gameState.turn === null ||
        (players && players.length > 0 && players[0] && gameState.turn === players[0].id)
    );

    // Determine current player color (1 or 2)
    // CRITICAL: Map turn to player color correctly
    let currentPlayerColor: PlayerColor;

    // If gameState.turn is a player ID, map it correctly
    if (typeof gameState.turn === 'string') {
        const turnStr = gameState.turn;

        // Map specific player IDs
        if (turnStr === 'guest' || turnStr === myId) {
            currentPlayerColor = 1; // Light
        } else if (turnStr === 'bot') {
            currentPlayerColor = 2; // Dark
        } else {
            // Look up in players array - vérifier que players est valide
            if (players && players.length > 0) {
                const turnPlayer = players.find(p => p && p.id === turnStr);
                if (turnPlayer) {
                    currentPlayerColor = turnPlayer.color as PlayerColor;
                } else {
                    // Fallback: if it's myId, it's player 1
                    currentPlayerColor = turnStr === myId ? 1 : 2;
                }
            } else {
                // Fallback: if it's myId, it's player 1
                currentPlayerColor = turnStr === myId ? 1 : 2;
            }
        }
    } else {
        // If turn is already mapped to 'light' or 'dark'
        currentPlayerColor = turn === 'light' ? 1 : 2;
    }


    // === BLOCAGE: Ne pas calculer les legal moves si c'est le tour du BOT ===
    if (isBotTurn) {
        // Retourner avec legalMoves vide, mais sans erreur
        // Le bot calcule ses propres coups via l'API
        return {
            checkers,
            dice,
            cube,
            legalMoves: [],
            turn
        };
    }

    // Get dice values for move calculation - handle various formats
    let diceForMoves: number[] = [];
    if (gameState.dice) {
        if (Array.isArray(gameState.dice)) {
            // CRITICAL FIX: Pour un double, utiliser TOUS les dés (4 dés)
            // Un double [1,1,1,1] doit permettre 4 mouvements, pas seulement 2
            if (gameState.dice.length === 4) {
                // Double: utiliser tous les 4 dés pour permettre 4 mouvements
                diceForMoves = [...gameState.dice]; // [die, die, die, die]
            } else if (gameState.dice.length >= 2) {
                // Non-double: utiliser les 2 dés
                diceForMoves = [gameState.dice[0], gameState.dice[1]];
            } else if (gameState.dice.length > 0) {
                diceForMoves = gameState.dice;
            }
        }
    }

    // Log niveau debug au lieu d'error
    console.debug('[mappers] DICE EXTRACTION:', {
        originalDice: gameState.dice,
        extractedDice: diceForMoves,
        diceLength: diceForMoves.length
    });

    // Get points array safely
    const pointsArray = getPointsArray(gameState.board);

    // Only calculate moves if we have dice and a valid board

    if (diceForMoves.length > 0 && pointsArray.length === 24) {
        try {
            // Convert to BoardState format for getValidMoves
            // CRITICAL: Map player IDs to colors (1 or 2)
            // players[0] is light (1), players[1] is dark (2)
            // Vérifier que players est valide et contient les éléments nécessaires
            const player0Id = players && players.length > 0 && players[0] ? players[0].id : null;
            const player1Id = players && players.length > 1 && players[1] ? players[1].id : null;

            const boardStateForLogic: { points: Point[]; bar: { player1: number; player2: number }; off: { player1: number; player2: number } } = {
                points: pointsArray.map((p) => {
                    let mappedPlayer: 1 | 2 | null = null;

                    if (p.player !== null && p.player !== undefined) {
                        // If numeric, use directly
                        if (typeof p.player === 'number' && (p.player === 1 || p.player === 2)) {
                            mappedPlayer = p.player;
                        } else {
                            // If string ID, map to color
                            const playerStr = String(p.player);
                            if (playerStr === player0Id) {
                                mappedPlayer = 1; // Light
                            } else if (playerStr === player1Id) {
                                mappedPlayer = 2; // Dark
                            }
                        }
                    }

                    return {
                        player: mappedPlayer,
                        count: p.count || 0
                    };
                }),
                bar: {
                    player1: gameState.bar?.player1 || (gameState.bar && typeof gameState.bar[player0Id || ''] === 'number' ? (gameState.bar[player0Id || ''] as number) : 0),
                    player2: gameState.bar?.player2 || (gameState.bar && typeof gameState.bar[player1Id || ''] === 'number' ? (gameState.bar[player1Id || ''] as number) : 0)
                },
                off: {
                    player1: gameState.off?.player1 || (gameState.off && typeof gameState.off[player0Id || ''] === 'number' ? (gameState.off[player0Id || ''] as number) : 0),
                    player2: gameState.off?.player2 || (gameState.off && typeof gameState.off[player1Id || ''] === 'number' ? (gameState.off[player1Id || ''] as number) : 0)
                }
            };

            // Use getValidMoves to calculate all valid moves
            const validMovesMap = getValidMoves(boardStateForLogic, currentPlayerColor, diceForMoves);

            // Convert Map to LegalMove array
            validMovesMap.forEach((destinations, fromIndex) => {
                destinations.forEach((toIndex) => {
                    // Convert from index (-1 or 0-23) to PipIndex | 'bar'
                    const from: PipIndex | 'bar' = fromIndex === -1
                        ? 'bar'
                        : (fromIndex + 1) as PipIndex;

                    // Convert to index (-1, 24, or 0-23) to PipIndex | 'borne'
                    const to: PipIndex | 'borne' = (toIndex === -1 || toIndex === 24)
                        ? 'borne'
                        : (toIndex + 1) as PipIndex;

                    legalMoves.push({ from, to });
                });
            });

        } catch (error) {
            console.warn('[mappers] Error calculating legal moves:', error);
            // Fallback to gameState.validMoves if calculation fails
            if (gameState.validMoves && Array.isArray(gameState.validMoves)) {
                gameState.validMoves.forEach((m: any) => {
                    let from: PipIndex | 'bar';
                    let to: PipIndex | 'borne';

                    if (m.bar || m.from === 'bar' || m.from === -1 || m.from === 24) {
                        from = 'bar';
                    } else if (typeof m.from === 'number') {
                        from = (m.from + 1) as PipIndex;
                    } else {
                        from = m.from as PipIndex;
                    }

                    if (m.to === -1 || m.to === 24 || m.to === 'off' || m.to === 'borne') {
                        to = 'borne';
                    } else if (typeof m.to === 'number') {
                        to = (m.to + 1) as PipIndex;
                    } else {
                        to = m.to as PipIndex;
                    }

                    legalMoves.push({ from, to });
                });
            }
        }
    } else {
        // Cas normal quand dice=0 (avant lancement des dés) - pas d'erreur, juste debug
        if (diceForMoves.length === 0) {
            console.debug('[mappers] No dice yet - legal moves empty (normal before roll)');
        } else {
            // Vrai problème si on a des dés mais pas de board valide
            console.warn('[mappers] Cannot calculate legal moves - invalid board state', {
                diceLength: diceForMoves.length,
                pointsLength: pointsArray.length
            });
        }
    }

    return {
        checkers,
        dice,
        cube,
        legalMoves,
        turn
    };
};

// Reverse mapper: Convert BoardState move back to legacy format
export const mapMoveToLegacy = (
    from: PipIndex | 'bar',
    to: PipIndex | 'borne',
    _playerColor?: number // Paramètre optionnel pour compatibilité (non utilisé)
): { from: number; to: number } => {
    const legacyFrom = from === 'bar' ? -1 : (from as number) - 1;
    const legacyTo = to === 'borne' ? -1 : (to as number) - 1;

    return { from: legacyFrom, to: legacyTo };
};
