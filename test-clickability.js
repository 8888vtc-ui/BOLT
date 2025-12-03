// Script de test de cliquabilité - À injecter dans la console du navigateur
// Ce script teste si les checkers et les points sont cliquables

(function testClickability() {
    console.log('🔍 TEST DE CLIQUABILITÉ - Démarrage...');
    
    // 1. Vérifier les checkers
    console.log('\n📊 ÉTAPE 1: Vérification des checkers...');
    const checkers = Array.from(document.querySelectorAll('g[role="button"][aria-label*="checker"]'));
    console.log(`✅ Trouvé ${checkers.length} checkers`);
    
    checkers.forEach((checker, index) => {
        const ariaLabel = checker.getAttribute('aria-label');
        const style = window.getComputedStyle(checker);
        const pointerEvents = style.pointerEvents;
        const cursor = style.cursor;
        const hasOnClick = checker.onclick !== null;
        
        console.log(`Checker ${index + 1}:`, {
            ariaLabel,
            pointerEvents,
            cursor,
            hasOnClick,
            hasEventListener: checker.addEventListener ? 'yes' : 'no'
        });
        
        // Tester le clic
        const clickEvent = new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
            view: window
        });
        
        let clicked = false;
        checker.addEventListener('click', () => {
            clicked = true;
            console.log(`✅ Checker ${index + 1} a reçu le clic!`);
        }, { once: true });
        
        checker.dispatchEvent(clickEvent);
        
        setTimeout(() => {
            if (!clicked) {
                console.warn(`❌ Checker ${index + 1} n'a PAS reçu le clic`);
            }
        }, 100);
    });
    
    // 2. Vérifier les points (triangles)
    console.log('\n📊 ÉTAPE 2: Vérification des points...');
    const points = Array.from(document.querySelectorAll('g[role="button"][aria-label^="Point"]'));
    console.log(`✅ Trouvé ${points.length} points`);
    
    points.slice(0, 5).forEach((point, index) => {
        const ariaLabel = point.getAttribute('aria-label');
        const style = window.getComputedStyle(point);
        const pointerEvents = style.pointerEvents;
        const cursor = style.cursor;
        
        console.log(`Point ${index + 1}:`, {
            ariaLabel,
            pointerEvents,
            cursor
        });
        
        // Tester le clic
        const clickEvent = new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
            view: window
        });
        
        let clicked = false;
        point.addEventListener('click', () => {
            clicked = true;
            console.log(`✅ Point ${index + 1} a reçu le clic!`);
        }, { once: true });
        
        point.dispatchEvent(clickEvent);
        
        setTimeout(() => {
            if (!clicked) {
                console.warn(`❌ Point ${index + 1} n'a PAS reçu le clic`);
            }
        }, 100);
    });
    
    // 3. Vérifier les éléments SVG parents
    console.log('\n📊 ÉTAPE 3: Vérification des éléments SVG parents...');
    const svg = document.querySelector('svg[role="application"]');
    if (svg) {
        const style = window.getComputedStyle(svg);
        console.log('SVG parent:', {
            pointerEvents: style.pointerEvents,
            position: style.position,
            zIndex: style.zIndex
        });
    }
    
    // 4. Vérifier les overlays qui pourraient bloquer
    console.log('\n📊 ÉTAPE 4: Vérification des overlays...');
    const overlays = Array.from(document.querySelectorAll('[class*="overlay"], [class*="absolute"]'));
    console.log(`Trouvé ${overlays.length} éléments avec overlay/absolute`);
    
    overlays.forEach((overlay, index) => {
        const style = window.getComputedStyle(overlay);
        if (style.pointerEvents !== 'none' && style.zIndex > 10) {
            console.warn(`⚠️ Overlay ${index + 1} pourrait bloquer:`, {
                pointerEvents: style.pointerEvents,
                zIndex: style.zIndex,
                className: overlay.className
            });
        }
    });
    
    console.log('\n✅ TEST TERMINÉ - Vérifiez les résultats ci-dessus');
})();



