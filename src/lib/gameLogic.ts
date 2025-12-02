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
      // Player 1 (White) enters from 24 (Index 23+1) -> 24-die (Indices 23..0)
      // Player 2 (Red) enters from -1 (Index 0-1) -> -1+die (Indices 0..23)
      const dest = player === 1 ? 24 - die : die - 1;
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
        // Player 1 moves DOWN (-), Player 2 moves UP (+)
        const dest = player === 1 ? from - die : from + die;

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

// Amélioration de la règle de sortie (Bearing Off)
function canBearOff(board: BoardState, player: PlayerColor, from: number, die: number): boolean {
  // Player 1 (Down): Home is 0-5
  // Player 2 (Up): Home is 18-23
  const homeStart = player === 1 ? 0 : 18;
  const homeEnd = player === 1 ? 6 : 24;

  // 1. Vérifier si tous les pions sont dans la maison intérieure
  for (let i = 0; i < 24; i++) {
    const point = board.points[i];
    if (point.player === player && point.count > 0) {
      // Si un pion est hors de la maison
      if (player === 1 && i >= 6) return false; // P1 doit être dans 0-5
      if (player === 2 && i < 18) return false; // P2 doit être dans 18-23
    }
  }

  // Vérifier aussi la barre
  if ((player === 1 && board.bar.player1 > 0) || (player === 2 && board.bar.player2 > 0)) {
    return false;
  }

  const dest = player === 1 ? from - die : from + die;

  // 2. Sortie directe (le dé correspond exactement à la distance de sortie)
  // P1: sort vers -1. P2: sort vers 24.
  if (player === 1 && dest === -1) return true;
  if (player === 2 && dest === 24) return true;

  // 3. Sortie avec un dé supérieur (si aucun pion sur les points plus éloignés)
  if (player === 1 && dest < -1) {
    // Vérifier s'il y a des pions sur les points précédents (plus loin que 'from')
    // Pour P1 (Down), plus loin = indices plus grands (from+1 à 5)
    for (let i = from + 1; i <= 5; i++) {
      if (board.points[i].player === player && board.points[i].count > 0) return false;
    }
    return true;
  }

  if (player === 2 && dest > 24) {
    // Vérifier s'il y a des pions sur les points précédents (plus loin que 'from')
    // Pour P2 (Up), plus loin = indices plus petits (18 à from-1)
    for (let i = 18; i < from; i++) {
      if (board.points[i].player === player && board.points[i].count > 0) return false;
    }
    return true;
  }

  return false;
}

export function makeMove(
  board: BoardState,
  player: PlayerColor,
  from: number,
  to: number
): BoardState {
  const newBoard = JSON.parse(JSON.stringify(board));

  // 1. Retirer le pion du point de départ
  if (from === -1) {
    // Sortie de la barre
    if (player === 1) newBoard.bar.player1--;
    else newBoard.bar.player2--;
  } else if (from >= 0 && from <= 23) {
    newBoard.points[from].count--;
    if (newBoard.points[from].count === 0) {
      newBoard.points[from].player = null;
    }
  }

  // 2. Ajouter le pion au point d'arrivée
  // Gestion Sortie (Bear Off)
  // P1 sort si to < 0. P2 sort si to > 23.
  if ((player === 1 && to < 0) || (player === 2 && to > 23)) {
    if (player === 1) newBoard.off.player1++;
    else newBoard.off.player2++;
  }
  // Mouvement normal
  else if (to >= 0 && to <= 23) {
    const destPoint = newBoard.points[to];

    // Gérer la frappe (Hit)
    if (destPoint.player !== null && destPoint.player !== player && destPoint.count === 1) {
      // Le pion adverse est frappé et envoyé à la barre
      if (destPoint.player === 1) newBoard.bar.player1++;
      else newBoard.bar.player2++;
      destPoint.count = 1; // Le pion frappé est remplacé par le nouveau
      destPoint.player = player;
    } else {
      destPoint.player = player;
      destPoint.count++;
    }
  }

  return newBoard;
}

export type WinType = 'simple' | 'gammon' | 'backgammon';

export function checkWinType(board: BoardState, winner: PlayerColor): WinType {
  const loser = winner === 1 ? 2 : 1;
  const loserOff = loser === 1 ? board.off.player1 : board.off.player2;

  // 1. Simple Victory: The loser has borne off at least one checker.
  if (loserOff > 0) return 'simple';

  // 2. Gammon or Backgammon: The loser has NOT borne off any checkers.

  // Check for Backgammon:
  // Loser has at least one checker in the Winner's Home Board OR on the Bar.
  // P1 Home: 0-5. P2 Home: 18-23.
  const winnerHomeStart = winner === 1 ? 0 : 18;
  const winnerHomeEnd = winner === 1 ? 6 : 24;

  let hasCheckerInWinnerHomeOrBar = false;

  // Check Bar
  if ((loser === 1 && board.bar.player1 > 0) || (loser === 2 && board.bar.player2 > 0)) {
    hasCheckerInWinnerHomeOrBar = true;
  }

  // Check Winner's Home Board
  if (!hasCheckerInWinnerHomeOrBar) {
    for (let i = winnerHomeStart; i < winnerHomeEnd; i++) {
      const point = board.points[i];
      if (point.player === loser && point.count > 0) {
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
  // P1 moves Down (-), P2 moves Up (+)
  return player === 1 ? -1 : 1;
}

export function getSmartMove(
  board: BoardState,
  player: PlayerColor,
  from: number,
  dice: number[]
): { to: number; dieUsed: number } | null {
  // 1. Essayer avec le plus grand dé d'abord (Convention UX standard)
  const sortedDice = [...dice].sort((a, b) => b - a);

  for (const die of sortedDice) {
    // P1 moves Down (-), P2 moves Up (+)
    const dest = player === 1 ? from - die : from + die;

    // Vérifier la sortie (Bearing Off)
    if (player === 1 && dest < 0) {
      if (canBearOff(board, player, from, die)) return { to: dest, dieUsed: die };
    } else if (player === 2 && dest >= 24) {
      if (canBearOff(board, player, from, die)) return { to: dest, dieUsed: die };
    }
    // Vérifier le mouvement normal
    else if (canMoveTo(board, player, dest)) {
      return { to: dest, dieUsed: die };
    }
  }

  return null;
}

/**
 * Trouve un coup valide pour le bot (fallback heuristique)
 * Cherche tous les coups possibles et en choisit un
 */
export function findAnyValidMove(
  board: BoardState,
  player: PlayerColor,
  dice: number[]
): { from: number; to: number; dieUsed: number } | null {
  // 1. Vérifier si on a des pions sur la barre
  const barCount = player === 1 ? board.bar.player1 : board.bar.player2;
  if (barCount > 0) {
    // Doit entrer depuis la barre
    for (const die of dice) {
      const entryPoint = player === 1 ? 24 - die : die - 1;
      if (canMoveTo(board, player, entryPoint)) {
        return { from: -1, to: entryPoint, dieUsed: die };
      }
    }
    return null; // Pas de point d'entrée disponible
  }

  // 2. Chercher tous les coups possibles
  const validMoves: { from: number; to: number; dieUsed: number }[] = [];

  for (let from = 0; from < 24; from++) {
    const point = board.points[from];
    if (point.player === player && point.count > 0) {
      for (const die of dice) {
        const dest = player === 1 ? from - die : from + die;

        // Bear-off
        if ((player === 1 && dest < 0) || (player === 2 && dest >= 24)) {
          if (canBearOff(board, player, from, die)) {
            validMoves.push({ from, to: dest, dieUsed: die });
          }
        }
        // Mouvement normal
        else if (dest >= 0 && dest < 24 && canMoveTo(board, player, dest)) {
          validMoves.push({ from, to: dest, dieUsed: die });
        }
      }
    }
  }

  if (validMoves.length === 0) return null;

  // 3. Choisir le meilleur coup (heuristique simple)
  // Priorité : Bear-off > Avancer > Sécuriser
  const bearOffMove = validMoves.find(m => (player === 1 && m.to < 0) || (player === 2 && m.to >= 24));
  if (bearOffMove) return bearOffMove;

  // Avancer le plus possible
  const sortedMoves = validMoves.sort((a, b) => {
    const distA = player === 1 ? a.from - a.to : a.to - a.from;
    const distB = player === 1 ? b.from - b.to : b.to - b.from;
    return distB - distA; // Plus grand déplacement en premier
  });

  return sortedMoves[0];
}

// ============================================
// DOUBLING CUBE LOGIC
// ============================================

/**
 * Vérifie si un joueur peut proposer de doubler
 * @param cubeValue Valeur actuelle du cube
 * @param cubeOwner ID du propriétaire du cube (null si au centre)
 * @param playerId ID du joueur qui veut doubler
 * @param hasDiceRolled Si les dés ont été lancés ce tour
 * @param matchLength Longueur du match (0 = money game)
 * @param score Score actuel des joueurs
 * @param isCrawfordGame Si on est dans le Crawford game
 * @returns true si le joueur peut proposer de doubler
 */
export function canOfferDouble(
  cubeValue: number,
  cubeOwner: string | null,
  playerId: string,
  hasDiceRolled: boolean,
  matchLength: number = 0,
  score?: { [key: string]: number },
  isCrawfordGame: boolean = false
): boolean {
  // 1. Le cube ne peut pas dépasser 64
  if (cubeValue >= 64) return false;

  // 2. On ne peut pas doubler après avoir lancé les dés
  if (hasDiceRolled) return false;

  // 3. Crawford Rule: Pas de cube pendant le Crawford game
  if (isCrawfordGame) return false;

  // 4. Le joueur doit posséder le cube OU le cube doit être au centre
  if (cubeOwner !== null && cubeOwner !== playerId) return false;

  return true;
}

/**
 * Accepte une proposition de double
 * Le joueur qui accepte devient propriétaire du cube
 * @param cubeValue Valeur actuelle du cube
 * @param acceptingPlayerId ID du joueur qui accepte
 * @returns Nouvel état du cube
 */
export function acceptDouble(
  cubeValue: number,
  acceptingPlayerId: string
): { cubeValue: number; cubeOwner: string } {
  return {
    cubeValue: cubeValue * 2,
    cubeOwner: acceptingPlayerId
  };
}

/**
 * Rejette une proposition de double (Drop/Pass)
 * Le joueur qui rejette perd la partie
 * @param cubeValue Valeur actuelle du cube
 * @param rejectingPlayerId ID du joueur qui rejette
 * @returns Points gagnés par l'adversaire
 */
export function rejectDouble(cubeValue: number): number {
  // Le joueur qui propose gagne la valeur ACTUELLE du cube (avant doublement)
  return cubeValue;
}

/**
 * Beaver: Re-doubler immédiatement après avoir accepté (optionnel, money game only)
 * Le joueur qui beaver garde le cube
 * @param cubeValue Valeur après acceptation
 * @param beaverPlayerId ID du joueur qui beaver
 * @returns Nouvel état du cube
 */
export function beaver(
  cubeValue: number,
  beaverPlayerId: string
): { cubeValue: number; cubeOwner: string } {
  return {
    cubeValue: cubeValue * 2,
    cubeOwner: beaverPlayerId
  };
}

/**
 * Calcule les points gagnés en fin de partie selon le type de victoire et le cube
 * @param winType Type de victoire (simple, gammon, backgammon)
 * @param cubeValue Valeur du cube
 * @returns Points gagnés
 */
export function calculatePoints(winType: WinType, cubeValue: number): number {
  const multiplier = winType === 'simple' ? 1 : winType === 'gammon' ? 2 : 3;
  return cubeValue * multiplier;
}

/**
 * Calcule le score de match après une partie
 * @param winType Type de victoire (simple, gammon, backgammon)
 * @param cubeValue Valeur du cube
 * @param matchLength Longueur du match (0 = money game, pas de calcul de match)
 * @param currentScore Score actuel du match { player1: number, player2: number }
 * @param winnerPlayerId ID du joueur gagnant
 * @param players Array des joueurs [player1, player2]
 * @returns Nouveau score du match ou null si money game
 */
export function calculateMatchScore(
  winType: WinType,
  cubeValue: number,
  matchLength: number,
  currentScore: { [playerId: string]: number },
  winnerPlayerId: string,
  players: Array<{ id: string }>
): { [playerId: string]: number } | null {
  // Money game: pas de calcul de match
  if (matchLength === 0) {
    return null;
  }

  // Calculer les points gagnés
  const pointsWon = calculatePoints(winType, cubeValue);

  // Créer nouveau score
  const newScore = { ...currentScore };
  newScore[winnerPlayerId] = (newScore[winnerPlayerId] || 0) + pointsWon;

  return newScore;
}

