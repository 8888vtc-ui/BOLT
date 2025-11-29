export type PlayerColor = 1 | 2;

export interface Point {
  player: PlayerColor | null;
  count: number;
}

export interface BoardState {
  points: Point[];
  bar: { player1: number; player2: number };
  off: { player1: number; player2: number };
}

export interface GameState {
  board: BoardState;
  currentPlayer: PlayerColor;
  dice: number[];
  availableMoves: number[];
  doubleValue: number;
  canDouble: boolean;
  score: { player1: number; player2: number };
  matchLength: number;
}

export const INITIAL_BOARD: BoardState = {
  points: [
    { player: 1, count: 2 },  // Point 0: 2 blancs
    { player: null, count: 0 },
    { player: null, count: 0 },
    { player: null, count: 0 },
    { player: null, count: 0 },
    { player: 2, count: 5 },  // Point 5: 5 rouges
    { player: null, count: 0 },
    { player: 2, count: 3 },  // Point 7: 3 rouges
    { player: null, count: 0 },
    { player: null, count: 0 },
    { player: null, count: 0 },
    { player: 1, count: 5 },  // Point 11: 5 blancs
    { player: 2, count: 5 },  // Point 12: 5 rouges
    { player: null, count: 0 },
    { player: null, count: 0 },
    { player: null, count: 0 },
    { player: 1, count: 3 },  // Point 16: 3 blancs
    { player: null, count: 0 },
    { player: 1, count: 5 },  // Point 18: 5 blancs
    { player: null, count: 0 },
    { player: null, count: 0 },
    { player: null, count: 0 },
    { player: null, count: 0 },
    { player: 2, count: 2 },  // Point 23: 2 rouges
  ],
  bar: { player1: 0, player2: 0 },
  off: { player1: 0, player2: 0 },
};

export function rollDice(): number[] {
  const die1 = Math.floor(Math.random() * 6) + 1;
  const die2 = Math.floor(Math.random() * 6) + 1;

  if (die1 === die2) {
    return [die1, die1, die1, die1];
  }
  return [die1, die2];
}

export function getValidMoves(
  board: BoardState,
  player: PlayerColor,
  dice: number[]
): Map<number, number[]> {
  const validMoves = new Map<number, number[]>();

  const barCount = player === 1 ? board.bar.player1 : board.bar.player2;
  if (barCount > 0) {
    const destinations: number[] = [];
    for (const die of dice) {
      const dest = player === 1 ? die - 1 : 24 - die;
      if (canMoveTo(board, player, dest)) {
        destinations.push(dest);
      }
    }
    if (destinations.length > 0) {
      validMoves.set(-1, destinations);
    }
    return validMoves;
  }

  for (let from = 0; from < 24; from++) {
    const point = board.points[from];
    if (point.player === player && point.count > 0) {
      const destinations: number[] = [];

      for (const die of dice) {
        const dest = player === 1 ? from + die : from - die;

        if (dest < 0 || dest >= 24) {
          if (canBearOff(board, player, from, die)) {
            destinations.push(dest);
          }
        } else if (canMoveTo(board, player, dest)) {
          destinations.push(dest);
        }
      }

      if (destinations.length > 0) {
        validMoves.set(from, destinations);
      }
    }
  }

  return validMoves;
}

function canMoveTo(board: BoardState, player: PlayerColor, pointIndex: number): boolean {
  if (pointIndex < 0 || pointIndex >= 24) return false;

  const point = board.points[pointIndex];
  if (point.player === null || point.player === player) return true;
  if (point.count === 1) return true;

  return false;
}

function canBearOff(board: BoardState, player: PlayerColor, from: number, die: number): boolean {
  const homeStart = player === 1 ? 18 : 0;
  const homeEnd = player === 1 ? 24 : 6;

  for (let i = 0; i < 24; i++) {
    const point = board.points[i];
    if (point.player === player && point.count > 0) {
      if (player === 1 && i < homeStart) return false;
      if (player === 2 && i >= homeEnd) return false;
    }
  }

  const dest = player === 1 ? from + die : from - die;
  if (player === 1 && dest >= 24) return true;
  if (player === 2 && dest < 0) return true;

  return false;
}

export function makeMove(
  board: BoardState,
  player: PlayerColor,
  from: number,
  to: number
): BoardState {
  const newBoard: BoardState = {
    points: board.points.map(p => ({ ...p })),
    bar: { ...board.bar },
    off: { ...board.off },
  };

  if (from === -1) {
    if (player === 1) {
      newBoard.bar.player1--;
    } else {
      newBoard.bar.player2--;
    }
  } else {
    newBoard.points[from].count--;
    if (newBoard.points[from].count === 0) {
      newBoard.points[from].player = null;
    }
  }

  if (to < 0 || to >= 24) {
    if (player === 1) {
      newBoard.off.player1++;
    } else {
      newBoard.off.player2++;
    }
  } else {
    const destPoint = newBoard.points[to];
    if (destPoint.player !== null && destPoint.player !== player && destPoint.count === 1) {
      if (destPoint.player === 1) {
        newBoard.bar.player1++;
      } else {
        newBoard.bar.player2++;
      }
      destPoint.count = 0;
      destPoint.player = null;
    }

    if (destPoint.player === null) {
      destPoint.player = player;
      destPoint.count = 1;
    } else {
      destPoint.count++;
    }
  }

  return newBoard;
}

export function hasWon(board: BoardState, player: PlayerColor): boolean {
  const offCount = player === 1 ? board.off.player1 : board.off.player2;
  return offCount === 15;
}

export function getDirection(player: PlayerColor): 1 | -1 {
  return player === 1 ? 1 : -1;
}
