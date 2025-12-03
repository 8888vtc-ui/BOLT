/**
 * Test Runner pour les tests du jeu Backgammon
 * Exécute tous les tests et affiche les résultats
 */

const { runAllTests, printTestResults } = require('./gameTestSuite.ts');

console.log('🧪 Démarrage des tests du jeu Backgammon...\n');

try {
    const results = runAllTests();
    printTestResults(results);
    
    // Exit avec code d'erreur si des tests ont échoué
    process.exit(results.totalFailed > 0 ? 1 : 0);
} catch (error) {
    console.error('❌ Erreur lors de l\'exécution des tests:', error);
    process.exit(1);
}



