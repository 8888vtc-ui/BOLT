/**
 * Test de connexion Supabase avec le token fourni
 */

import https from 'https';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://vgmrkdlgjivfdyrpadha.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'nhhxgnmjsmpyyfmngoyf';

console.log('🔍 Test de connexion Supabase...\n');
console.log('URL:', SUPABASE_URL);
console.log('Key:', SUPABASE_KEY.substring(0, 20) + '...\n');

// Test 1: Vérifier si c'est un project ref
if (SUPABASE_KEY.length < 50) {
    console.log('⚠️  Le token semble être un project ref plutôt qu\'une clé complète');
    console.log('   Les Service Role Keys sont généralement des JWT très longs (commencent par "eyJ...")\n');
}

// Test 2: Essayer de se connecter à l'API REST
function testConnection() {
    return new Promise((resolve, reject) => {
        const url = new URL(`${SUPABASE_URL}/rest/v1/`);
        
        const options = {
            method: 'GET',
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`,
            }
        };
        
        const req = https.request(url, options, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                resolve({
                    status: res.statusCode,
                    headers: res.headers,
                    data: data.substring(0, 200)
                });
            });
        });
        
        req.on('error', reject);
        req.setTimeout(5000, () => {
            req.destroy();
            reject(new Error('Timeout'));
        });
        req.end();
    });
}

// Test 3: Essayer d'exécuter une requête simple
async function testQuery() {
    try {
        const url = new URL(`${SUPABASE_URL}/rest/v1/users?select=id&limit=1`);
        
        return new Promise((resolve, reject) => {
            const options = {
                method: 'GET',
                headers: {
                    'apikey': SUPABASE_KEY,
                    'Authorization': `Bearer ${SUPABASE_KEY}`,
                    'Prefer': 'return=representation'
                }
            };
            
            const req = https.request(url, options, (res) => {
                let data = '';
                
                res.on('data', (chunk) => {
                    data += chunk;
                });
                
                res.on('end', () => {
                    resolve({
                        status: res.statusCode,
                        data: data
                    });
                });
            });
            
            req.on('error', reject);
            req.setTimeout(5000, () => {
                req.destroy();
                reject(new Error('Timeout'));
            });
            req.end();
        });
    } catch (error) {
        throw error;
    }
}

// Main
async function main() {
    try {
        console.log('📡 Test 1: Connexion à l\'API REST...');
        const connectionTest = await testConnection();
        console.log('✅ Statut:', connectionTest.status);
        console.log('📄 Réponse:', connectionTest.data.substring(0, 100));
        console.log('');
        
        console.log('📡 Test 2: Requête simple (users table)...');
        const queryTest = await testQuery();
        console.log('✅ Statut:', queryTest.status);
        console.log('📄 Données:', queryTest.data.substring(0, 200));
        console.log('');
        
        if (queryTest.status === 200) {
            console.log('✅ CONNEXION RÉUSSIE!');
            console.log('✅ Le token fonctionne correctement');
            console.log('\n📋 Prochaines étapes:');
            console.log('   1. Le token peut être utilisé pour exécuter le script SQL');
            console.log('   2. Cependant, l\'API REST ne permet pas d\'exécuter du SQL arbitraire');
            console.log('   3. Utiliser le Dashboard Supabase pour exécuter FIX_SECURITY_RLS.sql');
        } else if (queryTest.status === 401) {
            console.log('❌ ERREUR D\'AUTHENTIFICATION');
            console.log('   Le token n\'est pas valide ou n\'a pas les bonnes permissions');
        } else {
            console.log('⚠️  Statut inattendu:', queryTest.status);
        }
        
    } catch (error) {
        console.error('❌ Erreur:', error.message);
        console.log('\n💡 Suggestions:');
        console.log('   1. Vérifier que le token est complet (les Service Role Keys sont très longs)');
        console.log('   2. Vérifier que c\'est bien le Service Role Key (pas l\'Anon Key)');
        console.log('   3. Vérifier dans Dashboard → Settings → API');
    }
}

main();

