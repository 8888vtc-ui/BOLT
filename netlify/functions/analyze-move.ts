import { Handler } from '@netlify/functions';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

export const handler: Handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    if (!OPENAI_API_KEY) {
        return { statusCode: 500, body: 'OpenAI API Key missing' };
    }

    try {
        const { boardState, dice, turn } = JSON.parse(event.body || '{}');

        // Prompt pour l'IA
        const prompt = `
      Tu es un Grand Maître de Backgammon (niveau expert mondial).
      Analyse la position suivante et donne le meilleur coup avec une explication pédagogique.
      
      État du jeu :
      - Joueur actuel : ${turn}
      - Dés : ${JSON.stringify(dice)}
      - Plateau (JSON) : ${JSON.stringify(boardState)}
      
      Format de réponse attendu (JSON uniquement) :
      {
        "bestMove": [{ "from": number, "to": number }],
        "explanation": "Texte court expliquant pourquoi ce coup est le meilleur (stratégie, probabilités, sécurité).",
        "winProbability": number (0-100)
      }
    `;

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: 'gpt-4o', // Ou gpt-3.5-turbo si gpt-4o pas dispo
                messages: [
                    { role: 'system', content: 'You are a Backgammon Grandmaster engine. Output JSON only.' },
                    { role: 'user', content: prompt }
                ],
                temperature: 0.2
            })
        });

        const data = await response.json();

        if (!data.choices || !data.choices[0]) {
            throw new Error('Invalid response from OpenAI');
        }

        const analysis = JSON.parse(data.choices[0].message.content);

        return {
            statusCode: 200,
            body: JSON.stringify(analysis)
        };

    } catch (error) {
        console.error('AI Analysis Error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to analyze move' })
        };
    }
};
