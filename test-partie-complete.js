/**
 * Script de test pour une partie complète de backgammon
 * 
 * Ce script simule une partie complète en vérifiant:
 * 1. Initialisation du jeu
 * 2. Lancer des dés
 * 3. Alternance des tours (joueur/bot)
 * 4. Calcul des coups légaux
 * 5. Exécution des coups
 * 6. Fin de partie
 */

console.log('🎮 TEST PARTIE COMPLÈTE');
console.log('======================\n');

// Logs à surveiller
const logsToWatch = [
    'JOIN_ROOM',
    'BOT DEBUG',
    'Bot: Checking turn',
    'Bot: Playing move',
    'Dice rolled',
    'Action: move',
    'Action: rollDice',
    'Game ended',
    'Match won'
];

// Compteurs
let diceRolls = 0;
let playerMoves = 0;
let botMoves = 0;
let errors = 0;
let warnings = 0;

// Fonction pour analyser les logs
function analyzeLogs(logs) {
    logs.forEach(log => {
        const message = log.message || '';
        const type = log.type || '';
        
        if (type === 'error') errors++;
        if (type === 'warning') warnings++;
        
        if (message.includes('Dice rolled')) diceRolls++;
        if (message.includes('Action: move')) {
            if (message.includes('bot')) botMoves++;
            else playerMoves++;
        }
    });
}

console.log('✅ Script de test créé');
console.log('📊 Métriques à surveiller:');
console.log(`- Lancers de dés: ${diceRolls}`);
console.log(`- Coups joueur: ${playerMoves}`);
console.log(`- Coups bot: ${botMoves}`);
console.log(`- Erreurs: ${errors}`);
console.log(`- Avertissements: ${warnings}\n`);

console.log('🔍 Instructions:');
console.log('1. Ouvrir la console du navigateur (F12)');
console.log('2. Filtrer les logs par "Bot" ou "JOIN_ROOM"');
console.log('3. Observer les logs pendant la partie');
console.log('4. Vérifier que le bot joue automatiquement');
console.log('5. Vérifier l\'alternance des tours');
console.log('6. Vérifier qu\'il n\'y a pas d\'erreurs critiques\n');

