/**
 * SUITE DE TESTS COMPLÈTE - GURUGAMMON
 * 
 * Tests toutes les fonctionnalités avant déploiement live
 */

import { INITIAL_BOARD, makeMove, hasWon, checkWinType, PlayerColor, BoardState, getValidMoves, rollDice, canOfferDouble, calculateMatchScore, calculatePoints } from '../lib/gameLogic';
import { useGameStore } from '../stores/gameStore';
import { useAuth } from '../hooks/useAuth';

export interface TestResult {
    category: string;
    test: string;
    passed: boolean;
    error?: string;
    details?: any;
    duration?: number;
}

export interface TestSuite {
    name: string;
    results: TestResult[];
    passed: number;
    failed: number;
    total: number;
    duration: number;
}

/**
 * Tests de la logique de jeu
 */
export function testGameLogic(): TestResult[] {
    const results: TestResult[] = [];
    const startTime = Date.now();

    // Test 1: Initialisation du plateau
    try {
        const board = JSON.parse(JSON.stringify(INITIAL_BOARD));
        const hasPieces = board.points.some(p => p.count > 0);
        results.push({
            category: 'Game Logic',
            test: 'Initialisation du plateau',
            passed: hasPieces,
            error: hasPieces ? undefined : 'Le plateau est vide',
            details: { pointsWithPieces: board.points.filter(p => p.count > 0).length }
        });
    } catch (error: any) {
        results.push({
            category: 'Game Logic',
            test: 'Initialisation du plateau',
            passed: false,
            error: error.message
        });
    }

    // Test 2: Lancer les dés
    try {
        const dice = rollDice();
        const isValid = dice.length >= 1 && dice.length <= 4 && dice.every(d => d >= 1 && d <= 6);
        results.push({
            category: 'Game Logic',
            test: 'Lancer les dés',
            passed: isValid,
            error: isValid ? undefined : 'Dés invalides',
            details: { dice, length: dice.length }
        });
    } catch (error: any) {
        results.push({
            category: 'Game Logic',
            test: 'Lancer les dés',
            passed: false,
            error: error.message
        });
    }

    // Test 3: Mouvement valide
    try {
        const board = JSON.parse(JSON.stringify(INITIAL_BOARD));
        const validMoves = getValidMoves(board, 2, [3, 1]);
        const hasMoves = validMoves.size > 0;
        results.push({
            category: 'Game Logic',
            test: 'Génération des coups valides',
            passed: hasMoves,
            error: hasMoves ? undefined : 'Aucun coup valide trouvé',
            details: { movesCount: validMoves.size }
        });
    } catch (error: any) {
        results.push({
            category: 'Game Logic',
            test: 'Génération des coups valides',
            passed: false,
            error: error.message
        });
    }

    // Test 4: Exécution d'un mouvement
    try {
        const board = JSON.parse(JSON.stringify(INITIAL_BOARD));
        const newBoard = makeMove(board, 2, 23, 20, 3);
        const moved = newBoard.points[20].player === 2 && newBoard.points[20].count > 0;
        results.push({
            category: 'Game Logic',
            test: 'Exécution d\'un mouvement',
            passed: moved,
            error: moved ? undefined : 'Le mouvement n\'a pas été appliqué',
            details: { from: 23, to: 20, die: 3 }
        });
    } catch (error: any) {
        results.push({
            category: 'Game Logic',
            test: 'Exécution d\'un mouvement',
            passed: false,
            error: error.message
        });
    }

    // Test 5: Détection de victoire
    try {
        const board: BoardState = JSON.parse(JSON.stringify(INITIAL_BOARD));
        board.off.player1 = 15;
        const won = hasWon(board, 1);
        results.push({
            category: 'Game Logic',
            test: 'Détection de victoire',
            passed: won,
            error: won ? undefined : 'La victoire n\'a pas été détectée',
            details: { offPlayer1: board.off.player1 }
        });
    } catch (error: any) {
        results.push({
            category: 'Game Logic',
            test: 'Détection de victoire',
            passed: false,
            error: error.message
        });
    }

    // Test 6: Type de victoire
    try {
        const board: BoardState = JSON.parse(JSON.stringify(INITIAL_BOARD));
        board.off.player1 = 15;
        board.off.player2 = 1;
        const winType = checkWinType(board, 1);
        const isValid = ['simple', 'gammon', 'backgammon'].includes(winType);
        results.push({
            category: 'Game Logic',
            test: 'Type de victoire',
            passed: isValid,
            error: isValid ? undefined : `Type de victoire invalide: ${winType}`,
            details: { winType }
        });
    } catch (error: any) {
        results.push({
            category: 'Game Logic',
            test: 'Type de victoire',
            passed: false,
            error: error.message
        });
    }

    // Test 7: Calcul des points
    try {
        const pointsSimple = calculatePoints('simple', 1);
        const pointsGammon = calculatePoints('gammon', 2);
        const pointsBackgammon = calculatePoints('backgammon', 4);
        const allValid = pointsSimple === 1 && pointsGammon === 4 && pointsBackgammon === 12;
        results.push({
            category: 'Game Logic',
            test: 'Calcul des points',
            passed: allValid,
            error: allValid ? undefined : 'Calcul des points incorrect',
            details: { simple: pointsSimple, gammon: pointsGammon, backgammon: pointsBackgammon }
        });
    } catch (error: any) {
        results.push({
            category: 'Game Logic',
            test: 'Calcul des points',
            passed: false,
            error: error.message
        });
    }

    // Test 8: Calcul du score de match
    try {
        const players = [{ id: 'player1' }, { id: 'player2' }];
        const currentScore = { player1: 0, player2: 0 };
        const newScore = calculateMatchScore('simple', 1, 3, currentScore, 'player1', players);
        const isValid = newScore !== null && newScore.player1 === 1;
        results.push({
            category: 'Game Logic',
            test: 'Calcul du score de match',
            passed: isValid,
            error: isValid ? undefined : 'Calcul du score de match incorrect',
            details: { newScore }
        });
    } catch (error: any) {
        results.push({
            category: 'Game Logic',
            test: 'Calcul du score de match',
            passed: false,
            error: error.message
        });
    }

    // Test 9: Doubling cube
    try {
        const canDouble = canOfferDouble(1, null, 'player1', true, 0);
        results.push({
            category: 'Game Logic',
            test: 'Offre de double',
            passed: typeof canDouble === 'boolean',
            error: typeof canDouble === 'boolean' ? undefined : 'Fonction canOfferDouble invalide',
            details: { canDouble }
        });
    } catch (error: any) {
        results.push({
            category: 'Game Logic',
            test: 'Offre de double',
            passed: false,
            error: error.message
        });
    }

    const duration = Date.now() - startTime;
    results.forEach(r => r.duration = duration / results.length);
    return results;
}

/**
 * Tests des stores (Zustand)
 */
export function testStores(): TestResult[] {
    const results: TestResult[] = [];
    const startTime = Date.now();

    // Test 1: Game Store
    try {
        const store = useGameStore.getState();
        const hasState = store !== null && typeof store === 'object';
        results.push({
            category: 'Stores',
            test: 'Game Store initialisé',
            passed: hasState,
            error: hasState ? undefined : 'Game Store non initialisé',
            details: { hasState }
        });
    } catch (error: any) {
        results.push({
            category: 'Stores',
            test: 'Game Store initialisé',
            passed: false,
            error: error.message
        });
    }

    // Test 2: Debug Store
    try {
        const { useDebugStore } = require('../stores/debugStore');
        const debugStore = useDebugStore.getState();
        const hasLogs = Array.isArray(debugStore.logs);
        results.push({
            category: 'Stores',
            test: 'Debug Store initialisé',
            passed: hasLogs,
            error: hasLogs ? undefined : 'Debug Store non initialisé',
            details: { logsCount: debugStore.logs.length }
        });
    } catch (error: any) {
        results.push({
            category: 'Stores',
            test: 'Debug Store initialisé',
            passed: false,
            error: error.message
        });
    }

    const duration = Date.now() - startTime;
    results.forEach(r => r.duration = duration / results.length);
    return results;
}

/**
 * Tests des imports et dépendances
 */
export function testImports(): TestResult[] {
    const results: TestResult[] = [];
    const startTime = Date.now();

    const imports = [
        { name: 'gameLogic', path: '../lib/gameLogic' },
        { name: 'aiService', path: '../lib/aiService' },
        { name: 'supabase', path: '../lib/supabase' },
        { name: 'gameStore', path: '../stores/gameStore' },
        { name: 'debugStore', path: '../stores/debugStore' },
    ];

    for (const imp of imports) {
        try {
            const module = await import(imp.path);
            const hasExports = Object.keys(module).length > 0;
            results.push({
                category: 'Imports',
                test: `Import ${imp.name}`,
                passed: hasExports,
                error: hasExports ? undefined : `Module ${imp.name} vide`,
                details: { exports: Object.keys(module).length }
            });
        } catch (error: any) {
            results.push({
                category: 'Imports',
                test: `Import ${imp.name}`,
                passed: false,
                error: error.message
            });
        }
    }

    const duration = Date.now() - startTime;
    results.forEach(r => r.duration = duration / results.length);
    return results;
}

/**
 * Tests de performance
 */
export function testPerformance(): TestResult[] {
    const results: TestResult[] = [];
    const startTime = Date.now();

    // Test 1: Génération des coups (performance)
    try {
        const board = JSON.parse(JSON.stringify(INITIAL_BOARD));
        const perfStart = Date.now();
        for (let i = 0; i < 100; i++) {
            getValidMoves(board, 2, [3, 1]);
        }
        const perfEnd = Date.now();
        const duration = perfEnd - perfStart;
        const isFast = duration < 1000; // Moins d'1 seconde pour 100 appels
        results.push({
            category: 'Performance',
            test: 'Génération des coups (100x)',
            passed: isFast,
            error: isFast ? undefined : `Trop lent: ${duration}ms`,
            details: { duration, calls: 100 }
        });
    } catch (error: any) {
        results.push({
            category: 'Performance',
            test: 'Génération des coups (100x)',
            passed: false,
            error: error.message
        });
    }

    const duration = Date.now() - startTime;
    results.forEach(r => r.duration = duration / results.length);
    return results;
}

/**
 * Exécute tous les tests
 */
export async function runAllTests(): Promise<TestSuite> {
    const startTime = Date.now();
    const allResults: TestResult[] = [];

    console.log('🧪 Démarrage de la suite de tests complète...\n');

    // Tests de logique de jeu
    console.log('📋 Tests de logique de jeu...');
    allResults.push(...testGameLogic());

    // Tests des stores
    console.log('📋 Tests des stores...');
    allResults.push(...testStores());

    // Tests des imports
    console.log('📋 Tests des imports...');
    allResults.push(...await testImports());

    // Tests de performance
    console.log('📋 Tests de performance...');
    allResults.push(...testPerformance());

    const duration = Date.now() - startTime;
    const passed = allResults.filter(r => r.passed).length;
    const failed = allResults.filter(r => !r.passed).length;
    const total = allResults.length;

    return {
        name: 'Suite de Tests Complète',
        results: allResults,
        passed,
        failed,
        total,
        duration
    };
}

/**
 * Affiche les résultats
 */
export function printTestResults(suite: TestSuite): void {
    console.log('\n╔═══════════════════════════════════════════════════════════╗');
    console.log('║   RAPPORT DE TESTS COMPLET                               ║');
    console.log('╚═══════════════════════════════════════════════════════════╝\n');

    // Grouper par catégorie
    const categories = new Map<string, TestResult[]>();
    suite.results.forEach(result => {
        if (!categories.has(result.category)) {
            categories.set(result.category, []);
        }
        categories.get(result.category)!.push(result);
    });

    categories.forEach((results, category) => {
        console.log(`📁 ${category}`);
        const passed = results.filter(r => r.passed).length;
        const failed = results.filter(r => !r.passed).length;
        console.log(`   ✅ ${passed} | ❌ ${failed} | Total: ${results.length}`);

        results.forEach(result => {
            const icon = result.passed ? '✅' : '❌';
            console.log(`   ${icon} ${result.test}`);
            if (!result.passed && result.error) {
                console.log(`      Erreur: ${result.error}`);
            }
        });
        console.log('');
    });

    console.log('╔═══════════════════════════════════════════════════════════╗');
    console.log('║   RÉSULTATS GLOBAUX                                       ║');
    console.log('╚═══════════════════════════════════════════════════════════╝');
    console.log(`📊 Total de tests: ${suite.total}`);
    console.log(`✅ Réussis: ${suite.passed} (${((suite.passed / suite.total) * 100).toFixed(1)}%)`);
    console.log(`❌ Échoués: ${suite.failed}`);
    console.log(`⏱️  Durée totale: ${(suite.duration / 1000).toFixed(2)}s`);
    console.log('');

    if (suite.failed === 0) {
        console.log('🎉 PARFAIT ! TOUS LES TESTS SONT PASSÉS !');
    } else if (suite.passed / suite.total >= 0.9) {
        console.log('✅ EXCELLENT ! Plus de 90% de réussite.');
    } else if (suite.passed / suite.total >= 0.75) {
        console.log('👍 BON ! Plus de 75% de réussite.');
    } else {
        console.log('⚠️  Des améliorations sont nécessaires.');
    }
    console.log('');
}




