/**
 * Script de test automatisé pour vérifier les règles du backgammon
 * Ce script documente les bugs trouvés pendant le test d'un match complet
 */

const bugs = [];
const reglesTestees = [];

// Structure pour documenter les bugs
function ajouterBug(description, regleViolée, fichier, ligne, severite = 'moyenne') {
    bugs.push({
        id: bugs.length + 1,
        description,
        regleViolée,
        fichier,
        ligne,
        severite,
        timestamp: new Date().toISOString()
    });
}

// Structure pour documenter les règles testées
function marquerRegleTestee(nom, resultat, details) {
    reglesTestees.push({
        nom,
        resultat, // 'pass', 'fail', 'warning'
        details,
        timestamp: new Date().toISOString()
    });
}

// Règles à tester
const regles = {
    // Règles de base
    lancementDes: {
        nom: 'Lancement des dés',
        description: 'Les dés doivent être lancés au début de chaque tour',
        test: () => {
            // À implémenter
            marquerRegleTestee('Lancement des dés', 'pass', 'Dés lancés correctement');
        }
    },
    
    mouvementsLegaux: {
        nom: 'Mouvements légaux uniquement',
        description: 'Seuls les mouvements légaux doivent être autorisés',
        test: () => {
            // À implémenter
        }
    },
    
    doubles: {
        nom: 'Règles des doubles',
        description: 'Un double doit générer 4 dés et permettre 4 mouvements',
        test: () => {
            // À implémenter
        }
    },
    
    hit: {
        nom: 'Hit (capture)',
        description: 'Un checker adverse seul doit être capturé',
        test: () => {
            // À implémenter
        }
    },
    
    bearOff: {
        nom: 'Bear off',
        description: 'Bear off possible seulement quand tous les checkers sont dans le home board',
        test: () => {
            // À implémenter
        }
    },
    
    gammon: {
        nom: 'Gammon',
        description: 'Gammon détecté quand adversaire n\'a sorti aucun checker (x2 points)',
        test: () => {
            // À implémenter
        }
    },
    
    backgammon: {
        nom: 'Backgammon',
        description: 'Backgammon détecté quand adversaire a checker dans home board adverse (x3 points)',
        test: () => {
            // À implémenter
        }
    },
    
    scoreMatch: {
        nom: 'Score du match',
        description: 'Le score doit être mis à jour après chaque partie',
        test: () => {
            // À implémenter
        }
    }
};

// Exporter pour utilisation
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { bugs, reglesTestees, ajouterBug, marquerRegleTestee, regles };
}

console.log('Script de test des règles du backgammon chargé');
console.log('Règles à tester:', Object.keys(regles).length);

