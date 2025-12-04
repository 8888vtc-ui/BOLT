import { useCallback } from 'react';
import { useGameStore, GameState } from '../stores/gameStore';
import { canOfferDouble, acceptDouble as acceptDoubleFn, rejectDouble as rejectDoubleFn } from '../lib/gameLogic';
import { supabase } from '../lib/supabase';
import { useDebugStore } from '../stores/debugStore';

// FORCER MODE RÉEL
const DEMO_MODE = false; // FORCÉ EN MODE RÉEL - !import.meta.env.VITE_SUPABASE_URL;

export const useDoublingCube = (currentRoom: any, user: any) => {
    const { gameState, updateGame, addMessage } = useGameStore();
    const addLog = useDebugStore.getState().addLog;

    /**
     * Proposer de doubler le cube
     */
    const offerDouble = useCallback(async () => {
        if (!gameState || !user) return;

        const hasDiceRolled = gameState.dice && gameState.dice.length > 0;

        const canDouble = canOfferDouble(
            gameState.cubeValue,
            gameState.cubeOwner,
            user.id,
            hasDiceRolled,
            gameState.matchLength || 0
        );

        if (!canDouble) {
            addLog('❌ Vous ne pouvez pas doubler maintenant', 'error');
            return;
        }

        const newState: GameState = {
            ...gameState,
            pendingDouble: {
                offeredBy: user.id,
                timestamp: Date.now()
            }
        };

        updateGame(newState);
        addLog(`🎲 Vous proposez de doubler à ${gameState.cubeValue * 2}`, 'info');

        // Message Chat Système
        addMessage({
            id: `sys-${Date.now()}`,
            userId: 'system',
            username: 'System',
            text: `${user.username || 'Joueur'} propose de doubler à ${gameState.cubeValue * 2}`,
            timestamp: Date.now(),
            type: 'system'
        });

        // Sync avec DB si pas en mode demo
        if (!DEMO_MODE && currentRoom && currentRoom.id !== 'offline-bot') {
            await supabase.from('games').update({ board_state: newState }).eq('room_id', currentRoom.id);
        }
    }, [gameState, user, currentRoom, updateGame, addLog, addMessage]);

    /**
     * Accepter une proposition de double
     */
    const acceptDouble = useCallback(async () => {
        if (!gameState || !user || !gameState.pendingDouble) return;

        const { cubeValue, cubeOwner } = acceptDoubleFn(gameState.cubeValue, user.id);

        const newState: GameState = {
            ...gameState,
            cubeValue,
            cubeOwner,
            pendingDouble: null
        };

        updateGame(newState);
        addLog(`✅ Vous acceptez le double. Cube à ${cubeValue}`, 'success');

        // Message Chat Système
        addMessage({
            id: `sys-${Date.now()}`,
            userId: 'system',
            username: 'System',
            text: `${user.username || 'Joueur'} accepte le double. Cube à ${cubeValue}`,
            timestamp: Date.now(),
            type: 'system'
        });

        // Sync avec DB
        if (!DEMO_MODE && currentRoom && currentRoom.id !== 'offline-bot') {
            await supabase.from('games').update({ board_state: newState }).eq('room_id', currentRoom.id);
        }
    }, [gameState, user, currentRoom, updateGame, addLog, addMessage]);

    /**
     * Refuser une proposition de double (Abandon)
     */
    const rejectDouble = useCallback(async () => {
        if (!gameState || !user || !gameState.pendingDouble) return;

        const pointsLost = rejectDoubleFn(gameState.cubeValue);

        // Vérifier que pendingDouble et offeredBy existent avant d'accéder
        if (!gameState.pendingDouble || !gameState.pendingDouble.offeredBy) {
            addLog('❌ Erreur: pendingDouble.offeredBy est null ou undefined', 'error');
            return;
        }

        const opponentId = gameState.pendingDouble.offeredBy;
        addLog(`❌ Vous abandonnez. ${opponentId} gagne ${pointsLost} point(s)`, 'error');

        // Message Chat Système
        addMessage({
            id: `sys-${Date.now()}`,
            userId: 'system',
            username: 'System',
            text: `${user.username || 'Joueur'} refuse le double et abandonne la partie.`,
            timestamp: Date.now(),
            type: 'system'
        });

        // Mettre à jour le score
        const newScore = { ...gameState.score };
        newScore[opponentId] = (newScore[opponentId] || 0) + pointsLost;

        const newState: GameState = {
            ...gameState,
            score: newScore,
            pendingDouble: null,
            // Réinitialiser le plateau pour une nouvelle partie
            dice: [],
            turn: opponentId // Le gagnant commence
        };

        updateGame(newState);

        // Sync avec DB
        if (!DEMO_MODE && currentRoom && currentRoom.id !== 'offline-bot') {
            await supabase.from('games').update({ board_state: newState }).eq('room_id', currentRoom.id);
        }
    }, [gameState, user, currentRoom, updateGame, addLog, addMessage]);

    return {
        offerDouble,
        acceptDouble,
        rejectDouble
    };
};
