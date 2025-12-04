// Script de test automatisé - À exécuter manuellement via l'IA
// Ce script documente la procédure de test en boucle

const TEST_CONFIG = {
    maxTests: 1000,
    testDelay: 3000, // 3 secondes entre chaque test
    gameUrl: 'http://localhost:5173/game/offline-bot?mode=match&length=5',
    waitForInit: 10000, // 10 secondes pour l'initialisation
    waitForBot: 5000 // 5 secondes pour que le bot joue
};

// Procédure de test :
// 1. Naviguer vers gameUrl
// 2. Attendre waitForInit ms
// 3. Capturer tous les logs de la console
// 4. Vérifier les erreurs (null.id, bot ne joue pas, etc.)
// 5. Documenter les erreurs
// 6. Corriger les erreurs
// 7. Répéter jusqu'à ce qu'il n'y ait plus d'erreurs

module.exports = TEST_CONFIG;

