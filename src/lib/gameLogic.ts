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

// Standard Backgammon Starting Position
// GNUbg Position ID: 4HPwATDgc/ABMA
// Matches official setup: 24:2, 13:5, 8:3, 6:5 for Player 1
export const INITIAL_BOARD: BoardState = {
  points: [
    { player: 2, count: 2 },  // Index 0 (Point 1): 2 Rouges
    { player: null, count: 0 },
    { player: null, count: 0 },
    { player: null, count: 0 },
    { player: null, count: 0 },
    { player: 1, count: 5 },  // Index 5 (Point 6): 5 Blancs
    { player: null, count: 0 },
    { player: 1, count: 3 },  // Index 7 (Point 8): 3 Blancs
    { player: null, count: 0 },
    { player: null, count: 0 },
    { player: null, count: 0 },
    { player: 2, count: 5 },  // Index 11 (Point 12): 5 Rouges
    { player: 1, count: 5 },  // Index 12 (Point 13): 5 Blancs
    { player: null, count: 0 },
    { player: null, count: 0 },
    { player: null, count: 0 },
    { player: 2, count: 3 },  // Index 16 (Point 17): 3 Rouges
    { player: null, count: 0 },
    { player: 2, count: 5 },  // Index 18 (Point 19): 5 Rouges
    { player: null, count: 0 },
    { player: null, count: 0 },
    { player: null, count: 0 },
    { player: null, count: 0 },
    { player: 1, count: 2 },  // Index 23 (Point 24): 2 Blancs
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

// ... (précédent code)

// Amélioration de la règle de sortie (Bearing Off)
function canBearOff(board: BoardState, player: PlayerColor, from: number, die: number): boolean {
  const homeStart = player === 1 ? 18 : 0;
  const homeEnd = player === 1 ? 24 : 6;

  // 1. Vérifier si tous les pions sont dans la maison intérieure
  for (let i = 0; i < 24; i++) {
    const point = board.points[i];
    if (point.player === player && point.count > 0) {
      if (player === 1 && i < homeStart) return false;
      if (player === 2 && i >= homeEnd) return false;
    }
  }

  // Vérifier aussi la barre
  if ((player === 1 && board.bar.player1 > 0) || (player === 2 && board.bar.player2 > 0)) {
    return false;
  }

  const dest = player === 1 ? from + die : from - die;

  // 2. Sortie directe (le dé correspond exactement à la distance de sortie)
  if (player === 1 && dest === 24) return true;
  if (player === 2 && dest === -1) return true;

  // 3. Sortie avec un dé supérieur (si aucun pion sur les points plus éloignés)
  if (player === 1 && dest > 24) {
    // Vérifier s'il y a des pions sur les points précédents (19 à from-1)
    for (let i = 18; i < from; i++) {
      if (board.points[i].player === player && board.points[i].count > 0) return false; // On doit jouer les pions plus loin d'abord
    }
    return true;
  }

  if (player === 2 && dest < -1) {
    // Vérifier s'il y a des pions sur les points précédents (from+1 à 5)
    for (let i = from + 1; i <= 5; i++) {
      if (board.points[i].player === player && board.points[i].count > 0) return false;
    }
    return true;
  }

  return false;
}

// ... (makeMove inchangé)

export type WinType = 'simple' | 'gammon' | 'backgammon';

export function checkWinType(board: BoardState, winner: PlayerColor): WinType {
  const loser = winner === 1 ? 2 : 1;
  const loserOff = loser === 1 ? board.off.player1 : board.off.player2;

  // Si le perdant a sorti au moins un pion -> Victoire Simple
  if (loserOff > 0) return 'simple';

  // Si le perdant n'a rien sorti -> Gammon ou Backgammon
  // Vérifier Backgammon : Pions dans la maison du vainqueur ou sur la barre
  const winnerHomeStart = winner === 1 ? 18 : 0;
  const winnerHomeEnd = winner === 1 ? 24 : 6;

  let hasCheckerInWinnerHomeOrBar = false;

  // Vérifier la barre
  if ((loser === 1 && board.bar.player1 > 0) || (loser === 2 && board.bar.player2 > 0)) {
    hasCheckerInWinnerHomeOrBar = true;
  }

  // Vérifier la maison du vainqueur
  if (!hasCheckerInWinnerHomeOrBar) {
    for (let i = winnerHomeStart; i < winnerHomeEnd; i++) {
      if (board.points[i].player === loser && board.points[i].count > 0) {
        hasCheckerInWinnerHomeOrBar = true;
        break;
      }
    }
  }

  return hasCheckerInWinnerHomeOrBar ? 'backgammon' : 'gammon';
}

export function hasWon(board: BoardState, player: PlayerColor): boolean {
  const offCount = player === 1 ? board.off.player1 : board.off.player2;
  return offCount === 15;
}

export function getDirection(player: PlayerColor): 1 | -1 {
  return player === 1 ? 1 : -1;
}

