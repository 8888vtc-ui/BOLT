import { BoardState, CheckerState, Color, CubeState, DiceState, LegalMove, PipIndex } from '../types';

// Define the shape of the existing GameState (approximate)
interface LegacyGameState {
    board?: {
        points?: { player: number | null; count: number }[];
    } | { player: number | null; count: number }[];
    dice?: number[];
    turn?: string;
    bar?: { 
        player1?: number; 
        player2?: number;
        [key: string]: number | undefined; 
    };
    off?: { 
        player1?: number;
        player2?: number;
        [key: string]: number | undefined; 
    };
    cubeValue?: number;
    cubeOwner?: string | null;
    validMoves?: any[];
    usedDice?: number[];
}

export const mapGameStateToBoardState = (
    gameState: LegacyGameState,
    myId: string,
    players: { id: string; color: number }[]
): BoardState => {
    const checkers: CheckerState[] = [];

    // Helper to determine color
    const getColor = (playerId: string | number | null | undefined): Color => {
        if (playerId === null || playerId === undefined) return 'light';
        
        // Numeric player IDs
        if (playerId === 1 || playerId === 'player1') return 'light';
        if (playerId === 2 || playerId === 'player2') return 'dark';

        // String IDs - look up in players array
        const p = players.find(pl => pl.id === playerId);
        if (p) return p.color === 1 ? 'light' : 'dark';
        
        // Fallback: first player is light
        if (players.length > 0 && playerId === players[0].id) return 'light';
        
        return 'dark';
    };

    // Get the board points array - handle both formats
    const boardPoints: { player: number | null; count: number }[] = 
        Array.isArray(gameState.board) 
            ? gameState.board 
            : (gameState.board?.points || []);

    // Validate board structure
    if (!boardPoints || boardPoints.length !== 24) {
        console.warn('[mappers] Invalid board structure, using empty board', {
            hasBoard: !!gameState.board,
            boardLength: boardPoints?.length
        });
        // Return empty but valid state
        return {
            checkers: [],
            dice: { values: null, rolling: false, used: [false, false] },
            cube: { value: 1, owner: 'center' },
            legalMoves: [],
            turn: 'light'
        };
    }

    // Map Board Points (0-23 in legacy -> 1-24 in GuruGammon)
    boardPoints.forEach((point, index) => {
        if (point && point.count > 0 && point.player !== null) {
            const color: Color = point.player === 1 ? 'light' : 'dark';
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

    // Map Bar - handle both old and new formats
    if (gameState.bar) {
        // New format: { player1: N, player2: N }
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
        
        // Old format: { 'playerId': N }
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

    // Map Off (Borne) - handle both formats
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

    // Map Dice with used tracking
    const diceValues = gameState.dice || [];
    const usedDice = gameState.usedDice || [];
    const dice: DiceState = {
        values: diceValues.length >= 2 ? [diceValues[0], diceValues[1]] : null,
        rolling: false,
        used: [
            usedDice.includes(0) || (diceValues.length > 0 && diceValues[0] === 0),
            usedDice.includes(1) || (diceValues.length > 1 && diceValues[1] === 0)
        ]
    };

    // Map Cube
    const cubeValue = gameState.cubeValue || 1;
    const validCubeValues = [1, 2, 4, 8, 16, 32, 64] as const;
    const cube: CubeState = {
        value: validCubeValues.includes(cubeValue as any) ? cubeValue as 1|2|4|8|16|32|64 : 1,
        owner: gameState.cubeOwner 
            ? (getColor(gameState.cubeOwner) === 'light' ? 'light' : 'dark') 
            : 'center'
    };

    // Map Turn
    const turn = getColor(gameState.turn);

    // Map Legal Moves with proper validation
    const legalMoves: LegalMove[] = (gameState.validMoves || [])
        .filter((m: any) => m && (typeof m.from === 'number' || m.bar))
        .map((m: any) => {
            let from: PipIndex | 'bar';
            let to: PipIndex | 'borne';
            
            // Handle 'from'
            if (m.bar || m.from === -1 || m.from === 24 || m.from === 25) {
                from = 'bar';
            } else {
                // Convert 0-23 to 1-24
                from = (m.from + 1) as PipIndex;
            }
            
            // Handle 'to'
            if (m.to === -1 || m.to === 24 || m.to === 25 || m.off || m.borne) {
                to = 'borne';
            } else {
                to = (m.to + 1) as PipIndex;
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
