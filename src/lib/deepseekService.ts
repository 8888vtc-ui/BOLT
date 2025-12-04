/**
 * DeepSeek Coach Service - Utilise Netlify Function (RECOMMANDÉ)
 * Fallback vers appel direct Ollama si Netlify Function non disponible
 * 
 * Configuration Netlify Function (RECOMMANDÉ):
 * - VITE_COACH_API_URL: URL de la fonction Netlify coach (ex: https://botgammon.netlify.app/.netlify/functions/coach)
 * 
 * Configuration Ollama Directe (Fallback):
 * - VITE_OLLAMA_URL: URL du serveur Ollama (Railway/Render) - seulement si Netlify Function non disponible
 * - VITE_OLLAMA_MODEL: Modèle à utiliser (deepseek-coder par défaut)
 * 
 * Configuration DeepSeek API (Payant - Fallback):
 * - VITE_DEEPSEEK_API_KEY: Clé API DeepSeek (seulement si Ollama non disponible)
 */

// Configuration Netlify Function (RECOMMANDÉ - Priorité 1)
const COACH_API_URL = import.meta.env.VITE_COACH_API_URL || 'https://botgammon.netlify.app/.netlify/functions/coach';

// Configuration Ollama Directe (Fallback - Priorité 2)
const OLLAMA_URL = import.meta.env.VITE_OLLAMA_URL || 'https://bot-production-b9d6.up.railway.app';
const OLLAMA_MODEL = import.meta.env.VITE_OLLAMA_MODEL || 'deepseek-coder:latest';

// Configuration DeepSeek API (Payant - Fallback - Priorité 3)
const DEEPSEEK_API_URL = import.meta.env.VITE_DEEPSEEK_API_URL || 'https://api.deepseek.com/v1/chat/completions';
const DEEPSEEK_API_KEY = import.meta.env.VITE_DEEPSEEK_API_KEY;

export interface GameContext {
    board?: any;
    dice?: number[];
    cubeValue?: number;
    cubeOwner?: string | null;
    matchLength?: number;
    score?: { [playerId: string]: number };
}

export type ContextType = 'game' | 'rules' | 'strategy' | 'clubs' | 'tournaments';

/**
 * Vérifier si Ollama est disponible
 */
async function isOllamaAvailable(): Promise<boolean> {
    try {
        const response = await fetch(`${OLLAMA_URL}/api/tags`, {
            method: 'GET',
            signal: AbortSignal.timeout(5000) // Timeout 5s
        });
        const isAvailable = response.ok;
        console.log(`[Ollama] Availability check: ${isAvailable ? 'Available' : 'Not available'}`);
        return isAvailable;
    } catch (error) {
        console.warn('[Ollama] Not available, using fallback', error);
        return false;
    }
}

/**
 * Detect language from user question
 */
function detectLanguage(text: string): string {
    const frenchWords = ['comment', 'pourquoi', 'quand', 'où', 'commentaire', 'règle', 'stratégie'];
    const spanishWords = ['cómo', 'por qué', 'cuándo', 'dónde', 'regla', 'estrategia'];
    
    const lowerText = text.toLowerCase();
    
    if (frenchWords.some(word => lowerText.includes(word))) {
        return 'fr';
    }
    if (spanishWords.some(word => lowerText.includes(word))) {
        return 'es';
    }
    
    return 'en';
}

/**
 * Format game context for prompt
 */
function formatGameContext(context?: GameContext): string {
    if (!context) return '';
    
    let formatted = '';
    
    if (context.board) {
        formatted += `Current board position: ${JSON.stringify(context.board.points?.slice(0, 6))}...\n`;
    }
    
    if (context.dice && context.dice.length > 0) {
        formatted += `Dice rolled: ${context.dice.join(', ')}\n`;
    }
    
    if (context.cubeValue) {
        formatted += `Doubling cube value: ${context.cubeValue}\n`;
        if (context.cubeOwner) {
            formatted += `Cube owner: ${context.cubeOwner}\n`;
        }
    }
    
    if (context.matchLength) {
        formatted += `Match length: ${context.matchLength} points\n`;
    }
    
    if (context.score) {
        formatted += `Current score: ${JSON.stringify(context.score)}\n`;
    }
    
    return formatted;
}

/**
 * Get system prompt based on context type
 */
function getSystemPrompt(contextType: ContextType, language: string = 'en'): string {
    const prompts: Record<ContextType, Record<string, string>> = {
        game: {
            en: `You are an expert backgammon coach. Analyze the current game position and provide strategic advice. Be concise, clear, and helpful. Focus on the best moves and explain why.`,
            fr: `Tu es un expert en backgammon. Analyse la position actuelle du jeu et donne des conseils stratégiques. Sois concis, clair et utile. Concentre-toi sur les meilleurs coups et explique pourquoi.`,
            es: `Eres un experto en backgammon. Analiza la posición actual del juego y proporciona consejos estratégicos. Sé conciso, claro y útil. Enfócate en los mejores movimientos y explica por qué.`
        },
        rules: {
            en: `You are a backgammon rules expert. Explain the rules clearly and accurately. Answer questions about game mechanics, doubling cube, match play, money game, and all backgammon rules.`,
            fr: `Tu es un expert des règles du backgammon. Explique les règles clairement et avec précision. Réponds aux questions sur la mécanique du jeu, le cube de doublement, le match play, le money game et toutes les règles du backgammon.`,
            es: `Eres un experto en las reglas del backgammon. Explica las reglas de manera clara y precisa. Responde preguntas sobre la mecánica del juego, el cubo de doblaje, el juego por partidos, el juego de dinero y todas las reglas del backgammon.`
        },
        strategy: {
            en: `You are a backgammon master strategist. Provide advanced strategic advice, opening theory, middle game tactics, endgame techniques, and doubling cube strategy.`,
            fr: `Tu es un maître en stratégie de backgammon. Donne des conseils stratégiques avancés, la théorie d'ouverture, les tactiques de milieu de partie, les techniques de fin de partie et la stratégie du cube de doublement.`,
            es: `Eres un maestro estratega de backgammon. Proporciona consejos estratégicos avanzados, teoría de apertura, tácticas de medio juego, técnicas de finales y estrategia del cubo de doblaje.`
        },
        clubs: {
            en: `You are an expert at finding backgammon clubs. Help users find clubs near them, understand club culture, and provide information about local backgammon communities.`,
            fr: `Tu es un expert pour trouver des clubs de backgammon. Aide les utilisateurs à trouver des clubs près de chez eux, comprendre la culture des clubs et fournir des informations sur les communautés locales de backgammon.`,
            es: `Eres un experto en encontrar clubes de backgammon. Ayuda a los usuarios a encontrar clubes cerca de ellos, entender la cultura de los clubes y proporcionar información sobre las comunidades locales de backgammon.`
        },
        tournaments: {
            en: `You are an expert on backgammon tournaments. Help users find tournaments, understand tournament formats, explain rating systems, and provide information about major backgammon events.`,
            fr: `Tu es un expert des tournois de backgammon. Aide les utilisateurs à trouver des tournois, comprendre les formats de tournois, expliquer les systèmes de classement et fournir des informations sur les grands événements de backgammon.`,
            es: `Eres un experto en torneos de backgammon. Ayuda a los usuarios a encontrar torneos, entender los formatos de torneos, explicar los sistemas de clasificación y proporcionar información sobre los principales eventos de backgammon.`
        }
    };
    
    return prompts[contextType][language] || prompts[contextType]['en'];
}

/**
 * Ask coach using Ollama (GRATUIT)
 */
async function askOllamaCoach(
    question: string,
    systemPrompt: string,
    userMessage: string
): Promise<string> {
    try {
        // Essayer d'abord avec /api/chat (format recommandé pour les modèles de chat)
        const chatPayload = {
            model: OLLAMA_MODEL,
            messages: [
                {
                    role: 'system',
                    content: systemPrompt
                },
                {
                    role: 'user',
                    content: userMessage
                }
            ],
            stream: false,
            options: {
                temperature: 0.7,
                num_predict: 500,
                top_p: 0.9,
                top_k: 40
            }
        };

        console.log('[Ollama] Trying /api/chat endpoint...', { model: OLLAMA_MODEL });

        try {
            const chatResponse = await fetch(`${OLLAMA_URL}/api/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(chatPayload),
                signal: AbortSignal.timeout(45000) // Augmenter le timeout à 45s
            });

            if (chatResponse.ok) {
                const chatData = await chatResponse.json();
                const answer = chatData.message?.content || chatData.response || 'No response from AI coach.';
                console.log('[Ollama] Success with /api/chat');
                return answer.trim();
            }
        } catch (chatError) {
            console.log('[Ollama] /api/chat failed, trying /api/generate...', chatError);
        }

        // Fallback vers /api/generate avec format simplifié
        const generatePayload = {
            model: OLLAMA_MODEL,
            prompt: `${systemPrompt}\n\n${userMessage}`,
            stream: false,
            options: {
                temperature: 0.7,
                num_predict: 500
            }
        };

        console.log('[Ollama] Trying /api/generate endpoint...');

            const response = await fetch(`${OLLAMA_URL}/api/generate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(generatePayload),
            signal: AbortSignal.timeout(45000) // Augmenter le timeout à 45s
        });

        if (!response.ok) {
            const errorText = await response.text().catch(() => 'No error details');
            console.error('[Ollama] Error response:', response.status, errorText);
            
            // Dernier essai avec format minimal
            console.log('[Ollama] Trying minimal format...');
            const minimalPayload = {
                model: OLLAMA_MODEL,
                prompt: userMessage,
                stream: false
            };
            
            const retryResponse = await fetch(`${OLLAMA_URL}/api/generate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(minimalPayload),
                signal: AbortSignal.timeout(45000) // Augmenter le timeout à 45s
            });
            
            if (retryResponse.ok) {
                const retryData = await retryResponse.json();
                return (retryData.response || retryData.text || 'No response from AI coach.').trim();
            }
            
            throw new Error(`Ollama API error: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        const answer = data.response || data.text || 'No response from AI coach.';
        
        return answer.trim();
    } catch (error: any) {
        console.error('[Ollama] Error:', error);
        throw error;
    }
}

/**
 * Ask coach using DeepSeek API (Payant - Fallback)
 */
async function askDeepSeekAPICoach(
    question: string,
    systemPrompt: string,
    userMessage: string
): Promise<string> {
    if (!DEEPSEEK_API_KEY) {
        throw new Error('DeepSeek API key not configured');
    }

    try {
        const response = await fetch(DEEPSEEK_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
            },
            body: JSON.stringify({
                model: 'deepseek-chat',
                messages: [
                    {
                        role: 'system',
                        content: systemPrompt
                    },
                    {
                        role: 'user',
                        content: userMessage
                    }
                ],
                temperature: 0.7,
                max_tokens: 500
            }),
            signal: AbortSignal.timeout(45000) // Augmenter le timeout à 45s
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(`DeepSeek API error: ${response.status} ${errorData.error?.message || response.statusText}`);
        }

        const data = await response.json();
        const answer = data.choices?.[0]?.message?.content || 'No response from AI coach.';
        
        return answer;
    } catch (error: any) {
        console.error('[DeepSeek API] Error:', error);
        throw error;
    }
}

/**
 * Ask coach via Netlify Function (RECOMMANDÉ)
 */
async function askNetlifyCoach(
    question: string,
    gameContext?: GameContext,
    contextType: ContextType = 'game'
): Promise<string> {
    try {
        // Protection: vérifier que COACH_API_URL est défini
        if (!COACH_API_URL) {
            throw new Error('COACH_API_URL not configured');
        }

        const response = await fetch(COACH_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                question,
                gameContext,
                contextType
            }),
            signal: AbortSignal.timeout(45000) // Augmenter le timeout à 45s
        });

        if (!response.ok) {
            const errorText = await response.text().catch(() => 'No error details');
            let errorData;
            try {
                errorData = JSON.parse(errorText);
            } catch {
                errorData = { message: errorText };
            }
            throw new Error(`Netlify Coach API error: ${response.status} - ${errorData.message || errorData.error || response.statusText || errorText}`);
        }

        const data = await response.json();
        const answer = data.answer || data.message || data.response || 'No response from AI coach.';
        
        if (!answer || answer.trim() === '') {
            throw new Error('Empty response from AI coach');
        }
        
        return answer.trim();
    } catch (error: any) {
        console.error('[AI Coach] Netlify Function error:', error);
        // Si c'est une erreur de timeout, la propager avec un message clair
        if (error?.name === 'AbortError' || error?.message?.includes('timeout')) {
            throw new Error('Timeout: Le serveur prend trop de temps à répondre. Veuillez réessayer.');
        }
        throw error;
    }
}

/**
 * Ask DeepSeek coach a question
 * 
 * NOUVELLE PRIORITÉ (Ollama crash sur Railway - OOM):
 * PRIORITÉ 1 : DeepSeek API (stable et rapide)
 * PRIORITÉ 2 : Netlify Function (si DeepSeek non configuré)
 * PRIORITÉ 3 : Ollama Direct (désactivé par défaut - OOM sur Railway)
 */
export async function askDeepSeekCoach(
    question: string,
    gameContext?: GameContext,
    contextType: ContextType = 'game'
): Promise<string> {
    // Detect language from question
    const language = detectLanguage(question);
    
    // Build system prompt
    const systemPrompt = getSystemPrompt(contextType, language);
    
    // Format game context if available
    const contextInfo = formatGameContext(gameContext);
    
    // Build user message
    let userMessage = question;
    if (contextInfo && contextType === 'game') {
        userMessage = `${contextInfo}\n\nQuestion: ${question}`;
    }

    // PRIORITÉ 1 : Utiliser DeepSeek API (STABLE - Recommandé car Ollama crash sur Railway)
    if (DEEPSEEK_API_KEY) {
        try {
            console.log('[AI Coach] Using DeepSeek API (PRIORITY 1 - stable)');
            const response = await askDeepSeekAPICoach(question, systemPrompt, userMessage);
            console.log('[AI Coach] DeepSeek API response received');
            return response;
        } catch (error: any) {
            console.warn('[AI Coach] DeepSeek API failed, trying Netlify Function...', error.message);
            // Continue to fallback
        }
    } else {
        console.log('[AI Coach] DeepSeek API key not configured, trying Netlify Function...');
    }

    // PRIORITÉ 2 : Utiliser Netlify Function (appelle Ollama depuis le serveur)
    try {
        console.log('[AI Coach] Using Netlify Function (PRIORITY 2)');
        const response = await askNetlifyCoach(question, gameContext, contextType);
        console.log('[AI Coach] Netlify Function response received');
        return response;
    } catch (error: any) {
        console.warn('[AI Coach] Netlify Function failed:', error.message);
        // Continue to fallback
    }

    // PRIORITÉ 3 : Ollama Direct (DÉSACTIVÉ par défaut - OOM sur Railway)
    // Activer seulement si VITE_ENABLE_OLLAMA_DIRECT=true
    const enableOllamaDirect = import.meta.env.VITE_ENABLE_OLLAMA_DIRECT === 'true';
    
    if (enableOllamaDirect) {
        const ollamaAvailable = await isOllamaAvailable();
        
        if (ollamaAvailable) {
            try {
                console.log('[AI Coach] Using Ollama Direct (PRIORITY 3 - may crash on low RAM)');
                const response = await askOllamaCoach(question, systemPrompt, userMessage);
                console.log('[AI Coach] Ollama response received');
                return response;
            } catch (error: any) {
                console.error('[AI Coach] Ollama also failed:', error.message);
            }
        } else {
            console.log('[AI Coach] Ollama not available');
        }
    } else {
        console.log('[AI Coach] Ollama Direct disabled (OOM issues on Railway)');
    }

    // Aucune option disponible ou toutes ont échoué
    if (DEEPSEEK_API_KEY) {
        return 'Désolé, le coach AI rencontre des difficultés techniques. Veuillez réessayer plus tard.';
    }
    
    return 'AI Coach is not configured. Please set VITE_DEEPSEEK_API_KEY environment variable.';
}
