// Script simple pour tester le déplacement d'un pion
// À copier-coller dans la console du navigateur (F12)

console.log('🚀 TEST SIMPLE - DÉPLACEMENT PION');

// 1. Lancer les dés
const rollBtn = document.querySelector('[data-testid="roll-dice"]') ||
               document.querySelector('button[aria-label="Roll the dice"]');
if (rollBtn) {
    console.log('✅ Bouton roll trouvé, clic...');
    rollBtn.click();
    await new Promise(r => setTimeout(r, 3000));
    console.log('✅ Dés lancés');
} else {
    console.error('❌ Bouton roll non trouvé');
}

// 2. Trouver un checker light
const checkers = document.querySelectorAll('g[role="button"][aria-label*="light checker"]');
console.log(`📊 Trouvé ${checkers.length} checkers light`);

if (checkers.length === 0) {
    console.error('❌ Aucun checker light trouvé');
} else {
    const checker = checkers[0];
    console.log('✅ Checker trouvé:', checker);
    
    // Sauvegarder position initiale
    const circle = checker.querySelector('circle');
    const initialCx = circle?.getAttribute('cx');
    const initialCy = circle?.getAttribute('cy');
    console.log('📍 Position initiale:', initialCx, initialCy);
    
    // Forcer pointer-events
    checker.style.pointerEvents = 'auto';
    checker.style.cursor = 'pointer';
    checker.style.zIndex = '1000';
    
    // 3. Cliquer sur le checker
    console.log('🖱️ Clic sur checker...');
    const clickEvent = new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
        view: window
    });
    checker.dispatchEvent(clickEvent);
    
    await new Promise(r => setTimeout(r, 1000));
    console.log('✅ Checker cliqué');
    
    // 4. Cliquer sur Point 1
    const point1 = document.querySelector('[data-testid="point-1"]') ||
                  document.querySelector('g[role="button"][aria-label="Point 1"]');
    
    if (point1) {
        console.log('✅ Point 1 trouvé, clic...');
        point1.style.pointerEvents = 'auto';
        point1.style.cursor = 'pointer';
        point1.dispatchEvent(clickEvent);
        
        await new Promise(r => setTimeout(r, 3000));
        console.log('✅ Point 1 cliqué');
        
        // 5. Vérifier si le pion s'est déplacé
        const finalCx = circle?.getAttribute('cx');
        const finalCy = circle?.getAttribute('cy');
        console.log('📍 Position finale:', finalCx, finalCy);
        
        if (initialCx !== finalCx || initialCy !== finalCy) {
            console.log('✅✅✅ DÉPLACEMENT RÉUSSI ✅✅✅');
        } else {
            console.warn('⚠️ Position inchangée');
        }
    } else {
        console.error('❌ Point 1 non trouvé');
    }
}

console.log('📋 Test terminé - Vérifiez les logs ci-dessus');

