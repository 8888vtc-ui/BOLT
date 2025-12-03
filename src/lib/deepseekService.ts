/**
 * DeepSeek Coach Service - Utilise Ollama (GRATUIT) en priorité
 * Fallback vers DeepSeek API si Ollama non disponible
 * 
 * Configuration Ollama (GRATUIT):
 * - OLLAMA_URL: URL du serveur Ollama (Railway/Render)
 * - OLLAMA_MODEL: Modèle à utiliser (deepseek-coder par défaut)
 * 
 * Configuration DeepSeek API (Payant - Fallback):
 * - VITE_DEEPSEEK_API_KEY: Clé API DeepSeek (seulement si Ollama non disponible)
 */

// Configuration Ollama (GRATUIT - Priorité 1)
const OLLAMA_URL = import.meta.env.VITE_OLLAMA_URL || 'https://bot-production-b9d6.up.railway.app';
const OLLAMA_MODEL = import.meta.env.VITE_OLLAMA_MODEL || 'deepseek-coder';

// Configuration DeepSeek API (Payant - Fallback)
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
        return response.ok;
    } catch (error) {
        console.warn('[Ollama] Not available, using fallback');
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
        const response = await fetch(`${OLLAMA_URL}/api/generate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: OLLAMA_MODEL,
                prompt: `${systemPrompt}\n\n${userMessage}`,
                stream: false,
                options: {
                    temperature: 0.7,
                    num_predict: 500,
                    top_p: 0.9,
                    top_k: 40
                }
            }),
            signal: AbortSignal.timeout(30000) // Timeout 30s
        });

        if (!response.ok) {
            throw new Error(`Ollama API error: ${response.status}`);
        }

        const data = await response.json();
        const answer = data.response || 'No response from AI coach.';
        
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
            signal: AbortSignal.timeout(30000)
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
 * Ask DeepSeek coach a question
 * Utilise Ollama (GRATUIT) en priorité, fallback vers DeepSeek API
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

    // PRIORITÉ 1 : Utiliser Ollama (GRATUIT)
    const ollamaAvailable = await isOllamaAvailable();
    
    if (ollamaAvailable) {
        try {
            console.log('[AI Coach] Using Ollama (FREE)');
            return await askOllamaCoach(question, systemPrompt, userMessage);
        } catch (error: any) {
            console.warn('[AI Coach] Ollama failed, trying DeepSeek API fallback:', error.message);
            // Continue to fallback
        }
    }

    // PRIORITÉ 2 : Fallback vers DeepSeek API (si configuré)
    if (DEEPSEEK_API_KEY) {
        try {
            console.log('[AI Coach] Using DeepSeek API (fallback)');
            return await askDeepSeekAPICoach(question, systemPrompt, userMessage);
        } catch (error: any) {
            console.error('[AI Coach] DeepSeek API also failed:', error.message);
            return `Error: ${error.message || 'Failed to get response from AI coach.'}`;
        }
    }

    // Aucune option disponible
    return 'AI Coach is not configured. Please set VITE_OLLAMA_URL (recommended, FREE) or VITE_DEEPSEEK_API_KEY environment variable.';
}
