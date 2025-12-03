/**
 * 🔒 Script pour corriger les problèmes de sécurité Supabase
 * 
 * Utilisation:
 *   node scripts/fix-supabase-security.js <SUPABASE_URL> <SERVICE_ROLE_KEY>
 * 
 * OU définir les variables d'environnement:
 *   SUPABASE_URL=https://xxx.supabase.co
 *   SUPABASE_SERVICE_ROLE_KEY=eyJ...
 */

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

// Configuration
const SUPABASE_URL = process.env.SUPABASE_URL || process.argv[2];
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.argv[3];

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error('❌ Erreur: SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY sont requis');
    console.error('\nUsage:');
    console.error('  node scripts/fix-supabase-security.js <SUPABASE_URL> <SERVICE_ROLE_KEY>');
    console.error('\nOU définir les variables d\'environnement:');
    console.error('  SUPABASE_URL=https://xxx.supabase.co');
    console.error('  SUPABASE_SERVICE_ROLE_KEY=eyJ...');
    process.exit(1);
}

// Lire le script SQL
const sqlFile = path.join(__dirname, '..', 'FIX_SECURITY_RLS.sql');
let sqlScript;

try {
    sqlScript = fs.readFileSync(sqlFile, 'utf8');
    console.log('✅ Script SQL chargé:', sqlFile);
} catch (error) {
    console.error('❌ Erreur lors de la lecture du script SQL:', error.message);
    process.exit(1);
}

/**
 * Exécuter une requête SQL via l'API Supabase PostgREST
 * Note: L'API REST ne permet pas d'exécuter du SQL arbitraire directement
 * Il faut utiliser l'endpoint SQL Editor ou créer une fonction Edge Function
 */
async function executeSQL(sql) {
    return new Promise((resolve, reject) => {
        // Pour exécuter du SQL, on doit utiliser l'API SQL Editor de Supabase
        // qui nécessite une authentification spéciale
        
        // Alternative: Utiliser l'API REST avec une fonction RPC
        // Mais pour des ALTER TABLE et CREATE POLICY, il faut l'API SQL Editor
        
        const url = new URL(SUPABASE_URL);
        const isHttps = url.protocol === 'https:';
        const client = isHttps ? https : http;
        
        // L'API Supabase ne permet pas d'exécuter du SQL arbitraire via REST
        // Il faut utiliser le Dashboard SQL Editor ou le CLI
        
        console.error('⚠️  L\'API REST Supabase ne permet pas d\'exécuter du SQL arbitraire.');
        console.error('📝 Solutions alternatives:');
        console.error('   1. Utiliser le Supabase Dashboard SQL Editor');
        console.error('   2. Installer Supabase CLI: npm install -g supabase');
        console.error('   3. Créer une Edge Function temporaire');
        
        reject(new Error('SQL execution via REST API not supported'));
    });
}

/**
 * Alternative: Créer une Edge Function qui exécute le SQL
 */
function createEdgeFunction(sql) {
    const functionCode = `
import { createClient } from 'npm:@supabase/supabase-js@2'

Deno.serve(async (req) => {
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    // Exécuter le SQL
    const { data, error } = await supabase.rpc('exec_sql', { 
      sql_query: \`${sql.replace(/`/g, '\\`')}\`
    })
    
    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
    }
    
    return new Response(JSON.stringify({ success: true, data }), {
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
})
`;
    
    return functionCode;
}

/**
 * Méthode recommandée: Générer un script pour Supabase CLI
 */
function generateCLIScript(sql) {
    const cliScript = `#!/bin/bash
# Script pour exécuter avec Supabase CLI
# Usage: supabase db execute --file fix-security.sql

${sql}
`;
    
    const outputFile = path.join(__dirname, '..', 'fix-security-cli.sql');
    fs.writeFileSync(outputFile, cliScript);
    console.log('✅ Script CLI généré:', outputFile);
    console.log('\n📋 Pour exécuter:');
    console.log('   1. Installer Supabase CLI: npm install -g supabase');
    console.log('   2. Se connecter: supabase login');
    console.log('   3. Lier le projet: supabase link --project-ref YOUR_PROJECT_REF');
    console.log('   4. Exécuter: supabase db execute --file fix-security-cli.sql');
}

/**
 * Méthode directe: Utiliser l'API SQL Editor (nécessite un token spécial)
 */
async function executeViaSQLEditorAPI(sql) {
    // L'API SQL Editor nécessite un token d'authentification spécial
    // qui n'est pas le service role key standard
    
    const url = new URL(`${SUPABASE_URL.replace('/rest/v1', '')}/rest/v1/rpc/exec_sql`);
    
    // Diviser le SQL en instructions individuelles
    const statements = sql
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--') && !s.startsWith('/*'));
    
    console.log(`📝 ${statements.length} instructions SQL à exécuter`);
    
    // Note: L'API Supabase ne permet pas d'exécuter du SQL arbitraire
    // Il faut utiliser le Dashboard ou le CLI
    
    return {
        success: false,
        message: 'SQL execution requires Supabase Dashboard or CLI'
    };
}

// Main
async function main() {
    console.log('🔒 Correction des problèmes de sécurité Supabase\n');
    console.log('📊 Configuration:');
    console.log(`   URL: ${SUPABASE_URL}`);
    console.log(`   Service Role Key: ${SUPABASE_SERVICE_ROLE_KEY.substring(0, 20)}...`);
    console.log('');
    
    // Option 1: Générer un script pour Supabase CLI
    console.log('📝 Option 1: Génération d\'un script pour Supabase CLI...');
    generateCLIScript(sqlScript);
    
    // Option 2: Créer une Edge Function
    console.log('\n📝 Option 2: Création d\'une Edge Function...');
    const edgeFunction = createEdgeFunction(sqlScript);
    const edgeFunctionFile = path.join(__dirname, '..', 'supabase', 'functions', 'fix-security', 'index.ts');
    const edgeFunctionDir = path.dirname(edgeFunctionFile);
    
    if (!fs.existsSync(edgeFunctionDir)) {
        fs.mkdirSync(edgeFunctionDir, { recursive: true });
    }
    
    fs.writeFileSync(edgeFunctionFile, edgeFunction);
    console.log('✅ Edge Function créée:', edgeFunctionFile);
    console.log('\n📋 Pour déployer:');
    console.log('   supabase functions deploy fix-security');
    
    // Option 3: Instructions pour le Dashboard
    console.log('\n📝 Option 3: Utilisation du Dashboard Supabase (RECOMMANDÉ)');
    console.log('   1. Aller sur https://supabase.com/dashboard');
    console.log('   2. Sélectionner votre projet');
    console.log('   3. Aller dans SQL Editor');
    console.log('   4. Copier le contenu de FIX_SECURITY_RLS.sql');
    console.log('   5. Coller et exécuter');
    
    console.log('\n✅ Scripts générés avec succès!');
    console.log('\n⚠️  Note: Pour des raisons de sécurité, Supabase ne permet pas');
    console.log('   d\'exécuter du SQL arbitraire via l\'API REST.');
    console.log('   Utilisez le Dashboard ou le CLI Supabase.');
}

main().catch(console.error);

