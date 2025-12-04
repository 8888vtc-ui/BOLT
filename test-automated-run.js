// Système de test automatisé - 500 tests
// Ce script sera utilisé par l'IA pour orchestrer les tests

const MAX_TESTS = 500;
const TEST_INTERVAL = 3000; // 3 secondes entre chaque test
const INIT_WAIT = 20000; // 20 secondes pour l'initialisation
const REQUIRED_SUCCESS = 20; // 20 tests réussis consécutifs

console.log(`🚀 Système de test automatisé - ${MAX_TESTS} tests`);
console.log(`⏱️  Intervalle: ${TEST_INTERVAL / 1000}s`);
console.log(`✅ Tests réussis consécutifs requis: ${REQUIRED_SUCCESS}`);

module.exports = { MAX_TESTS, TEST_INTERVAL, INIT_WAIT, REQUIRED_SUCCESS };

