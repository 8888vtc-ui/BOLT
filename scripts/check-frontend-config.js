/**
 * Vérifier la configuration du frontend
 */

const NETLIFY_TOKEN = 'nfp_Y9S6sWkf2jT54iByoZvHUb2Q111n4YH20d37';
const FRONTEND_SITE_ID = 'bc6d4fdf-8750-41d0-a3a6-4e6b7c7e8bdb';
const API_SITE_ID = 'd0da12e4-83d8-42e7-9a1c-163d37e8d37d';

async function checkNetlifyConfig() {
    console.log('╔═══════════════════════════════════════════════════════════╗');
    console.log('║   VÉRIFICATION CONFIGURATION FRONTEND                    ║');
    console.log('╚═══════════════════════════════════════════════════════════╝\n');

    // Vérifier les variables d'environnement du frontend
    try {
        const frontendResponse = await fetch(
            `https://api.netlify.com/api/v1/sites/${FRONTEND_SITE_ID}/env`,
            {
                headers: {
                    'Authorization': `Bearer ${NETLIFY_TOKEN}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        if (!frontendResponse.ok) {
            throw new Error(`HTTP ${frontendResponse.status}`);
        }

        const frontendEnv = await frontendResponse.json();
        console.log('📋 Variables d\'environnement FRONTEND:');
        
        const botApiUrl = frontendEnv.find((e) => e.key === 'VITE_BOT_API_URL');
        const supabaseUrl = frontendEnv.find((e) => e.key === 'VITE_SUPABASE_URL');
        const supabaseKey = frontendEnv.find((e) => e.key === 'VITE_SUPABASE_ANON_KEY');

        if (botApiUrl) {
            console.log(`   ✅ VITE_BOT_API_URL = ${botApiUrl.values?.production || botApiUrl.values?.all || 'N/A'}`);
        } else {
            console.log('   ⚠️  VITE_BOT_API_URL non configurée');
            console.log('   💡 Valeur par défaut utilisée: https://botgammon.netlify.app/.netlify/functions/analyze');
        }

        if (supabaseUrl) {
            console.log(`   ✅ VITE_SUPABASE_URL = ${supabaseUrl.values?.production || supabaseUrl.values?.all || 'N/A'}`);
        } else {
            console.log('   ⚠️  VITE_SUPABASE_URL non configurée');
        }

        if (supabaseKey) {
            console.log(`   ✅ VITE_SUPABASE_ANON_KEY = ${supabaseKey.values?.production ? '***' : 'N/A'}`);
        } else {
            console.log('   ⚠️  VITE_SUPABASE_ANON_KEY non configurée');
        }

        // Vérifier l'URL du site
        const siteResponse = await fetch(
            `https://api.netlify.com/api/v1/sites/${FRONTEND_SITE_ID}`,
            {
                headers: {
                    'Authorization': `Bearer ${NETLIFY_TOKEN}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        if (siteResponse.ok) {
            const site = await siteResponse.json();
            console.log(`\n🌐 Site Frontend: ${site.name}`);
            console.log(`   URL: ${site.url || site.ssl_url || 'N/A'}`);
            console.log(`   État: ${site.state || 'N/A'}`);
        }

        // Vérifier l'API
        const apiResponse = await fetch(
            `https://api.netlify.com/api/v1/sites/${API_SITE_ID}`,
            {
                headers: {
                    'Authorization': `Bearer ${NETLIFY_TOKEN}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        if (apiResponse.ok) {
            const apiSite = await apiResponse.json();
            console.log(`\n🌐 Site API: ${apiSite.name}`);
            console.log(`   URL: ${apiSite.url || apiSite.ssl_url || 'N/A'}`);
            console.log(`   État: ${apiSite.state || 'N/A'}`);
        }

        // Test de l'URL par défaut
        console.log('\n🔍 Test de l\'URL API par défaut...');
        try {
            const testResponse = await fetch('https://botgammon.netlify.app/.netlify/functions/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    dice: [3, 1],
                    boardState: { points: Array(24).fill({ player: null, count: 0 }), bar: { player1: 0, player2: 0 }, off: { player1: 0, player2: 0 } },
                    player: 2
                }),
                signal: AbortSignal.timeout(10000)
            });

            if (testResponse.ok) {
                console.log('   ✅ API répond correctement !');
            } else {
                console.log(`   ❌ API erreur: HTTP ${testResponse.status}`);
            }
        } catch (error) {
            console.log(`   ⚠️  Erreur test API: ${error.message}`);
        }

        console.log('\n' + '═'.repeat(60));
        console.log('✅ Vérification terminée');

    } catch (error) {
        console.error('❌ Erreur:', error.message);
    }
}

checkNetlifyConfig();

