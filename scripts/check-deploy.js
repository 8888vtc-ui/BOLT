#!/usr/bin/env node

/**
 * Script de vérification pré-déploiement (Version Node.js pour Windows)
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const RESET = '\x1b[0m';

let errors = 0;
let warnings = 0;

function check(message, condition) {
    if (condition) {
        console.log(`${GREEN}✅ ${message}${RESET}`);
    } else {
        console.log(`${RED}❌ ${message}${RESET}`);
        errors++;
    }
}

function warn(message) {
    console.log(`${YELLOW}⚠️  ${message}${RESET}`);
    warnings++;
}

console.log('🔍 Vérification pré-déploiement GuruGammon...\n');

// 1. Vérifier Node.js
try {
    const nodeVersion = execSync('node --version', { encoding: 'utf-8' }).trim();
    check(`Node.js installé (${nodeVersion})`, true);
} catch (e) {
    check('Node.js installé', false);
}

// 2. Vérifier npm
try {
    const npmVersion = execSync('npm --version', { encoding: 'utf-8' }).trim();
    check(`npm installé (${npmVersion})`, true);
} catch (e) {
    check('npm installé', false);
}

// 3. Vérifier node_modules
const cwd = process.cwd();
const nodeModulesExists = fs.existsSync(path.join(cwd, 'node_modules'));
if (nodeModulesExists) {
    check('node_modules existe', true);
} else {
    warn('node_modules manquant - exécutez: npm install');
}

// 4. Vérifier .env
const envPath = path.join(cwd, '.env');
if (fs.existsSync(envPath)) {
    check('Fichier .env existe', true);
    
    const envContent = fs.readFileSync(envPath, 'utf-8');
    
    if (envContent.includes('VITE_SUPABASE_URL') && !envContent.includes('votre-projet')) {
        check('VITE_SUPABASE_URL configuré', true);
    } else {
        warn('VITE_SUPABASE_URL non configuré ou valeur par défaut');
    }
    
    if (envContent.includes('VITE_SUPABASE_ANON_KEY') && !envContent.includes('votre_cle')) {
        check('VITE_SUPABASE_ANON_KEY configuré', true);
    } else {
        warn('VITE_SUPABASE_ANON_KEY non configuré ou valeur par défaut');
    }
    
    if (envContent.includes('VITE_BOT_API_URL')) {
        check('VITE_BOT_API_URL configuré', true);
    } else {
        warn('VITE_BOT_API_URL non configuré');
    }
} else {
    warn('Fichier .env manquant - copiez .env.example vers .env');
}

// 5. Vérifier netlify.toml
const netlifyPath = path.join(cwd, 'netlify.toml');
if (fs.existsSync(netlifyPath)) {
    check('netlify.toml existe', true);
    
    const netlifyContent = fs.readFileSync(netlifyPath, 'utf-8');
    if (netlifyContent.includes('build') && netlifyContent.includes('publish')) {
        check('Configuration Netlify correcte', true);
    } else {
        warn('Configuration Netlify incomplète');
    }
} else {
    warn('netlify.toml manquant');
}

// 6. Vérifier le build
try {
    execSync('npm run build', { stdio: 'ignore' });
    check('Build réussi', true);
    
    const distPath = path.join(cwd, 'dist');
    if (fs.existsSync(distPath)) {
        check('Dossier dist/ créé', true);
    } else {
        warn('Dossier dist/ manquant après build');
    }
} catch (e) {
    warn('Build échoué - vérifiez les erreurs');
}

// 7. Vérifier TypeScript
try {
    execSync('npm run typecheck', { stdio: 'ignore' });
    check('Pas d\'erreurs TypeScript', true);
} catch (e) {
    warn('Erreurs TypeScript détectées');
}

// 8. Vérifier Git
const gitPath = path.join(cwd, '.git');
if (fs.existsSync(gitPath)) {
    check('Repository Git initialisé', true);
    
    const gitignorePath = path.join(cwd, '.gitignore');
    if (fs.existsSync(gitignorePath)) {
        const gitignoreContent = fs.readFileSync(gitignorePath, 'utf-8');
        if (gitignoreContent.includes('.env')) {
            check('.env dans .gitignore', true);
        } else {
            warn('.env pas dans .gitignore');
        }
    }
} else {
    warn('Repository Git non initialisé');
}

// Résumé
console.log('\n==========================================');
console.log('📊 RÉSUMÉ');
console.log('==========================================');
console.log(`${GREEN}✅ Succès: ${8 - errors - warnings}${RESET}`);
if (warnings > 0) {
    console.log(`${YELLOW}⚠️  Avertissements: ${warnings}${RESET}`);
}
if (errors > 0) {
    console.log(`${RED}❌ Erreurs: ${errors}${RESET}`);
}
console.log('');

if (errors === 0 && warnings === 0) {
    console.log(`${GREEN}🎉 Tout est prêt pour le déploiement !${RESET}`);
    process.exit(0);
} else if (errors === 0) {
    console.log(`${YELLOW}⚠️  Prêt avec quelques avertissements${RESET}`);
    process.exit(0);
} else {
    console.log(`${RED}❌ Des erreurs doivent être corrigées avant le déploiement${RESET}`);
    process.exit(1);
}

