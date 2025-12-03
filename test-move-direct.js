// Script à exécuter dans la console du navigateur pour tester les mouvements
// Copier-coller ce code dans la console F12

console.log('=== TEST MOUVEMENT DIRECT ===');

// Attendre que la page soit chargée
setTimeout(() => {
    // 1. Trouver le bouton "Roll the dice"
    const rollButton = document.querySelector('button[aria-label*="Roll"], button:has-text("Roll the dice")');
    if (rollButton) {
        console.log('✅ Bouton Roll trouvé, clic...');
        rollButton.click();
        
        // Attendre que les dés soient lancés
        setTimeout(() => {
            console.log('✅ Dés lancés, recherche des checkers...');
            
            // 2. Trouver un checker light sur le point 6
            const checkers = document.querySelectorAll('g[role="button"][aria-label*="light checker"], circle[role="button"][aria-label*="light checker"]');
            console.log(`Trouvé ${checkers.length} checkers light`);
            
            if (checkers.length > 0) {
                // Prendre le checker qui est probablement sur le point 6 (index 4 dans la liste)
                const checker = checkers[4] || checkers[0];
                console.log('✅ Checker trouvé, clic...', checker);
                
                // Simuler un clic
                const clickEvent = new MouseEvent('click', {
                    bubbles: true,
                    cancelable: true,
                    view: window
                });
                checker.dispatchEvent(clickEvent);
                
                // Attendre un peu
                setTimeout(() => {
                    console.log('✅ Checker cliqué, recherche du point 1...');
                    
                    // 3. Trouver le point 1
                    const point1 = document.querySelector('g[role="button"][aria-label="Point 1"], button[aria-label="Point 1"]');
                    if (point1) {
                        console.log('✅ Point 1 trouvé, clic...', point1);
                        point1.dispatchEvent(clickEvent);
                        console.log('✅ Point 1 cliqué ! Vérifiez si le checker s\'est déplacé.');
                    } else {
                        console.error('❌ Point 1 non trouvé');
                    }
                }, 1000);
            } else {
                console.error('❌ Aucun checker light trouvé');
            }
        }, 2000);
    } else {
        console.error('❌ Bouton Roll non trouvé');
    }
}, 2000);

