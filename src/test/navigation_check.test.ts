
import { describe, it, expect } from 'vitest';
import { MAIN_MENU, USER_MENU } from '../config/menu';

// List of all expected routes in the application
const EXPECTED_ROUTES = [
    '/lobby',
    '/dashboard',
    '/tournaments',
    '/leaderboard',
    '/analyses',
    '/profile',
    '/settings',
    '/support'
];

describe('Application Navigation Integrity', () => {

    it('should have valid routes for all MAIN_MENU items', () => {
        MAIN_MENU.forEach(item => {
            if (item.route) {
                expect(EXPECTED_ROUTES).toContain(item.route);
                console.log(`✅ Main Menu: ${item.label} -> ${item.route} is valid.`);
            }
        });
    });

    it('should have valid routes for all USER_MENU items', () => {
        USER_MENU.forEach(item => {
            if (item.route) {
                expect(EXPECTED_ROUTES).toContain(item.route);
                console.log(`✅ User Menu: ${item.label} -> ${item.route} is valid.`);
            }
        });
    });

    it('should ensure JOUER is the first item in MAIN_MENU', () => {
        expect(MAIN_MENU[0].label).toBe('JOUER');
        expect(MAIN_MENU[0].route).toBe('/lobby');
    });

    it('should ensure Mon Espace is the second item in MAIN_MENU', () => {
        expect(MAIN_MENU[1].label).toBe('Mon Espace');
        expect(MAIN_MENU[1].route).toBe('/dashboard');
    });

});
