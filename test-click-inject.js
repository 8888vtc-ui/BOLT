// Script à injecter dans la console du navigateur pour tester les clics
// Copier-coller ce code dans la console (F12)

(async function testCheckerMove() {
    console.log('🚀 Démarrage du test automatisé...');
    
    // 1. Lancer les dés
    console.log('🎲 Recherche du bouton "Roll the dice"...');
    const rollButton = document.querySelector('button[name="Roll the dice"]') || 
                       document.querySelector('button[aria-label="Roll the dice"]');
    
    if (!rollButton) {
        console.error('❌ Bouton "Roll the dice" non trouvé');
        return;
    }
    
    console.log('✅ Bouton trouvé, clic...');
    rollButton.click();
    await new Promise(resolve => setTimeout(resolve, 3000));
    console.log('✅ Dés lancés');
    
    // 2. Trouver un checker light sur point 6
    console.log('🖱️ Recherche d\'un checker light...');
    const checkers = Array.from(document.querySelectorAll('g[role="button"][aria-label*="light checker"]'));
    console.log(`📊 Trouvé ${checkers.length} checkers light`);
    
    if (checkers.length === 0) {
        console.error('❌ Aucun checker light trouvé');
        return;
    }
    
    // Prendre le premier checker (devrait être sur point 6)
    const checker = checkers[0];
    console.log('✅ Checker trouvé:', checker);
    
    // 3. Cliquer sur le checker
    console.log('🖱️ Clic sur le checker...');
    const clickEvent = new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
        view: window
    });
    checker.dispatchEvent(clickEvent);
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('✅ Checker cliqué');
    
    // 4. Cliquer sur Point 1
    console.log('🎯 Recherche de Point 1...');
    const points = Array.from(document.querySelectorAll('g[role="button"][aria-label="Point 1"]'));
    if (points.length === 0) {
        console.error('❌ Point 1 non trouvé');
        return;
    }
    
    const point1 = points[0];
    console.log('✅ Point 1 trouvé, clic...');
    point1.dispatchEvent(clickEvent);
    await new Promise(resolve => setTimeout(resolve, 2000));
    console.log('✅ Point 1 cliqué');
    
    // 5. Vérifier les logs
    console.log('📋 Test terminé - Vérifiez visuellement si le checker s\'est déplacé');
    console.log('📋 Vérifiez les logs [Checker] et [Triangle] dans la console');
})();



