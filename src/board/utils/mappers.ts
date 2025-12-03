import { BoardState, CheckerState, Color, CubeState, DiceState, LegalMove, PipIndex } from '../types';

// Define the shape of the existing GameState (approximate)
interface LegacyGameState {
    board: {
        points?: { player: number | null; count: number }[];
    } | { player: number | null; count: number }[];
    dice: number[];
    turn: string;
    bar: { player1?: number; player2?: number; [key: string]: number | undefined };
    off: { player1?: number; player2?: number; [key: string]: number | undefined };
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
    if (board && 'points' in board && Array.isArray(board.points)) {
        return board.points;
    }
    // Fallback: create empty board
    console.warn('[mappers] Invalid board structure, creating empty board');
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
        const p = players.find(p => p.id === String(playerId));
        if (p) {
            return p.color === 1 ? 'light' : 'dark';
        }

        // Fallback: Check if it's the current user
        if (String(playerId) === myId) return 'light';
        
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
    if (gameState.bar) {
        // Try player1/player2 format first
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

        // Also check for user ID keys
        Object.entries(gameState.bar).forEach(([playerId, count]) => {
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

    // Map Off (Borne) - same dual format handling
    if (gameState.off) {
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

        Object.entries(gameState.off).forEach(([playerId, count]) => {
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

    // Map Legal Moves
    const legalMoves: LegalMove[] = (gameState.validMoves || []).map((m: any) => {
        // Handle various move formats
        let from: PipIndex | 'bar';
        let to: PipIndex | 'borne';

        // From position
        if (m.bar || m.from === 'bar' || m.from === -1 || m.from === 24) {
            from = 'bar';
        } else if (typeof m.from === 'number') {
            from = (m.from + 1) as PipIndex; // Convert 0-23 to 1-24
        } else {
            from = m.from as PipIndex;
        }

        // To position
        if (m.to === -1 || m.to === 24 || m.to === 'off' || m.to === 'borne') {
            to = 'borne';
        } else if (typeof m.to === 'number') {
            to = (m.to + 1) as PipIndex; // Convert 0-23 to 1-24
        } else {
            to = m.to as PipIndex;
        }

        return { from, to };
    });

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
    to: PipIndex | 'borne'
): { from: number; to: number } => {
    const legacyFrom = from === 'bar' ? -1 : (from as number) - 1;
    const legacyTo = to === 'borne' ? -1 : (to as number) - 1;
    
    return { from: legacyFrom, to: legacyTo };
};
