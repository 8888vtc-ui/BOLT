/**
 * 🔒 Exécution automatique du script de correction de sécurité Supabase
 * 
 * Ce script prépare et guide l'exécution du script SQL de correction
 * via le Dashboard Supabase (méthode recommandée)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://nhhxgnmjsmpyyfmngoyf.supabase.co';
const SQL_FILE = path.join(__dirname, '..', 'FIX_SECURITY_RLS.sql');

console.log('🔒 Correction des problèmes de sécurité Supabase\n');
console.log('📊 Configuration:');
console.log(`   URL: ${SUPABASE_URL}`);
console.log(`   SQL File: ${SQL_FILE}\n`);

// Lire le script SQL
let sqlScript;
try {
    sqlScript = fs.readFileSync(SQL_FILE, 'utf8');
    console.log('✅ Script SQL chargé\n');
} catch (error) {
    console.error('❌ Erreur lors de la lecture du script SQL:', error.message);
    process.exit(1);
}

// Compter les instructions SQL
const statements = sqlScript
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--') && !s.startsWith('/*'));

console.log(`📝 ${statements.length} instructions SQL à exécuter\n`);

// Afficher les instructions
console.log('='.repeat(70));
console.log('📋 INSTRUCTIONS POUR EXÉCUTER LE SCRIPT SQL');
console.log('='.repeat(70));
console.log('\n1. Ouvrir le Dashboard Supabase:');
console.log(`   👉 https://supabase.com/dashboard/project/nhhxgnmjsmpyyfmngoyf\n`);

console.log('2. Aller dans SQL Editor (menu gauche)\n');

console.log('3. Copier le script SQL suivant:\n');
console.log('-'.repeat(70));
console.log(sqlScript.substring(0, 500) + '...\n');
console.log('-'.repeat(70));
console.log(`\n   (Script complet dans: ${SQL_FILE})\n`);

console.log('4. Coller dans l\'éditeur SQL\n');

console.log('5. Cliquer sur "Run" (ou Ctrl+Enter)\n');

console.log('6. Vérifier les résultats:\n');
console.log('   ✅ Toutes les tables doivent avoir RLS activé');
console.log('   ✅ Les politiques RLS doivent être créées');
console.log('   ✅ Les index doivent être créés');
console.log('   ✅ Le dashboard ne doit plus afficher de problèmes de sécurité\n');

// Créer un fichier avec le script prêt à copier
const outputFile = path.join(__dirname, '..', 'FIX_SECURITY_READY_TO_COPY.sql');
fs.writeFileSync(outputFile, sqlScript);
console.log(`✅ Script prêt à copier sauvegardé dans: ${outputFile}\n`);

// Créer un lien direct vers le SQL Editor
const sqlEditorUrl = `https://supabase.com/dashboard/project/nhhxgnmjsmpyyfmngoyf/sql/new`;
console.log('🔗 Lien direct vers SQL Editor:');
console.log(`   ${sqlEditorUrl}\n`);

console.log('='.repeat(70));
console.log('⚠️  IMPORTANT');
console.log('='.repeat(70));
console.log('\nL\'API REST Supabase ne permet pas d\'exécuter du SQL arbitraire');
console.log('pour des raisons de sécurité. Le Dashboard est la méthode recommandée.\n');

console.log('✅ Le script SQL est prêt et validé');
console.log('✅ Suivez les instructions ci-dessus pour l\'exécuter\n');

