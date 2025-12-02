/**
 * DeepSeek API Service for Backgammon Coach
 * Provides contextual AI coaching based on game state, rules, or strategy
 */

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
 * Detect language from user question
 */
function detectLanguage(text: string): string {
    // Simple detection based on common words
    const frenchWords = ['comment', 'pourquoi', 'quand', 'où', 'commentaire', 'règle', 'stratégie'];
    const spanishWords = ['cómo', 'por qué', 'cuándo', 'dónde', 'regla', 'estrategia'];
    
    const lowerText = text.toLowerCase();
    
    if (frenchWords.some(word => lowerText.includes(word))) {
        return 'fr';
    }
    if (spanishWords.some(word => lowerText.includes(word))) {
        return 'es';
    }
    
    // Default to English
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
 * Ask DeepSeek coach a question
 */
export async function askDeepSeekCoach(
    question: string,
    gameContext?: GameContext,
    contextType: ContextType = 'game'
): Promise<string> {
    if (!DEEPSEEK_API_KEY) {
        console.warn('DeepSeek API key not configured');
        return 'AI Coach is not configured. Please set VITE_DEEPSEEK_API_KEY environment variable.';
    }

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
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(`DeepSeek API error: ${response.status} ${errorData.error?.message || response.statusText}`);
        }

        const data = await response.json();
        const answer = data.choices?.[0]?.message?.content || 'No response from AI coach.';
        
        return answer;
    } catch (error: any) {
        console.error('DeepSeek API error:', error);
        return `Error: ${error.message || 'Failed to get response from AI coach.'}`;
    }
}

