// Script de test automatisé pour capturer les bugs de déplacement
// Ce script sera utilisé pour documenter les bugs trouvés

const bugsFound = [];
let testCycle = 0;
let moveCount = 0;

function logBug(severity, description, details) {
    bugsFound.push({
        cycle: testCycle,
        move: moveCount,
        severity,
        description,
        details,
        timestamp: new Date().toISOString()
    });
}

// Structure pour documenter les bugs
const bugReport = {
    testStart: new Date().toISOString(),
    cycles: [],
    bugs: [],
    errors: [],
    warnings: []
};

console.log('=== TEST DE DÉPLACEMENTS JUSQU\'AU BLOCAGE ===');
console.log('Ce script documente les bugs trouvés pendant les tests manuels');


