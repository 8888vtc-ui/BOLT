#!/usr/bin/env node

/**
 * Script pour vérifier l'état des déploiements Netlify avec token
 */

const NETLIFY_TOKEN = process.env.NETLIFY_TOKEN || process.argv[2];
const NETLIFY_API = 'https://api.netlify.com/api/v1';

if (!NETLIFY_TOKEN) {
    console.log('❌ Token Netlify requis');
    console.log('Usage: NETLIFY_TOKEN=votre_token node scripts/check-netlify-status.js');
    console.log('   ou: node scripts/check-netlify-status.js votre_token');
    process.exit(1);
}

async function getSites() {
    try {
        const response = await fetch(`${NETLIFY_API}/sites`, {
            headers: {
                'Authorization': `Bearer ${NETLIFY_TOKEN}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }

        const sites = await response.json();
        return sites;
    } catch (error) {
        console.error('❌ Erreur lors de la récupération des sites:', error.message);
        return null;
    }
}

async function getSiteDeploys(siteId) {
    try {
        const response = await fetch(`${NETLIFY_API}/sites/${siteId}/deploys`, {
            headers: {
                'Authorization': `Bearer ${NETLIFY_TOKEN}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }

        const deploys = await response.json();
        return deploys.slice(0, 5); // Derniers 5 déploiements
    } catch (error) {
        console.error('❌ Erreur lors de la récupération des déploiements:', error.message);
        return [];
    }
}

async function getSiteEnvVars(siteId) {
    try {
        const response = await fetch(`${NETLIFY_API}/sites/${siteId}/env`, {
            headers: {
                'Authorization': `Bearer ${NETLIFY_TOKEN}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }

        const envVars = await response.json();
        return envVars;
    } catch (error) {
        console.error('❌ Erreur lors de la récupération des variables:', error.message);
        return [];
    }
}

async function main() {
    console.log('🔍 Vérification de l\'état Netlify...\n');

    const sites = await getSites();
    if (!sites || sites.length === 0) {
        console.log('❌ Aucun site trouvé ou erreur d\'accès');
        return;
    }

    console.log(`📊 ${sites.length} site(s) trouvé(s)\n`);

    for (const site of sites) {
        console.log('═'.repeat(60));
        console.log(`🌐 Site: ${site.name}`);
        console.log(`   URL: ${site.url || site.ssl_url || 'N/A'}`);
        console.log(`   ID: ${site.id}`);
        console.log(`   État: ${site.state || 'N/A'}`);
        console.log(`   Dernière mise à jour: ${site.updated_at || 'N/A'}`);

        // Récupérer les déploiements
        const deploys = await getSiteDeploys(site.id);
        if (deploys.length > 0) {
            console.log(`\n📦 Derniers déploiements:`);
            deploys.forEach((deploy, index) => {
                const status = deploy.state === 'ready' ? '✅' : deploy.state === 'error' ? '❌' : '⏳';
                console.log(`   ${status} ${deploy.state} - ${deploy.created_at} - ${deploy.commit_ref || 'N/A'}`);
            });
        }

        // Récupérer les variables d'environnement
        const envVars = await getSiteEnvVars(site.id);
        if (envVars.length > 0) {
            console.log(`\n🔐 Variables d'environnement (${envVars.length}):`);
            envVars.forEach(env => {
                const value = env.values?.production || env.values?.all || 'N/A';
                const masked = value.length > 20 ? value.substring(0, 20) + '...' : value;
                console.log(`   ${env.key} = ${masked}`);
            });
        } else {
            console.log(`\n⚠️  Aucune variable d'environnement trouvée`);
        }

        console.log('');
    }

    console.log('═'.repeat(60));
    console.log('\n✅ Vérification terminée');
}

main().catch(console.error);

