/**
 * Validation des Modes de Jeu (Money et Match)
 * 
 * Vérifie que les deux modes fonctionnent correctement :
 * - Money Game : Calcul des points, fin de partie
 * - Match Game : Calcul du score, détection fin de match
 */

import { calculateMatchScore, calculatePoints, checkWinType, hasWon, PlayerColor, BoardState, INITIAL_BOARD } from '../lib/gameLogic';

export interface ValidationResult {
    test: string;
    passed: boolean;
    error?: string;
    details?: any;
}

/**
 * Test du calcul des points
 */
export function testPointCalculation(): ValidationResult[] {
    const results: ValidationResult[] = [];

    // Test Simple Victory
    try {
        const points = calculatePoints('simple', 1);
        results.push({
            test: 'Points Simple Victory (cube=1)',
            passed: points === 1,
            error: points === 1 ? undefined : `Attendu 1, obtenu ${points}`
        });
    } catch (error: any) {
        results.push({
            test: 'Points Simple Victory (cube=1)',
            passed: false,
            error: error.message
        });
    }

    // Test Gammon
    try {
        const points = calculatePoints('gammon', 2);
        results.push({
            test: 'Points Gammon (cube=2)',
            passed: points === 4,
            error: points === 4 ? undefined : `Attendu 4, obtenu ${points}`
        });
    } catch (error: any) {
        results.push({
            test: 'Points Gammon (cube=2)',
            passed: false,
            error: error.message
        });
    }

    // Test Backgammon
    try {
        const points = calculatePoints('backgammon', 4);
        results.push({
            test: 'Points Backgammon (cube=4)',
            passed: points === 12,
            error: points === 12 ? undefined : `Attendu 12, obtenu ${points}`
        });
    } catch (error: any) {
        results.push({
            test: 'Points Backgammon (cube=4)',
            passed: false,
            error: error.message
        });
    }

    return results;
}

/**
 * Test du calcul du score de match
 */
export function testMatchScoreCalculation(): ValidationResult[] {
    const results: ValidationResult[] = [];

    // Test Match 3 points - Simple Victory
    try {
        const players = [
            { id: 'player1' },
            { id: 'player2' }
        ];
        const currentScore = { player1: 0, player2: 0 };
        
        const newScore = calculateMatchScore(
            'simple',
            1,
            3,
            currentScore,
            'player1',
            players
        );

        const passed = newScore !== null && newScore.player1 === 1 && newScore.player2 === 0;
        results.push({
            test: 'Match 3 points - Simple Victory',
            passed,
            error: passed ? undefined : `Score incorrect: ${JSON.stringify(newScore)}`,
            details: { newScore }
        });
    } catch (error: any) {
        results.push({
            test: 'Match 3 points - Simple Victory',
            passed: false,
            error: error.message
        });
    }

    // Test Match 5 points - Gammon avec cube
    try {
        const players = [
            { id: 'player1' },
            { id: 'player2' }
        ];
        const currentScore = { player1: 2, player2: 1 };
        
        const newScore = calculateMatchScore(
            'gammon',
            2,
            5,
            currentScore,
            'player1',
            players
        );

        // Gammon avec cube=2 = 4 points
        const passed = newScore !== null && newScore.player1 === 6 && newScore.player2 === 1;
        results.push({
            test: 'Match 5 points - Gammon avec cube=2',
            passed,
            error: passed ? undefined : `Score incorrect: ${JSON.stringify(newScore)}`,
            details: { newScore, expected: { player1: 6, player2: 1 } }
        });
    } catch (error: any) {
        results.push({
            test: 'Match 5 points - Gammon avec cube=2',
            passed: false,
            error: error.message
        });
    }

    // Test Fin de Match
    try {
        const players = [
            { id: 'player1' },
            { id: 'player2' }
        ];
        const currentScore = { player1: 4, player2: 0 };
        
        const newScore = calculateMatchScore(
            'simple',
            1,
            5,
            currentScore,
            'player1',
            players
        );

        // player1 devrait avoir 5 points (gagne le match)
        const passed = newScore !== null && newScore.player1 >= 5;
        results.push({
            test: 'Fin de Match - Détection',
            passed,
            error: passed ? undefined : `Match devrait être terminé: ${JSON.stringify(newScore)}`,
            details: { newScore, matchComplete: newScore?.player1 >= 5 }
        });
    } catch (error: any) {
        results.push({
            test: 'Fin de Match - Détection',
            passed: false,
            error: error.message
        });
    }

    // Test Money Game (devrait retourner null)
    try {
        const players = [
            { id: 'player1' },
            { id: 'player2' }
        ];
        const currentScore = { player1: 0, player2: 0 };
        
        const newScore = calculateMatchScore(
            'simple',
            1,
            0, // Money game
            currentScore,
            'player1',
            players
        );

        const passed = newScore === null;
        results.push({
            test: 'Money Game - Pas de calcul de match',
            passed,
            error: passed ? undefined : `Money game devrait retourner null, obtenu: ${JSON.stringify(newScore)}`
        });
    } catch (error: any) {
        results.push({
            test: 'Money Game - Pas de calcul de match',
            passed: false,
            error: error.message
        });
    }

    return results;
}

/**
 * Test de détection de fin de partie
 */
export function testGameEndDetection(): ValidationResult[] {
    const results: ValidationResult[] = [];

    // Test Victoire Simple
    try {
        const board: BoardState = JSON.parse(JSON.stringify(INITIAL_BOARD));
        board.off.player1 = 15;
        board.off.player2 = 1; // L'adversaire a sorti au moins un pion

        const player1Won = hasWon(board, 1);
        const player2Won = hasWon(board, 2);
        const winType = checkWinType(board, 1);

        const passed = player1Won && !player2Won && winType === 'simple';
        results.push({
            test: 'Détection Victoire Simple',
            passed,
            error: passed ? undefined : `player1Won: ${player1Won}, winType: ${winType}`,
            details: { player1Won, player2Won, winType }
        });
    } catch (error: any) {
        results.push({
            test: 'Détection Victoire Simple',
            passed: false,
            error: error.message
        });
    }

    return results;
}

/**
 * Exécute tous les tests de validation
 */
export function runValidationTests(): {
    results: ValidationResult[];
    passed: number;
    failed: number;
    total: number;
    successRate: number;
} {
    const allResults: ValidationResult[] = [];

    // Tests de calcul des points
    allResults.push(...testPointCalculation());

    // Tests de calcul du score de match
    allResults.push(...testMatchScoreCalculation());

    // Tests de détection de fin de partie
    allResults.push(...testGameEndDetection());

    const passed = allResults.filter(r => r.passed).length;
    const failed = allResults.filter(r => !r.passed).length;
    const total = allResults.length;
    const successRate = total > 0 ? (passed / total) * 100 : 0;

    return {
        results: allResults,
        passed,
        failed,
        total,
        successRate
    };
}

/**
 * Affiche les résultats de validation
 */
export function printValidationResults(results: ReturnType<typeof runValidationTests>): void {
    console.log('\n╔═══════════════════════════════════════════════════════════╗');
    console.log('║   VALIDATION DES MODES DE JEU                           ║');
    console.log('╚═══════════════════════════════════════════════════════════╝\n');

    results.results.forEach(result => {
        const icon = result.passed ? '✅' : '❌';
        console.log(`${icon} ${result.test}`);
        if (!result.passed && result.error) {
            console.log(`   Erreur: ${result.error}`);
        }
        if (result.details) {
            console.log(`   Détails: ${JSON.stringify(result.details)}`);
        }
    });

    console.log('\n╔═══════════════════════════════════════════════════════════╗');
    console.log('║   RÉSULTATS                                               ║');
    console.log('╚═══════════════════════════════════════════════════════════╝');
    console.log(`📊 Total: ${results.total}`);
    console.log(`✅ Réussis: ${results.passed} (${results.successRate.toFixed(1)}%)`);
    console.log(`❌ Échoués: ${results.failed}`);
    console.log('');

    if (results.successRate === 100) {
        console.log('🎉 PARFAIT ! Tous les modes fonctionnent correctement !');
    } else if (results.successRate >= 90) {
        console.log('✅ EXCELLENT ! Les modes fonctionnent presque parfaitement.');
    } else {
        console.log('⚠️  Des corrections sont nécessaires.');
    }
    console.log('');
}




