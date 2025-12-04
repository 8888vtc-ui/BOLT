/**
 * Test du niveau et des capacités du bot
 */

import { INITIAL_BOARD, BoardState, PlayerColor, hasWon, checkWinType, getValidMoves } from '../lib/gameLogic';
import { shouldBotDouble, shouldBotAcceptDouble } from '../lib/botDoublingLogic';

export interface BotLevelTest {
    test: string;
    passed: boolean;
    details: any;
    level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
}

/**
 * Teste les capacités du bot
 */
export function testBotLevel(): BotLevelTest[] {
    const results: BotLevelTest[] = [];

    // Test 1: Connaissance des ouvertures
    try {
        const board = JSON.parse(JSON.stringify(INITIAL_BOARD));
        const validMoves = getValidMoves(board, 2, [3, 1]);
        const knowsOpenings = validMoves.size > 0;
        results.push({
            test: 'Connaissance des ouvertures',
            passed: knowsOpenings,
            details: { movesFound: validMoves.size },
            level: knowsOpenings ? 'intermediate' : 'beginner'
        });
    } catch (error: any) {
        results.push({
            test: 'Connaissance des ouvertures',
            passed: false,
            details: { error: error.message },
            level: 'beginner'
        });
    }

    // Test 2: Gestion des doubles
    try {
        const board = JSON.parse(JSON.stringify(INITIAL_BOARD));
        const validMoves = getValidMoves(board, 2, [3, 3, 3, 3]);
        const handlesDoubles = validMoves.size > 0;
        results.push({
            test: 'Gestion des doubles',
            passed: handlesDoubles,
            details: { movesFound: validMoves.size },
            level: handlesDoubles ? 'intermediate' : 'beginner'
        });
    } catch (error: any) {
        results.push({
            test: 'Gestion des doubles',
            passed: false,
            details: { error: error.message },
            level: 'beginner'
        });
    }

    // Test 3: Logique de doubling cube
    try {
        // Test double avec bonne position
        const shouldDouble1 = shouldBotDouble(0.70, 0.15, 1, undefined, 0);
        // Test acceptation avec position acceptable
        const shouldAccept1 = shouldBotAcceptDouble(0.30, 0.05, 2, undefined, 0);
        // Test refus avec mauvaise position
        const shouldAccept2 = shouldBotAcceptDouble(0.15, -0.10, 4, undefined, 0);

        const hasGoodCubeLogic = shouldDouble1 && shouldAccept1 && !shouldAccept2;
        results.push({
            test: 'Logique de doubling cube',
            passed: hasGoodCubeLogic,
            details: {
                doubleAt70: shouldDouble1,
                acceptAt30: shouldAccept1,
                refuseAt15: !shouldAccept2
            },
            level: hasGoodCubeLogic ? 'advanced' : 'intermediate'
        });
    } catch (error: any) {
        results.push({
            test: 'Logique de doubling cube',
            passed: false,
            details: { error: error.message },
            level: 'beginner'
        });
    }

    // Test 4: Détection de victoire
    try {
        const board: BoardState = JSON.parse(JSON.stringify(INITIAL_BOARD));
        board.off.player1 = 15;
        const detectsWin = hasWon(board, 1);
        results.push({
            test: 'Détection de victoire',
            passed: detectsWin,
            details: { detectsWin },
            level: detectsWin ? 'intermediate' : 'beginner'
        });
    } catch (error: any) {
        results.push({
            test: 'Détection de victoire',
            passed: false,
            details: { error: error.message },
            level: 'beginner'
        });
    }

    // Test 5: Types de victoire
    try {
        const board: BoardState = JSON.parse(JSON.stringify(INITIAL_BOARD));
        board.off.player1 = 15;
        board.off.player2 = 1;
        const winType = checkWinType(board, 1);
        const knowsWinTypes = ['simple', 'gammon', 'backgammon'].includes(winType);
        results.push({
            test: 'Connaissance des types de victoire',
            passed: knowsWinTypes,
            details: { winType },
            level: knowsWinTypes ? 'intermediate' : 'beginner'
        });
    } catch (error: any) {
        results.push({
            test: 'Connaissance des types de victoire',
            passed: false,
            details: { error: error.message },
            level: 'beginner'
        });
    }

    return results;
}

/**
 * Évalue le niveau global du bot
 */
export function evaluateBotLevel(tests: BotLevelTest[]): {
    level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    score: number;
    details: any;
} {
    const levels = { beginner: 1, intermediate: 2, advanced: 3, expert: 4 };
    const passedTests = tests.filter(t => t.passed);
    const avgLevel = passedTests.reduce((sum, t) => sum + levels[t.level], 0) / passedTests.length;
    
    let finalLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    if (avgLevel >= 3.5) finalLevel = 'expert';
    else if (avgLevel >= 2.5) finalLevel = 'advanced';
    else if (avgLevel >= 1.5) finalLevel = 'intermediate';
    else finalLevel = 'beginner';

    const score = (passedTests.length / tests.length) * 100;

    return {
        level: finalLevel,
        score,
        details: {
            testsPassed: passedTests.length,
            testsTotal: tests.length,
            averageLevel: avgLevel
        }
    };
}

/**
 * Affiche les résultats
 */
export function printBotLevelResults(tests: BotLevelTest[], evaluation: ReturnType<typeof evaluateBotLevel>): void {
    console.log('\n╔═══════════════════════════════════════════════════════════╗');
    console.log('║   ÉVALUATION DU NIVEAU DU BOT                            ║');
    console.log('╚═══════════════════════════════════════════════════════════╝\n');

    tests.forEach(test => {
        const icon = test.passed ? '✅' : '❌';
        console.log(`${icon} ${test.test} [${test.level}]`);
        if (test.details) {
            console.log(`   ${JSON.stringify(test.details)}`);
        }
    });

    console.log('\n╔═══════════════════════════════════════════════════════════╗');
    console.log('║   RÉSULTAT FINAL                                           ║');
    console.log('╚═══════════════════════════════════════════════════════════╝');
    console.log(`📊 Niveau estimé : ${evaluation.level.toUpperCase()}`);
    console.log(`📈 Score : ${evaluation.score.toFixed(1)}%`);
    console.log(`✅ Tests réussis : ${evaluation.details.testsPassed}/${evaluation.details.testsTotal}`);
    console.log('');
}




