/**
 * Bot Logic Utilities
 * 
 * Ce fichier contient des fonctions utilitaires pour la logique du bot,
 * permettant de réduire la complexité de useGameSocket.ts.
 */

import { GameState, Player, Room } from '../stores/gameStore';
import { useDebugStore } from '../stores/debugStore';

/**
 * Type pour le résultat de la vérification d'initialisation
 */
export interface InitializationStatus {
    isReady: boolean;
    hasRoom: boolean;
    hasGameState: boolean;
    hasBoard: boolean;
    hasPoints: boolean;
    hasPlayers: boolean;
    pointsCount: number;
    playersCount: number;
}

/**
 * Type pour le résultat de la détection du tour du bot
 */
export interface BotTurnInfo {
    isBotTurn: boolean;
    currentTurn: string | undefined;
    myId: string;
    botId: string;
    reason: string;
}

/**
 * Vérifie si l'initialisation est complète pour le bot
 * 
 * @param room La room actuelle
 * @param gameState L'état du jeu
 * @param players Les joueurs
 * @returns InitializationStatus
 */
export const checkBotInitialization = (
    room: Room | null,
    gameState: GameState | null,
    players: Player[] | null
): InitializationStatus => {
    const hasRoom = !!room;
    const hasGameState = !!gameState;
    const hasBoard = !!(gameState?.board);
    const hasPoints = !!(gameState?.board?.points);
    const pointsCount = gameState?.board?.points?.length || 0;
    const hasPlayers = !!(players && players.length >= 2);
    const playersCount = players?.length || 0;

    const isReady = (
        hasRoom &&
        hasGameState &&
        hasBoard &&
        hasPoints &&
        pointsCount === 24 &&
        hasPlayers
    );

    return {
        isReady,
        hasRoom,
        hasGameState,
        hasBoard,
        hasPoints,
        hasPlayers,
        pointsCount,
        playersCount
    };
};

/**
 * Vérifie si c'est un jeu solo (contre le bot)
 * 
 * @param room La room actuelle
 * @param players Les joueurs
 * @returns boolean
 */
export const isSoloGame = (room: Room | null, players: Player[] | null): boolean => {
    if (!room) return false;
    
    return (
        room.id === 'offline-bot' ||
        room.name?.startsWith('Entraînement') ||
        (players !== null && players.length <= 1)
    );
};

/**
 * Détermine si c'est le tour du bot
 * 
 * @param gameState L'état du jeu
 * @param players Les joueurs
 * @param userId L'ID de l'utilisateur actuel
 * @returns BotTurnInfo
 */
export const checkBotTurn = (
    gameState: GameState | null,
    players: Player[] | null,
    userId: string | undefined
): BotTurnInfo => {
    const currentTurn = gameState?.turn;
    
    // ID du joueur humain
    const myId = userId || 
        (players && players.length > 0 && players[0] && players[0].id ? players[0].id : 'guest');
    
    // ID du bot (toujours le joueur 2)
    const botId = (players && players.length > 1 && players[1] && players[1].id) 
        ? players[1].id 
        : 'bot';

    // Vérifier si c'est le tour du bot
    const isBotTurn = (
        currentTurn === botId ||
        currentTurn === 'bot' ||
        (players && players.length > 1 && players[1] && currentTurn === players[1].id)
    );

    // Déterminer la raison
    let reason: string;
    if (currentTurn === myId) {
        reason = "C'est le tour du joueur";
    } else if (currentTurn === players?.[0]?.id) {
        reason = "C'est le tour du joueur 1";
    } else if (currentTurn === players?.[1]?.id) {
        reason = isBotTurn ? "C'est le tour du bot" : "C'est le tour du bot (mais non détecté!)";
    } else if (currentTurn === 'bot') {
        reason = "C'est le tour du bot (ID='bot')";
    } else if (currentTurn === 'guest' || currentTurn === 'guest-1') {
        reason = "C'est le tour du joueur (guest)";
    } else {
        reason = `Tour inconnu: ${currentTurn}`;
    }

    return {
        isBotTurn,
        currentTurn,
        myId,
        botId,
        reason
    };
};

/**
 * Vérifie si le bot a des dés disponibles
 * 
 * @param gameState L'état du jeu
 * @returns boolean
 */
export const botHasDice = (gameState: GameState | null): boolean => {
    return !!(
        gameState?.dice &&
        Array.isArray(gameState.dice) &&
        gameState.dice.length > 0
    );
};

/**
 * Génère une clé unique pour identifier une position d'analyse
 * Cela évite d'analyser la même position plusieurs fois
 * 
 * @param gameState L'état du jeu
 * @returns string
 */
export const generateAnalysisKey = (gameState: GameState | null): string => {
    if (!gameState) return 'no-state';
    
    const turn = gameState.turn || 'unknown';
    const diceStr = gameState.dice?.join('-') || 'no-dice';
    const boardHash = gameState.board?.points?.length || 'no-board';
    
    return `${turn}-${diceStr}-${boardHash}`;
};

/**
 * Vérifie si le bot doit répondre à une offre de double
 * 
 * @param gameState L'état du jeu
 * @returns boolean
 */
export const hasPendingDoubleForBot = (gameState: GameState | null): boolean => {
    return !!(
        gameState?.pendingDouble &&
        gameState.pendingDouble.offeredBy !== 'bot'
    );
};

/**
 * Vérifie si le bot peut proposer de doubler
 * 
 * @param gameState L'état du jeu
 * @returns boolean
 */
export const canBotConsiderDoubling = (gameState: GameState | null): boolean => {
    return !!(
        gameState &&
        gameState.dice?.length === 0 &&
        !gameState.pendingDouble
    );
};

/**
 * Log les informations de debug du bot
 * 
 * @param message Message à logger
 * @param type Type de log
 * @param data Données supplémentaires
 */
export const logBotDebug = (
    message: string,
    type: 'info' | 'error' | 'success' | 'warning' | 'debug' = 'debug',
    data?: any
): void => {
    const addLog = useDebugStore.getState().addLog;
    addLog(message, type, data);
};

/**
 * Résumé de l'état du bot pour le debugging
 * 
 * @param room La room actuelle
 * @param gameState L'état du jeu
 * @param players Les joueurs
 * @param userId L'ID de l'utilisateur
 * @returns Objet résumé
 */
export const getBotStateSummary = (
    room: Room | null,
    gameState: GameState | null,
    players: Player[] | null,
    userId: string | undefined
): {
    initialization: InitializationStatus;
    isSolo: boolean;
    turnInfo: BotTurnInfo;
    hasDice: boolean;
    hasPendingDouble: boolean;
    canDouble: boolean;
    analysisKey: string;
} => {
    const initialization = checkBotInitialization(room, gameState, players);
    const isSolo = isSoloGame(room, players);
    const turnInfo = checkBotTurn(gameState, players, userId);
    const hasDice = botHasDice(gameState);
    const hasPendingDouble = hasPendingDoubleForBot(gameState);
    const canDouble = canBotConsiderDoubling(gameState);
    const analysisKey = generateAnalysisKey(gameState);

    return {
        initialization,
        isSolo,
        turnInfo,
        hasDice,
        hasPendingDouble,
        canDouble,
        analysisKey
    };
};

/**
 * Type pour les options du bot
 */
export interface BotOptions {
    /** Délai avant de jouer (ms) */
    moveDelay: number;
    /** Délai avant de lancer les dés (ms) */
    rollDelay: number;
    /** Délai avant de répondre au double (ms) */
    doubleDelay: number;
    /** Nombre maximum de tentatives de retry */
    maxRetries: number;
    /** Délai entre les retries (ms) */
    retryDelay: number;
    /** Timeout global pour le bot (ms) */
    globalTimeout: number;
}

/**
 * Options par défaut du bot
 */
export const DEFAULT_BOT_OPTIONS: BotOptions = {
    moveDelay: 800,
    rollDelay: 1000,
    doubleDelay: 1500,
    maxRetries: 10,
    retryDelay: 200,
    globalTimeout: 45000
};

/**
 * Hook personnalisé pour utiliser les fonctions de logique du bot
 * 
 * Note: Ce hook ne gère pas l'état, il fournit uniquement des fonctions utilitaires.
 * L'état est géré dans useGameSocket.ts pour éviter les problèmes de synchronisation.
 */
export const useBotLogic = () => {
    return {
        // Fonctions de vérification
        checkBotInitialization,
        isSoloGame,
        checkBotTurn,
        botHasDice,
        hasPendingDoubleForBot,
        canBotConsiderDoubling,
        
        // Fonctions utilitaires
        generateAnalysisKey,
        logBotDebug,
        getBotStateSummary,
        
        // Options
        DEFAULT_BOT_OPTIONS
    };
};

export default useBotLogic;

