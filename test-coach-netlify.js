/**
 * Test du Coach AI avec Netlify Function
 * 
 * Ce script teste:
 * 1. La fonction Netlify coach
 * 2. Le fallback Ollama direct
 * 3. Le fallback DeepSeek API
 */

const COACH_API_URL = process.env.VITE_COACH_API_URL || 'https://botgammon.netlify.app/.netlify/functions/coach';
const OLLAMA_URL = process.env.VITE_OLLAMA_URL || 'https://bot-production-b9d6.up.railway.app';
const DEEPSEEK_API_KEY = process.env.VITE_DEEPSEEK_API_KEY;

const testQuestions = [
    {
        question: "Comment jouer un double 1?",
        contextType: "rules"
    },
    {
        question: "Quelle est la meilleure stratégie d'ouverture?",
        contextType: "strategy"
    },
    {
        question: "Explique-moi les règles du bear off",
        contextType: "rules"
    }
];

async function testNetlifyCoach(question, contextType = 'game') {
    console.log(`\n🧪 Test Netlify Function: "${question}"`);
    console.log(`   URL: ${COACH_API_URL}`);
    
    try {
        const startTime = Date.now();
        const response = await fetch(COACH_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                question,
                contextType
            }),
            signal: AbortSignal.timeout(30000)
        });

        const duration = Date.now() - startTime;
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error(`   ❌ Erreur ${response.status}:`, errorData);
            return {
                success: false,
                error: errorData.message || errorData.error || response.statusText,
                status: response.status,
                duration
            };
        }

        const data = await response.json();
        console.log(`   ✅ Succès (${duration}ms)`);
        console.log(`   Réponse: ${data.answer?.substring(0, 100)}...`);
        
        return {
            success: true,
            answer: data.answer,
            duration
        };
    } catch (error) {
        console.error(`   ❌ Erreur:`, error.message);
        return {
            success: false,
            error: error.message
        };
    }
}

async function testOllamaDirect(question) {
    console.log(`\n🧪 Test Ollama Direct: "${question}"`);
    console.log(`   URL: ${OLLAMA_URL}`);
    
    try {
        // Vérifier disponibilité
        const tagsResponse = await fetch(`${OLLAMA_URL}/api/tags`, {
            signal: AbortSignal.timeout(5000)
        });
        
        if (!tagsResponse.ok) {
            throw new Error(`Ollama non disponible: ${tagsResponse.status}`);
        }

        // Tester /api/chat
        const startTime = Date.now();
        const response = await fetch(`${OLLAMA_URL}/api/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'deepseek-coder:latest',
                messages: [
                    {
                        role: 'user',
                        content: question
                    }
                ],
                stream: false
            }),
            signal: AbortSignal.timeout(30000)
        });

        const duration = Date.now() - startTime;
        
        if (!response.ok) {
            const errorText = await response.text().catch(() => 'No error details');
            console.error(`   ❌ Erreur ${response.status}:`, errorText.substring(0, 200));
            return {
                success: false,
                error: errorText,
                status: response.status,
                duration
            };
        }

        const data = await response.json();
        const answer = data.message?.content || data.response || 'No response';
        console.log(`   ✅ Succès (${duration}ms)`);
        console.log(`   Réponse: ${answer.substring(0, 100)}...`);
        
        return {
            success: true,
            answer,
            duration
        };
    } catch (error) {
        console.error(`   ❌ Erreur:`, error.message);
        return {
            success: false,
            error: error.message
        };
    }
}

async function runTests() {
    console.log('🚀 DÉMARRAGE DES TESTS DU COACH AI\n');
    console.log('='.repeat(60));
    
    const results = {
        netlify: [],
        ollama: [],
        summary: {
            netlify: { success: 0, failed: 0 },
            ollama: { success: 0, failed: 0 }
        }
    };

    // Test 1: Netlify Function
    console.log('\n📡 TEST 1: NETLIFY FUNCTION');
    console.log('-'.repeat(60));
    
    for (const test of testQuestions) {
        const result = await testNetlifyCoach(test.question, test.contextType);
        results.netlify.push(result);
        
        if (result.success) {
            results.summary.netlify.success++;
        } else {
            results.summary.netlify.failed++;
        }
        
        // Attendre un peu entre les tests
        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Test 2: Ollama Direct (fallback)
    console.log('\n\n📡 TEST 2: OLLAMA DIRECT (FALLBACK)');
    console.log('-'.repeat(60));
    
    for (const test of testQuestions.slice(0, 1)) { // Un seul test pour Ollama
        const result = await testOllamaDirect(test.question);
        results.ollama.push(result);
        
        if (result.success) {
            results.summary.ollama.success++;
        } else {
            results.summary.ollama.failed++;
        }
    }

    // Résumé
    console.log('\n\n📊 RÉSUMÉ DES TESTS');
    console.log('='.repeat(60));
    console.log('\nNetlify Function:');
    console.log(`  ✅ Succès: ${results.summary.netlify.success}`);
    console.log(`  ❌ Échecs: ${results.summary.netlify.failed}`);
    
    console.log('\nOllama Direct:');
    console.log(`  ✅ Succès: ${results.summary.ollama.success}`);
    console.log(`  ❌ Échecs: ${results.summary.ollama.failed}`);
    
    // Recommandations
    console.log('\n\n💡 RECOMMANDATIONS');
    console.log('='.repeat(60));
    
    if (results.summary.netlify.success > 0) {
        console.log('✅ Netlify Function fonctionne - Configuration recommandée');
    } else {
        console.log('❌ Netlify Function ne fonctionne pas - Vérifier:');
        console.log('   1. Variables Netlify configurées (OLLAMA_URL, OLLAMA_MODEL)');
        console.log('   2. Fonction coach.ts déployée');
        console.log('   3. Netlify redéployé');
    }
    
    if (results.summary.ollama.success > 0) {
        console.log('✅ Ollama Direct fonctionne - Peut être utilisé comme fallback');
    } else {
        console.log('❌ Ollama Direct ne fonctionne pas - Problème mémoire identifié');
        console.log('   → Utiliser DeepSeek API comme fallback');
    }
    
    console.log('\n' + '='.repeat(60));
}

// Exécuter les tests
runTests().catch(console.error);


