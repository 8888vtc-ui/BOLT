// Script de test automatisé pour vérifier le déplacement des pions
// Usage: node test-checker-move.js

const puppeteer = require('puppeteer');

async function testCheckerMove() {
    console.log('🚀 Démarrage du test automatisé...');
    
    const browser = await puppeteer.launch({ 
        headless: false,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    // Écouter tous les logs de la console
    page.on('console', msg => {
        const text = msg.text();
        if (text.includes('[mappers]') || text.includes('[Checker]') || text.includes('[BoardWrap]') || text.includes('legalMoves') || text.includes('move')) {
            console.log(`📋 CONSOLE [${msg.type()}]:`, text);
        }
    });
    
    // Écouter les erreurs
    page.on('pageerror', error => {
        console.error('❌ ERREUR PAGE:', error.message);
    });
    
    try {
        console.log('🌐 Navigation vers le jeu...');
        await page.goto('https://gurugammon-react.netlify.app/game/offline-bot?mode=money&length=0', {
            waitUntil: 'networkidle2',
            timeout: 30000
        });
        
        console.log('⏳ Attente du chargement...');
        await page.waitForTimeout(5000);
        
        // Attendre que le bouton "Roll the dice" soit visible
        console.log('🎲 Recherche du bouton "Roll the dice"...');
        await page.waitForSelector('button[name="Roll the dice"], button:has-text("Roll the dice")', { timeout: 10000 });
        
        // Lancer les dés
        console.log('🎲 Clic sur "Roll the dice"...');
        await page.click('button[name="Roll the dice"]');
        await page.waitForTimeout(3000);
        
        // Vérifier les logs de la console
        console.log('📊 Vérification des logs...');
        const logs = await page.evaluate(() => {
            return window.consoleLogs || [];
        });
        
        // Attendre un peu pour que les legalMoves soient calculés
        await page.waitForTimeout(2000);
        
        // Essayer de cliquer sur un checker light (joueur 1)
        console.log('🖱️ Recherche d\'un checker light...');
        
        // Prendre une capture d'écran pour debug
        await page.screenshot({ path: 'test-before-click.png' });
        
        // Essayer de trouver un checker cliquable
        const checkerClicked = await page.evaluate(() => {
            // Chercher tous les éléments SVG qui contiennent "light checker"
            const checkers = Array.from(document.querySelectorAll('g[role="button"]'));
            const lightChecker = checkers.find(el => {
                const ariaLabel = el.getAttribute('aria-label');
                return ariaLabel && ariaLabel.includes('light checker') && ariaLabel.includes('playable');
            });
            
            if (lightChecker) {
                lightChecker.click();
                return true;
            }
            return false;
        });
        
        if (checkerClicked) {
            console.log('✅ Checker cliqué !');
            await page.waitForTimeout(1000);
            
            // Essayer de cliquer sur une destination (point 1)
            console.log('🎯 Clic sur Point 1...');
            const pointClicked = await page.evaluate(() => {
                const points = Array.from(document.querySelectorAll('g[role="button"]'));
                const point1 = points.find(el => {
                    const ariaLabel = el.getAttribute('aria-label');
                    return ariaLabel && ariaLabel.includes('Point 1');
                });
                
                if (point1) {
                    point1.click();
                    return true;
                }
                return false;
            });
            
            if (pointClicked) {
                console.log('✅ Point 1 cliqué !');
                await page.waitForTimeout(2000);
                
                // Prendre une capture d'écran après le clic
                await page.screenshot({ path: 'test-after-click.png' });
                
                // Vérifier si le checker s'est déplacé
                const moved = await page.evaluate(() => {
                    // Vérifier les logs pour voir si un mouvement a été effectué
                    return window.lastMove || false;
                });
                
                if (moved) {
                    console.log('🎉 SUCCÈS ! Le checker s\'est déplacé !');
                } else {
                    console.log('⚠️ Le checker n\'a pas bougé. Vérification des logs...');
                }
            } else {
                console.log('❌ Impossible de cliquer sur Point 1');
            }
        } else {
            console.log('❌ Aucun checker playable trouvé');
        }
        
        // Attendre un peu pour voir les logs
        await page.waitForTimeout(3000);
        
        console.log('✅ Test terminé');
        
    } catch (error) {
        console.error('❌ ERREUR:', error);
        await page.screenshot({ path: 'test-error.png' });
    } finally {
        await browser.close();
    }
}

testCheckerMove().catch(console.error);

