/**
 * Bot Synchronization Utilities
 * 
 * Ce fichier contient des utilitaires pour gérer la synchronisation entre
 * le bot et le store Zustand, en évitant les race conditions.
 */

import { useGameStore } from '../stores/gameStore';
import { useDebugStore } from '../stores/debugStore';

/**
 * Options pour waitForCondition
 */
export interface WaitForConditionOptions {
    /** Nombre maximum de tentatives (défaut: 10) */
    maxRetries?: number;
    /** Délai entre les tentatives en ms (défaut: 200) */
    delayMs?: number;
    /** Callback appelé à chaque retry */
    onRetry?: (attempt: number, maxRetries: number) => void;
    /** Callback appelé si la condition est remplie */
    onSuccess?: () => void;
    /** Callback appelé si timeout */
    onTimeout?: () => void;
    /** Description pour les logs (optionnel) */
    description?: string;
}

/**
 * Attend qu'une condition soit remplie avec retry
 * 
 * @param checkFn Fonction qui retourne true si la condition est remplie
 * @param options Options de configuration
 * @returns Promise<boolean> true si condition remplie, false si timeout
 * 
 * @example
 * ```typescript
 * // Attendre que les dés soient dans le store
 * const diceReady = await waitForCondition(
 *     () => {
 *         const store = useGameStore.getState();
 *         return store.gameState?.dice?.length > 0;
 *     },
 *     {
 *         maxRetries: 10,
 *         delayMs: 200,
 *         description: 'Vérification dés'
 *     }
 * );
 * ```
 */
export const waitForCondition = async (
    checkFn: () => boolean,
    options: WaitForConditionOptions = {}
): Promise<boolean> => {
    const {
        maxRetries = 10,
        delayMs = 200,
        onRetry,
        onSuccess,
        onTimeout,
        description = 'condition'
    } = options;

    const addLog = useDebugStore.getState().addLog;

    // Vérification immédiate (optimisation si déjà true)
    try {
        if (checkFn()) {
            onSuccess?.();
            return true;
        }
    } catch (error) {
        addLog(`⚠️ [waitForCondition] Erreur dans checkFn (${description}): ${error}`, 'warning');
    }

    // Boucle de retry
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        await new Promise(resolve => setTimeout(resolve, delayMs));

        try {
            if (checkFn()) {
                onSuccess?.();
                return true;
            }
        } catch (error) {
            addLog(`⚠️ [waitForCondition] Erreur dans checkFn (${description}), tentative ${attempt}: ${error}`, 'warning');
        }

        onRetry?.(attempt, maxRetries);
    }

    // Timeout
    onTimeout?.();
    return false;
};

/**
 * Attend que les dés soient disponibles dans le store
 * 
 * @param addLog Fonction de logging
 * @returns Promise<boolean> true si dés disponibles, false si timeout
 */
export const waitForDice = async (
    addLog: (message: string, type?: 'info' | 'error' | 'success' | 'warning' | 'debug', data?: any) => void
): Promise<boolean> => {
    return waitForCondition(
        () => {
            const store = useGameStore.getState();
            const dice = store.gameState?.dice;
            return !!(dice && Array.isArray(dice) && dice.length > 0);
        },
        {
            maxRetries: 10,
            delayMs: 200,
            description: 'dés disponibles',
            onRetry: (attempt, max) => {
                const store = useGameStore.getState();
                const dice = store.gameState?.dice;
                addLog(`🤖 Bot: Vérification dés (tentative ${attempt}/${max})`, 'debug', {
                    hasDice: !!dice,
                    diceLength: dice?.length || 0,
                    dice: dice || []
                });
            },
            onSuccess: () => {
                const store = useGameStore.getState();
                const dice = store.gameState?.dice;
                addLog('🤖 Bot: ✅ Dés confirmés dans le store', 'success', {
                    dice: dice || [],
                    diceLength: dice?.length || 0
                });
            },
            onTimeout: () => {
                addLog('🤖 Bot: ⚠️ Dés non mis à jour après rollDice, mais on continue', 'warning');
            }
        }
    );
};

/**
 * Attend que les dés soient consommés (nombre réduit)
 * 
 * @param diceBeforeMove Nombre de dés avant le mouvement
 * @param moveIndex Index du mouvement actuel
 * @param addLog Fonction de logging
 * @returns Promise<{ consumed: boolean, noMoreDice: boolean }> 
 */
export const waitForDiceConsumed = async (
    diceBeforeMove: number,
    moveIndex: number,
    addLog: (message: string, type?: 'info' | 'error' | 'success' | 'warning' | 'debug', data?: any) => void
): Promise<{ consumed: boolean; noMoreDice: boolean }> => {
    let noMoreDice = false;

    const consumed = await waitForCondition(
        () => {
            const store = useGameStore.getState();
            const currentDice = store.gameState?.dice;
            if (!currentDice) return false;
            
            const diceAfter = currentDice.length;
            noMoreDice = diceAfter === 0;
            
            return diceAfter < diceBeforeMove;
        },
        {
            maxRetries: 10,
            delayMs: 200,
            description: `consommation dés (move ${moveIndex + 1})`,
            onRetry: (attempt, max) => {
                const store = useGameStore.getState();
                const currentDice = store.gameState?.dice;
                addLog(`🤖 Bot: Vérification consommation dés (tentative ${attempt}/${max})`, 'debug', {
                    moveIndex,
                    diceBefore: diceBeforeMove,
                    diceAfter: currentDice?.length || 0,
                    diceConsumed: (currentDice?.length || 0) < diceBeforeMove,
                    dice: currentDice || []
                });
            },
            onSuccess: () => {
                const store = useGameStore.getState();
                const currentDice = store.gameState?.dice;
                const diceAfter = currentDice?.length || 0;
                addLog(`🤖 Bot: ✅ Dés consommés confirmés pour move ${moveIndex + 1}`, 'success', {
                    diceBefore: diceBeforeMove,
                    diceAfter: diceAfter,
                    diceRemoved: diceBeforeMove - diceAfter
                });
            },
            onTimeout: () => {
                const store = useGameStore.getState();
                const currentDice = store.gameState?.dice;
                addLog(`🤖 Bot: ⚠️ Dés non consommés après tentatives, mais on continue`, 'warning', {
                    moveIndex,
                    diceBefore: diceBeforeMove,
                    diceAfter: currentDice?.length || 0,
                    dice: currentDice || []
                });
            }
        }
    );

    return { consumed, noMoreDice };
};

/**
 * Attend que le tour change (n'est plus le tour du bot)
 * 
 * @param botId ID du bot
 * @param players Liste des joueurs
 * @param addLog Fonction de logging
 * @returns Promise<boolean> true si le tour a changé, false si timeout
 */
export const waitForTurnSwitch = async (
    botId: string,
    players: any[],
    addLog: (message: string, type?: 'info' | 'error' | 'success' | 'warning' | 'debug', data?: any) => void
): Promise<boolean> => {
    return waitForCondition(
        () => {
            const store = useGameStore.getState();
            const currentTurn = store.gameState?.turn;
            
            // Le tour a changé si ce n'est plus le tour du bot
            const isStillBotTurn = (
                currentTurn === botId ||
                currentTurn === 'bot' ||
                (players && players.length > 1 && players[1] && currentTurn === players[1].id)
            );

            return !isStillBotTurn;
        },
        {
            maxRetries: 10,
            delayMs: 200,
            description: 'changement de tour',
            onRetry: (attempt, max) => {
                const store = useGameStore.getState();
                const currentTurn = store.gameState?.turn;
                const myId = players?.[0]?.id || 'guest';
                addLog(`🤖 Bot: Vérification changement de tour (tentative ${attempt}/${max})`, 'debug', {
                    currentTurn,
                    botId,
                    myId,
                    diceRemaining: store.gameState?.dice?.length || 0,
                    turnShouldBeMyId: currentTurn === myId || currentTurn === 'guest' || currentTurn === 'guest-1' || currentTurn === players?.[0]?.id
                });
            },
            onSuccess: () => {
                const store = useGameStore.getState();
                const currentTurn = store.gameState?.turn;
                addLog('🤖 Bot: ✅ Tour confirmé changé, libération du verrou', 'success', {
                    oldTurn: botId,
                    newTurn: currentTurn
                });
            },
            onTimeout: () => {
                const store = useGameStore.getState();
                const currentTurn = store.gameState?.turn;
                addLog('🤖 Bot: ⚠️ Tour non changé après tous les mouvements, libération du verrou quand même', 'warning', {
                    finalTurn: currentTurn,
                    botId
                });
            }
        }
    );
};

/**
 * Attend que l'initialisation soit complète
 * 
 * @param addLog Fonction de logging
 * @returns Promise<boolean> true si initialisé, false si timeout
 */
export const waitForInitialization = async (
    addLog: (message: string, type?: 'info' | 'error' | 'success' | 'warning' | 'debug', data?: any) => void
): Promise<boolean> => {
    return waitForCondition(
        () => {
            const store = useGameStore.getState();
            const room = store.currentRoom;
            const gameState = store.gameState;
            const players = store.players;

            return !!(
                room &&
                gameState &&
                gameState.board &&
                gameState.board.points &&
                gameState.board.points.length === 24 &&
                players &&
                players.length >= 2
            );
        },
        {
            maxRetries: 20, // Plus de tentatives pour l'initialisation
            delayMs: 250,
            description: 'initialisation complète',
            onRetry: (attempt, max) => {
                const store = useGameStore.getState();
                addLog(`[BOT DEBUG] Waiting for initialization... (${attempt}/${max})`, 'info', {
                    room: !!store.currentRoom,
                    gameState: !!store.gameState,
                    board: !!store.gameState?.board,
                    points: !!store.gameState?.board?.points,
                    pointsCount: store.gameState?.board?.points?.length || 0,
                    players: store.players?.length || 0
                });
            },
            onSuccess: () => {
                const store = useGameStore.getState();
                addLog('[BOT DEBUG] Initialization complete!', 'success', {
                    room: !!store.currentRoom,
                    gameState: !!store.gameState,
                    board: !!store.gameState?.board,
                    pointsCount: store.gameState?.board?.points?.length || 0,
                    players: store.players?.length || 0
                });
            },
            onTimeout: () => {
                const store = useGameStore.getState();
                addLog('[BOT DEBUG] Initialization timeout - proceeding anyway', 'warning', {
                    room: !!store.currentRoom,
                    gameState: !!store.gameState,
                    board: !!store.gameState?.board,
                    pointsCount: store.gameState?.board?.points?.length || 0,
                    players: store.players?.length || 0
                });
            }
        }
    );
};

/**
 * Délai simple avec promesse
 * 
 * @param ms Millisecondes à attendre
 * @returns Promise<void>
 */
export const delay = (ms: number): Promise<void> => {
    return new Promise(resolve => setTimeout(resolve, ms));
};

