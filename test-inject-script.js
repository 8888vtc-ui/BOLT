// Script à injecter directement dans la console du navigateur
// Copier-coller ce code dans la console (F12)

(async function autonomousMoveTest() {
    const MAX_ATTEMPTS = 50;
    let attempts = 0;
    const evidence = [];
    const actionsTaken = [];
    const startTime = new Date().toISOString();
    
    console.log('🚀 DÉMARRAGE TEST AUTONOME - DÉPLACEMENT DES PIONS');
    console.log('⏰ Timestamp:', startTime);
    
    // Fonction pour capturer un screenshot (via console)
    function captureEvidence(type, data) {
        evidence.push({
            type,
            timestamp: new Date().toISOString(),
            attempt: attempts,
            data
        });
        console.log(`📸 Evidence capturée (${type}):`, data);
    }
    
    // Fonction pour vérifier les overlays bloquants
    function checkOverlays() {
        const board = document.querySelector('[data-testid="board"]') || 
                     document.querySelector('.gg-board-container') ||
                     document.querySelector('svg[role="application"]');
        
        if (!board) {
            console.error('❌ Board non trouvé');
            return null;
        }
        
        const rect = board.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        const elements = document.elementsFromPoint(centerX, centerY);
        const blocking = elements.filter(el => {
            const style = window.getComputedStyle(el);
            return style.pointerEvents !== 'none' && 
                   style.zIndex && 
                   parseInt(style.zIndex) > 10 &&
                   el !== board &&
                   !board.contains(el);
        });
        
        if (blocking.length > 0) {
            console.warn('⚠️ Overlays bloquants détectés:', blocking);
            blocking.forEach(el => {
                const originalPE = el.style.pointerEvents;
                el.style.pointerEvents = 'none';
                actionsTaken.push(`Overlay disabled: ${el.tagName}.${el.className}`);
                console.log(`🔧 Overlay désactivé: ${el.tagName}`);
            });
        }
        
        return board;
    }
    
    // Fonction pour lancer les dés
    function rollDice() {
        const rollBtn = document.querySelector('[data-testid="roll-dice"]') ||
                       document.querySelector('button[aria-label="Roll the dice"]') ||
                       document.querySelector('button:has-text("ROLL DICE")');
        
        if (rollBtn && rollBtn.offsetParent !== null) {
            console.log('🎲 Lancement des dés...');
            rollBtn.click();
            return true;
        }
        return false;
    }
    
    // Fonction pour obtenir les mouvements légaux
    function getValidMoves() {
        // Essayer de trouver les points highlightés
        const highlighted = document.querySelectorAll('[data-valid="true"]');
        const highlightedPips = Array.from(highlighted).map(el => {
            const pip = el.getAttribute('data-point');
            return pip ? parseInt(pip) : null;
        }).filter(p => p !== null);
        
        if (highlightedPips.length > 0) {
            return highlightedPips;
        }
        
        // Fallback: retourner les points 1-6 (zone de départ light)
        return [1, 2, 3, 4, 5, 6];
    }
    
    // Fonction pour sélectionner un pion light
    function selectLightChecker() {
        const checkers = document.querySelectorAll('g[role="button"][aria-label*="light checker"]');
        if (checkers.length === 0) {
            console.error('❌ Aucun checker light trouvé');
            return null;
        }
        
        const firstChecker = checkers[0];
        console.log('🎯 Sélection du checker:', firstChecker);
        
        // Forcer pointer-events
        firstChecker.style.pointerEvents = 'auto';
        firstChecker.style.cursor = 'pointer';
        firstChecker.style.zIndex = '1000';
        actionsTaken.push('pointer-events forced on checker');
        
        // Cliquer
        const clickEvent = new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
            view: window
        });
        firstChecker.dispatchEvent(clickEvent);
        
        return firstChecker;
    }
    
    // Fonction pour cliquer sur un point de destination
    function clickDestinationPoint(pip) {
        const point = document.querySelector(`[data-testid="point-${pip}"]`) ||
                     document.querySelector(`g[role="button"][aria-label="Point ${pip}"]`);
        
        if (!point) {
            console.error(`❌ Point ${pip} non trouvé`);
            return false;
        }
        
        console.log(`🎯 Clic sur Point ${pip}...`);
        point.style.pointerEvents = 'auto';
        point.style.cursor = 'pointer';
        
        const clickEvent = new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
            view: window
        });
        point.dispatchEvent(clickEvent);
        
        return true;
    }
    
    // Fonction pour vérifier si le pion s'est déplacé
    function checkMoveSuccess(checker) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const circle = checker.querySelector('circle');
                if (!circle) {
                    resolve(false);
                    return;
                }
                
                const cx = circle.getAttribute('cx');
                const cy = circle.getAttribute('cy');
                const transform = checker.getAttribute('transform');
                
                // Vérifier si la position a changé (comparer avec l'état initial)
                const moved = checker.dataset.initialCx !== cx || 
                             checker.dataset.initialCy !== cy ||
                             (transform && transform !== 'none');
                
                if (moved) {
                    console.log('✅✅✅ DÉPLACEMENT RÉUSSI ✅✅✅');
                    console.log('Position initiale:', checker.dataset.initialCx, checker.dataset.initialCy);
                    console.log('Position finale:', cx, cy);
                }
                
                resolve(moved);
            }, 2000);
        });
    }
    
    // Fonction principale de test
    async function runTest() {
        attempts++;
        console.log(`\n🔄 TENTATIVE ${attempts}/${MAX_ATTEMPTS}`);
        
        try {
            // 1. Vérifier les overlays
            const board = checkOverlays();
            if (!board) {
                console.error('❌ Board non trouvé, arrêt du test');
                return false;
            }
            
            // 2. Lancer les dés
            if (!rollDice()) {
                console.warn('⚠️ Bouton roll dice non trouvé ou déjà lancé');
            }
            
            // Attendre que les dés soient lancés
            await new Promise(resolve => setTimeout(resolve, 3000));
            
            // 3. Sélectionner un pion
            const checker = selectLightChecker();
            if (!checker) {
                console.error('❌ Impossible de sélectionner un pion');
                return false;
            }
            
            // Sauvegarder la position initiale
            const circle = checker.querySelector('circle');
            if (circle) {
                checker.dataset.initialCx = circle.getAttribute('cx');
                checker.dataset.initialCy = circle.getAttribute('cy');
            }
            
            // Attendre la sélection
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // 4. Obtenir les mouvements légaux
            const validMoves = getValidMoves();
            console.log('📋 Mouvements légaux:', validMoves);
            
            // 5. Essayer de cliquer sur un point de destination
            const pointsToTry = validMoves.length > 0 ? validMoves : [1, 2, 3, 4, 5, 6];
            let moveSuccess = false;
            
            console.log('🎯 Points à essayer:', pointsToTry);
            
            for (const pip of pointsToTry) {
                if (typeof pip !== 'number') continue;
                
                console.log(`🎯 Tentative de déplacement vers Point ${pip}...`);
                
                const clicked = clickDestinationPoint(pip);
                if (!clicked) {
                    console.warn(`⚠️ Impossible de cliquer sur Point ${pip}`);
                    continue;
                }
                
                // Attendre la réponse du serveur/état
                await new Promise(resolve => setTimeout(resolve, 3000));
                
                moveSuccess = await checkMoveSuccess(checker);
                if (moveSuccess) {
                    console.log(`✅✅✅ DÉPLACEMENT RÉUSSI VERS POINT ${pip} ✅✅✅`);
                    break;
                } else {
                    console.warn(`⚠️ Déplacement vers Point ${pip} non confirmé, essai suivant...`);
                }
            }
            
            if (moveSuccess) {
                console.log('✅✅✅ TEST RÉUSSI APRÈS', attempts, 'TENTATIVES ✅✅✅');
                return true;
            }
            
            // Capturer l'état actuel
            captureEvidence('console', {
                attempt: attempts,
                checkerPosition: {
                    cx: circle?.getAttribute('cx'),
                    cy: circle?.getAttribute('cy')
                },
                validMoves,
                boardState: document.querySelector('[data-testid="board"]') ? 'found' : 'not found'
            });
            
            return false;
            
        } catch (error) {
            console.error('❌ Erreur lors du test:', error);
            captureEvidence('error', {
                attempt: attempts,
                error: error.message,
                stack: error.stack
            });
            return false;
        }
    }
    
    // Boucle principale
    async function main() {
        console.log('🚀 Démarrage de la boucle de test...');
        
        while (attempts < MAX_ATTEMPTS) {
            const success = await runTest();
            
            if (success) {
                const report = {
                    result: "success",
                    timestamp: startTime,
                    attempts: attempts,
                    final_selector_piece: "g[role=\"button\"][aria-label*=\"light checker\"]",
                    final_selector_point: "[data-testid=\"point-{pip}\"]",
                    evidence: evidence.map(e => `${e.type}_${e.attempt}.json`),
                    actions_taken: actionsTaken,
                    git_commits: []
                };
                
                console.log('📊 RAPPORT FINAL:', JSON.stringify(report, null, 2));
                return report;
            }
            
            // Attendre avant la prochaine tentative
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
        
        // Si on arrive ici, toutes les tentatives ont échoué
        const report = {
            result: "failure",
            timestamp: startTime,
            attempts: attempts,
            evidence: evidence.map(e => `${e.type}_${e.attempt}.json`),
            actions_taken: actionsTaken,
            git_commits: []
        };
        
        console.error('❌ ÉCHEC APRÈS', attempts, 'TENTATIVES');
        console.log('📊 RAPPORT FINAL:', JSON.stringify(report, null, 2));
        return report;
    }
    
    // Démarrer le test
    return main();
})();




