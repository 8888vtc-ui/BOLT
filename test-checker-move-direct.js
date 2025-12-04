// Script de test direct - Injection JavaScript dans la page
// Usage: Copier-coller dans la console du navigateur

(async function testCheckerMove() {
    console.log('🚀 Démarrage du test automatisé...');
    
    // Attendre que la page soit chargée
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // 1. Lancer les dés
    console.log('🎲 Recherche du bouton "Roll the dice"...');
    const rollButton = document.querySelector('button[name="Roll the dice"]');
    if (!rollButton) {
        console.error('❌ Bouton "Roll the dice" non trouvé');
        return;
    }
    
    console.log('🎲 Clic sur "Roll the dice"...');
    rollButton.click();
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // 2. Vérifier les logs dans la console
    console.log('📊 Vérification des logs...');
    
    // 3. Trouver un checker light sur le point 6 (index 5 dans le board)
    console.log('🖱️ Recherche d\'un checker light sur point 6...');
    
    // Utiliser les sélecteurs CSS pour trouver les checkers
    const checkers = Array.from(document.querySelectorAll('g[role="button"][aria-label*="light checker"]'));
    console.log(`📊 Trouvé ${checkers.length} checkers light`);
    
    if (checkers.length === 0) {
        console.error('❌ Aucun checker light trouvé');
        return;
    }
    
    // Prendre le premier checker (devrait être sur point 6)
    const checker = checkers[0];
    console.log('✅ Checker trouvé:', checker);
    
    // 4. Cliquer sur le checker
    console.log('🖱️ Clic sur le checker...');
    checker.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 5. Cliquer sur Point 1
    console.log('🎯 Recherche de Point 1...');
    const point1 = Array.from(document.querySelectorAll('g[role="button"][aria-label="Point 1"]'))[0];
    if (!point1) {
        console.error('❌ Point 1 non trouvé');
        return;
    }
    
    console.log('🎯 Clic sur Point 1...');
    point1.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // 6. Vérifier si le checker s'est déplacé
    console.log('✅ Test terminé - Vérifiez visuellement si le checker s\'est déplacé');
    
    // Afficher les logs de la console
    console.log('📋 Logs de la console:');
    console.log('   - Vérifiez les logs [mappers] pour voir si legalMoves sont calculés');
    console.log('   - Vérifiez les logs [BoardWrap] pour voir si handlePipClick est appelé');
    console.log('   - Vérifiez les logs [GameRoom] pour voir si handleBoardMove est appelé');
})();




