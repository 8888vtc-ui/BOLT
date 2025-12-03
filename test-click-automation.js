// Script d'automatisation pour tester les clics sur les checkers
// Usage: node test-click-automation.js

const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    
    // Écouter tous les logs de la console
    page.on('console', msg => {
        const text = msg.text();
        if (text.includes('[mappers]') || text.includes('[Checker]') || text.includes('[BoardWrap]') || text.includes('legalMoves') || text.includes('move')) {
            console.log(`[CONSOLE ${msg.type()}]:`, text);
        }
    });
    
    // Écouter les erreurs
    page.on('pageerror', error => {
        console.error('[PAGE ERROR]:', error.message);
    });
    
    console.log('Navigation vers le jeu...');
    await page.goto('https://gurugammon-react.netlify.app/game/offline-bot?mode=money&length=0', { waitUntil: 'networkidle2' });
    
    await page.waitForTimeout(5000);
    
    console.log('Lancement des dés...');
    const rollButton = await page.$('button:has-text("Roll the dice"), button[aria-label*="Roll"]');
    if (rollButton) {
        await rollButton.click();
        await page.waitForTimeout(3000);
    }
    
    console.log('Recherche d\'un checker light sur le point 6...');
    await page.waitForTimeout(2000);
    
    // Prendre un screenshot pour voir l'état
    await page.screenshot({ path: 'before-click.png' });
    
    // Essayer de cliquer sur un checker
    const checkers = await page.$$('g[role="button"][aria-label*="light checker"], circle[role="button"][aria-label*="light checker"]');
    console.log(`Trouvé ${checkers.length} checkers light`);
    
    if (checkers.length > 0) {
        console.log('Clic sur le premier checker light...');
        await checkers[0].click();
        await page.waitForTimeout(1000);
        
        // Essayer de cliquer sur le point 1
        const point1 = await page.$('g[role="button"][aria-label="Point 1"], button[aria-label="Point 1"]');
        if (point1) {
            console.log('Clic sur le point 1...');
            await point1.click();
            await page.waitForTimeout(2000);
        }
    }
    
    // Prendre un screenshot après
    await page.screenshot({ path: 'after-click.png' });
    
    console.log('Attente de 5 secondes pour voir les logs...');
    await page.waitForTimeout(5000);
    
    await browser.close();
})();

