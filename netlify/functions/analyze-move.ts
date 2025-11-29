import { Handler } from '@netlify/functions';

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;

export const handler: Handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    if (!DEEPSEEK_API_KEY) {
        return { statusCode: 500, body: 'DeepSeek API Key missing' };
    }

    try {
        const { boardState, dice, turn } = JSON.parse(event.body || '{}');

        // Prompt pour DeepSeek (Optimisé pour le raisonnement)
        const prompt = `
      Tu es un Grand Maître de Backgammon (niveau expert mondial).
      Analyse la position suivante et donne le meilleur coup avec une explication pédagogique détaillée.
      
      État du jeu :
      - Joueur actuel : ${turn}
      - Dés : ${JSON.stringify(dice)}
      - Plateau (JSON) : ${JSON.stringify(boardState)}
      
      Format de réponse attendu (JSON uniquement) :
      {
        "bestMove": [{ "from": number, "to": number }],
        "explanation": "Texte expliquant pourquoi ce coup est le meilleur (stratégie, probabilités, sécurité).",
        "winProbability": number (0-100)
      }
    `;

        const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
            },
            body: JSON.stringify({
                model: 'deepseek-chat',
                messages: [
                    { role: 'system', content: 'You are a Backgammon Grandmaster engine. Output JSON only.' },
                    { role: 'user', content: prompt }
                ],
                temperature: 0.1 // DeepSeek est plus précis avec une température basse
            })
        });

        const data = await response.json();

        if (!data.choices || !data.choices[0]) {
            console.error('DeepSeek Response:', data);
            throw new Error('Invalid response from DeepSeek');
        }

        // Nettoyage du markdown éventuel (```json ... ```)
        let content = data.choices[0].message.content;
        content = content.replace(/```json/g, '').replace(/```/g, '').trim();

        const analysis = JSON.parse(content);

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
