
import { describe, it, expect } from 'vitest';

// Mocking the FIXED logic found in useGameSocket.ts
function getNextTurn(currentTurn: string, user: any, players: any[]) {
    if (players && players.length > 1) {
        return currentTurn === players[0].id ? players[1].id : players[0].id;
    } else {
        // Solo/Bot mode - FIXED LOGIC
        const myId = user?.id || 'guest-1';
        return currentTurn === myId ? 'bot' : myId;
    }
}

describe('Turn Switching Logic (Fixed)', () => {

    it('should switch from Authenticated User to Bot', () => {
        const user = { id: 'user-123' };
        const nextTurn = getNextTurn('user-123', user, []);
        expect(nextTurn).toBe('bot');
    });

    it('should switch from Bot to Authenticated User', () => {
        const user = { id: 'user-123' };
        const nextTurn = getNextTurn('bot', user, []);
        expect(nextTurn).toBe('user-123');
    });

    it('should switch from Guest to Bot', () => {
        const user = null; // Guest
        // Guest ID is usually 'guest-1'
        const nextTurn = getNextTurn('guest-1', user, []);

        // EXPECTATION: Should be 'bot'
        expect(nextTurn).toBe('bot');
    });

    it('should switch from Bot to Guest', () => {
        const user = null; // Guest
        const nextTurn = getNextTurn('bot', user, []);
        expect(nextTurn).toBe('guest-1');
    });

});
