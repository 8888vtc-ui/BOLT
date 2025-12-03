// Types GuruGammon Board
export type Color = 'light' | 'dark';
export type PipIndex = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20 | 21 | 22 | 23 | 24;

export interface CheckerState {
    id: string;
    color: Color;
    pip: PipIndex | 'bar' | 'borne';
    z?: number; // Stack position
}

export interface DiceState {
    values: [number, number] | null;
    rolling: boolean;
    used?: boolean[]; // Track used dice
}

export interface CubeState {
    value: 1 | 2 | 4 | 8 | 16 | 32 | 64;
    owner: 'center' | 'light' | 'dark';
}

export interface LegalMove {
    from: PipIndex | 'bar';
    to: PipIndex | 'borne';
}

export interface BoardState {
    checkers: CheckerState[];
    dice: DiceState;
    cube: CubeState;
    legalMoves: LegalMove[];
    turn: Color;
}

export interface Player {
    handle: string;
    rating: number;
    countryCode?: string;
    connected: boolean;
    color: Color;
}

export interface TimerState {
    msRemaining: number;
    running: boolean;
}

export interface MatchState {
    players: [Player, Player];
    score: [number, number];
    limitPoints: number;
    stakes?: string;
    timers: [TimerState, TimerState];
}

export interface BoardProps {
    state: BoardState;
    matchState?: MatchState;
    onMove?: (from: PipIndex | 'bar', to: PipIndex | 'borne') => void;
    onRollDice?: () => void;
    onDouble?: () => void;
    onTake?: () => void;
    onPass?: () => void;
    pendingDouble?: string | null;
    theme?: 'dark' | 'high-contrast' | 'daltonism';
}
