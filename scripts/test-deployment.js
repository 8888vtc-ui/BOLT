#!/usr/bin/env node

/**
 * Script pour tester les déploiements en ligne
 */

const FRONTEND_URL = 'https://gurugammon-react.netlify.app';
const API_URL = 'https://botgammon.netlify.app/.netlify/functions/analyze';

console.log('🔍 Test des déploiements en ligne...\n');

// Test simple avec fetch (si disponible) ou on suggère curl
async function testURL(url, name) {
    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: { 'Accept': 'text/html' }
        });
        
        if (response.ok) {
            console.log(`✅ ${name}: Accessible (${response.status})`);
            return true;
        } else {
            console.log(`⚠️  ${name}: Répond mais avec erreur (${response.status})`);
            return false;
        }
    } catch (error) {
        console.log(`❌ ${name}: Non accessible - ${error.message}`);
        return false;
    }
}

async function testAPI() {
    try {
        const testPayload = {
            dice: [3, 1],
            boardState: {
                points: Array(24).fill({ player: 0, count: 0 }),
                bar: { white: 0, black: 0 },
                off: { white: 0, black: 0 }
            },
            player: 2
        };

        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(testPayload)
        });

        if (response.ok) {
            const data = await response.json();
            console.log(`✅ API Bot: Fonctionne correctement`);
            return true;
        } else {
            const text = await response.text();
            console.log(`⚠️  API Bot: Erreur ${response.status} - ${text.substring(0, 100)}`);
            return false;
        }
    } catch (error) {
        console.log(`❌ API Bot: Non accessible - ${error.message}`);
        return false;
    }
}

async function main() {
    console.log('📋 Tests en cours...\n');
    
    const frontendOK = await testURL(FRONTEND_URL, 'Frontend (Netlify)');
    const apiOK = await testAPI();
    
    console.log('\n==========================================');
    console.log('📊 RÉSULTATS');
    console.log('==========================================');
    console.log(`Frontend: ${frontendOK ? '✅ OK' : '❌ Erreur'}`);
    console.log(`API Bot: ${apiOK ? '✅ OK' : '❌ Erreur'}`);
    console.log('\n');
    
    if (frontendOK && apiOK) {
        console.log('🎉 Tous les services sont accessibles !');
    } else {
        console.log('⚠️  Certains services ne sont pas accessibles.');
        console.log('\nVérifiez :');
        console.log('1. Que les sites sont bien déployés sur Netlify');
        console.log('2. Que les URLs sont correctes');
        console.log('3. Que les variables d\'environnement sont configurées');
    }
}

main().catch(console.error);



