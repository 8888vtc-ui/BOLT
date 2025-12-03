// Script à injecter dans la console du navigateur pour tester directement la cliquabilité
// Copier-coller ce code dans la console (F12)

(function testDirectClickability() {
    console.log('🔍 TEST DIRECT DE CLIQUABILITÉ - Démarrage...');
    
    // 1. Trouver un checker light
    console.log('\n📊 ÉTAPE 1: Recherche d\'un checker light...');
    const checkers = Array.from(document.querySelectorAll('g[role="button"][aria-label*="light checker"]'));
    console.log(`✅ Trouvé ${checkers.length} checkers light`);
    
    if (checkers.length === 0) {
        console.error('❌ Aucun checker light trouvé');
        return;
    }
    
    // Prendre le premier checker
    const checker = checkers[0];
    const ariaLabel = checker.getAttribute('aria-label');
    console.log('✅ Checker sélectionné:', ariaLabel);
    
    // 2. Vérifier les styles CSS
    console.log('\n📊 ÉTAPE 2: Vérification des styles CSS...');
    const style = window.getComputedStyle(checker);
    console.log('Styles du checker:', {
        pointerEvents: style.pointerEvents,
        cursor: style.cursor,
        display: style.display,
        visibility: style.visibility,
        opacity: style.opacity,
        zIndex: style.zIndex
    });
    
    // 3. Vérifier les handlers d'événements
    console.log('\n📊 ÉTAPE 3: Vérification des handlers d\'événements...');
    console.log('onclick:', checker.onclick);
    console.log('addEventListener disponible:', typeof checker.addEventListener === 'function');
    
    // 4. Ajouter un listener de test
    console.log('\n📊 ÉTAPE 4: Ajout d\'un listener de test...');
    let testClickReceived = false;
    checker.addEventListener('click', (e) => {
        testClickReceived = true;
        console.log('✅✅✅ CLICK REÇU SUR LE CHECKER ✅✅✅', e);
    }, { once: true });
    
    // 5. Simuler un clic
    console.log('\n📊 ÉTAPE 5: Simulation d\'un clic...');
    const clickEvent = new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
        view: window,
        clientX: 100,
        clientY: 100
    });
    
    checker.dispatchEvent(clickEvent);
    
    setTimeout(() => {
        if (testClickReceived) {
            console.log('✅✅✅ LE CHECKER EST CLIQUABLE ✅✅✅');
        } else {
            console.error('❌❌❌ LE CHECKER N\'EST PAS CLIQUABLE ❌❌❌');
            console.log('Tentative de correction...');
            
            // Forcer pointer-events
            checker.style.pointerEvents = 'all';
            checker.style.cursor = 'pointer';
            
            // Réessayer
            const clickEvent2 = new MouseEvent('click', {
                bubbles: true,
                cancelable: true,
                view: window
            });
            checker.dispatchEvent(clickEvent2);
        }
    }, 100);
    
    // 6. Tester aussi avec pointer events
    console.log('\n📊 ÉTAPE 6: Test avec pointer events...');
    const pointerDownEvent = new PointerEvent('pointerdown', {
        bubbles: true,
        cancelable: true,
        view: window,
        pointerId: 1,
        clientX: 100,
        clientY: 100
    });
    
    let pointerDownReceived = false;
    checker.addEventListener('pointerdown', (e) => {
        pointerDownReceived = true;
        console.log('✅✅✅ POINTER DOWN REÇU ✅✅✅', e);
    }, { once: true });
    
    checker.dispatchEvent(pointerDownEvent);
    
    setTimeout(() => {
        if (pointerDownReceived) {
            console.log('✅✅✅ POINTER EVENTS FONCTIONNENT ✅✅✅');
        } else {
            console.error('❌❌❌ POINTER EVENTS NE FONCTIONNENT PAS ❌❌❌');
        }
    }, 100);
    
    console.log('\n✅ TEST TERMINÉ');
})();

