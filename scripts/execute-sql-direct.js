/**
 * 🔒 Exécution directe de SQL sur Supabase via API
 * 
 * Ce script utilise l'API PostgREST de Supabase pour exécuter des requêtes SQL
 * via des fonctions RPC ou des requêtes directes.
 * 
 * IMPORTANT: L'API REST Supabase ne permet pas d'exécuter du SQL arbitraire
 * pour des raisons de sécurité. Ce script utilise des méthodes alternatives.
 */

const https = require('https');
const http = require('http');

const SUPABASE_URL = process.env.SUPABASE_URL || process.argv[2];
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.argv[3];

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error('❌ SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY requis');
    process.exit(1);
}

/**
 * Créer une fonction RPC dans Supabase qui exécute le SQL
 * Cette fonction doit être créée manuellement dans le Dashboard d'abord
 */
async function createRPCFunction() {
    const createFunctionSQL = `
CREATE OR REPLACE FUNCTION exec_sql(sql_query text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result jsonb;
BEGIN
    EXECUTE sql_query;
    RETURN jsonb_build_object('success', true);
EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;
`;
    
    console.log('📝 Fonction RPC à créer dans Supabase:');
    console.log(createFunctionSQL);
    console.log('\n⚠️  Cette fonction doit être créée dans le Dashboard SQL Editor d\'abord.');
}

/**
 * Exécuter du SQL via une fonction RPC (si elle existe)
 */
async function executeViaRPC(sql) {
    const url = new URL(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`);
    
    return new Promise((resolve, reject) => {
        const postData = JSON.stringify({ sql_query: sql });
        
        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': SUPABASE_SERVICE_ROLE_KEY,
                'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
                'Prefer': 'return=representation'
            }
        };
        
        const req = https.request(url, options, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                try {
                    const result = JSON.parse(data);
                    resolve(result);
                } catch (e) {
                    resolve({ raw: data });
                }
            });
        });
        
        req.on('error', reject);
        req.write(postData);
        req.end();
    });
}

/**
 * Méthode alternative: Utiliser l'API Management de Supabase
 * Nécessite un token d'accès spécial du Dashboard
 */
async function executeViaManagementAPI(sql, accessToken) {
    // L'API Management nécessite un token d'accès du Dashboard
    // qui est différent du service role key
    
    const projectRef = SUPABASE_URL.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];
    if (!projectRef) {
        throw new Error('Impossible d\'extraire le project ref de l\'URL');
    }
    
    const url = `https://api.supabase.com/v1/projects/${projectRef}/database/query`;
    
    return new Promise((resolve, reject) => {
        const postData = JSON.stringify({ query: sql });
        
        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`,
            }
        };
        
        const req = https.request(url, options, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                try {
                    const result = JSON.parse(data);
                    resolve(result);
                } catch (e) {
                    resolve({ raw: data });
                }
            });
        });
        
        req.on('error', reject);
        req.write(postData);
        req.end();
    });
}

// Main
async function main() {
    console.log('🔒 Exécution de SQL sur Supabase\n');
    
    if (process.argv[4] === '--create-rpc') {
        await createRPCFunction();
        return;
    }
    
    const sql = process.argv[4] || process.stdin.read()?.toString();
    if (!sql) {
        console.error('❌ SQL requis');
        console.error('Usage: node execute-sql-direct.js <URL> <SERVICE_KEY> <SQL>');
        console.error('   OU: echo "SELECT 1;" | node execute-sql-direct.js <URL> <SERVICE_KEY>');
        process.exit(1);
    }
    
    // Essayer d'exécuter via RPC
    try {
        console.log('🔄 Tentative d\'exécution via RPC...');
        const result = await executeViaRPC(sql);
        console.log('✅ Résultat:', JSON.stringify(result, null, 2));
    } catch (error) {
        console.error('❌ Erreur RPC:', error.message);
        console.log('\n📝 Solutions alternatives:');
        console.log('   1. Créer la fonction RPC exec_sql dans le Dashboard');
        console.log('   2. Utiliser le Dashboard SQL Editor directement');
        console.log('   3. Utiliser Supabase CLI');
    }
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = { executeViaRPC, executeViaManagementAPI };

