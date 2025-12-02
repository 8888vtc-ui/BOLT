/**
 * Script pour exécuter tous les tests du jeu
 * 
 * Usage:
 *   npm run test:game
 *   ou
 *   node -r ts-node/register src/test/runGameTests.ts
 */

import { runAllTests, printTestResults } from './gameTestSuite';

// Exécuter tous les tests
const results = runAllTests();

// Afficher les résultats
printTestResults(results);

// Exporter pour utilisation dans d'autres contextes
export { results };

