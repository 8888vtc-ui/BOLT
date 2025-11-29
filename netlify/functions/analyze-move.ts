import { Handler } from '@netlify/functions';

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

interface AIResponse {
    bestMove: { from: number; to: number }[];
    explanation: string;
    winProbability: number;
}

const SYSTEM_PROMPT = `
You are a Backgammon Grandmaster engine. 
Analyze the position and provide the best move with a detailed pedagogical explanation.
Output JSON only.
Format:
{
  "bestMove": [{ "from": number, "to": number }],
  "explanation": "Detailed explanation...",
  "winProbability": number (0-100)
}
`;

async function callDeepSeek(prompt: string): Promise<AIResponse> {
    if (!DEEPSEEK_API_KEY) throw new Error('DeepSeek Key missing');
    console.log('Trying DeepSeek...');

    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${DEEPSEEK_API_KEY}` },
        body: JSON.stringify({
            model: 'deepseek-chat',
            messages: [
                { role: 'system', content: SYSTEM_PROMPT },
                { role: 'user', content: prompt }
            ],
            temperature: 0.1
        })
    });

    if (!response.ok) throw new Error(`DeepSeek Error: ${response.statusText}`);
    const data = await response.json();
    let content = data.choices[0].message.content;
    content = content.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(content);
}

async function callClaude(prompt: string): Promise<AIResponse> {
    if (!ANTHROPIC_API_KEY) throw new Error('Claude Key missing');
    console.log('Falling back to Claude...');

    const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': ANTHROPIC_API_KEY,
            'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
            model: 'claude-3-sonnet-20240229',
            max_tokens: 1024,
            system: SYSTEM_PROMPT,
            messages: [{ role: 'user', content: prompt }]
        })
    });

    if (!response.ok) throw new Error(`Claude Error: ${response.statusText}`);
    const data = await response.json();
    let content = data.content[0].text;
    content = content.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(content);
}

async function callOpenAI(prompt: string): Promise<AIResponse> {
    if (!OPENAI_API_KEY) throw new Error('OpenAI Key missing');
    console.log('Falling back to OpenAI...');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${OPENAI_API_KEY}` },
        body: JSON.stringify({
            model: 'gpt-4o',
            messages: [
                { role: 'system', content: SYSTEM_PROMPT },
                { role: 'user', content: prompt }
            ],
            temperature: 0.2
        })
    });

    if (!response.ok) throw new Error(`OpenAI Error: ${response.statusText}`);
    const data = await response.json();
    let content = data.choices[0].message.content;
    content = content.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(content);
}

export const handler: Handler = async (event) => {
    if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };

    try {
        const { boardState, dice, turn } = JSON.parse(event.body || '{}');
        const prompt = `
            Game State:
            - Current Player: ${turn}
            - Dice: ${JSON.stringify(dice)}
            - Board: ${JSON.stringify(boardState)}
        `;

        let analysis: AIResponse;

        // Fallback Strategy: DeepSeek -> Claude -> OpenAI
        try {
            analysis = await callDeepSeek(prompt);
        } catch (e1) {
            console.error(e1);
            try {
                analysis = await callClaude(prompt);
            } catch (e2) {
                console.error(e2);
                try {
                    analysis = await callOpenAI(prompt);
                } catch (e3) {
                    console.error(e3);
                    throw new Error('All AI providers failed');
                }
            }
        }

        return {
            statusCode: 200,
            body: JSON.stringify(analysis)
        };

    } catch (error) {
        console.error('AI Analysis Critical Failure:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({
                error: 'Failed to analyze move',
                details: error instanceof Error ? error.message : 'Unknown error'
            })
        };
    }
};
