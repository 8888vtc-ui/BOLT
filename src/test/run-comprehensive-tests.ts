#!/usr/bin/env node

/**
 * Script pour exécuter tous les tests complets
 */

import { runAllTests, printTestResults } from './comprehensive-test-suite';

async function main() {
    try {
        const results = await runAllTests();
        printTestResults(results);

        // Exit avec code d'erreur si des tests ont échoué
        process.exit(results.failed > 0 ? 1 : 0);
    } catch (error) {
        console.error('❌ Erreur lors de l\'exécution des tests:', error);
        process.exit(1);
    }
}

main();

