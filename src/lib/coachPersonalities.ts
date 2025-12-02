/**
 * Coach Personalities
 * Formats analysis and advice for different coach personalities
 */

import { AIAnalysis } from './aiService';

export type Personality = 'strategist' | 'humorist';

/**
 * Format script for Strategist personality
 * Serious, technical, precise analysis
 */
function formatStrategistScript(analysis: AIAnalysis): string {
    let script = '';

    if (analysis.bestMove && analysis.bestMove.length > 0) {
        const moves = analysis.bestMove.map(m => `${m.from + 1} to ${m.to + 1}`).join(', ');
        script += `The optimal move is ${moves}. `;
    }

    if (analysis.strategicAdvice) {
        script += `${analysis.strategicAdvice.recommendedStrategy}. `;
        
        if (analysis.strategicAdvice.explanation) {
            script += `${analysis.strategicAdvice.explanation}. `;
        }

        if (analysis.strategicAdvice.riskLevel) {
            script += `Risk level: ${analysis.strategicAdvice.riskLevel}. `;
        }
    } else if (analysis.explanation) {
        script += analysis.explanation;
    }

    // Add win probability if available
    if (analysis.winProbability !== undefined) {
        script += ` Your win probability is ${analysis.winProbability.toFixed(1)} percent.`;
    }

    return script.trim();
}

/**
 * Format script for Humorist personality
 * Funny, relaxed, advice with humor
 */
function formatHumoristScript(analysis: AIAnalysis): string {
    let script = '';

    const humorPhrases = [
        "Alright, let's see what we've got here!",
        "Time to make some magic happen!",
        "Let's turn this game around!",
        "Here's the deal, my friend:",
        "Listen up, champ!"
    ];

    const randomPhrase = humorPhrases[Math.floor(Math.random() * humorPhrases.length)];
    script += `${randomPhrase} `;

    if (analysis.bestMove && analysis.bestMove.length > 0) {
        const moves = analysis.bestMove.map(m => `${m.from + 1} to ${m.to + 1}`).join(', ');
        script += `I'd go with ${moves}. `;
    }

    if (analysis.strategicAdvice) {
        // Add humor to the strategy
        const strategy = analysis.strategicAdvice.recommendedStrategy;
        script += `${strategy}. `;
        
        if (analysis.strategicAdvice.explanation) {
            script += `Here's why: ${analysis.strategicAdvice.explanation}. `;
        }

        // Add funny risk level comment
        if (analysis.strategicAdvice.riskLevel === 'high') {
            script += "This is a bit risky, but hey, fortune favors the bold! ";
        } else if (analysis.strategicAdvice.riskLevel === 'low') {
            script += "This is pretty safe, like wearing a helmet on a tricycle! ";
        }
    } else if (analysis.explanation) {
        script += analysis.explanation;
    }

    // Add win probability with humor
    if (analysis.winProbability !== undefined) {
        if (analysis.winProbability > 70) {
            script += ` You've got a ${analysis.winProbability.toFixed(1)}% chance of winning. Looking good!`;
        } else if (analysis.winProbability < 30) {
            script += ` Your win probability is ${analysis.winProbability.toFixed(1)}%. Don't worry, we've all been there!`;
        } else {
            script += ` Win probability: ${analysis.winProbability.toFixed(1)}%. It's anyone's game!`;
        }
    }

    // Add closing humor
    const closingPhrases = [
        "You've got this!",
        "Let's do this!",
        "Time to shine!",
        "Make it count!",
        "Go get 'em!"
    ];
    script += ` ${closingPhrases[Math.floor(Math.random() * closingPhrases.length)]}`;

    return script.trim();
}

/**
 * Format analysis script for HeyGen video generation
 * Optimized for video: short sentences, pauses, clear pronunciation
 */
export function formatScriptForPersonality(
    analysis: AIAnalysis,
    personality: Personality
): string {
    let script = '';

    switch (personality) {
        case 'strategist':
            script = formatStrategistScript(analysis);
            break;
        case 'humorist':
            script = formatHumoristScript(analysis);
            break;
        default:
            script = formatStrategistScript(analysis);
    }

    // Optimize for video: break into shorter sentences, add pauses
    // Replace long sentences with shorter ones
    script = script
        .replace(/\. /g, '. ')
        .replace(/, /g, ', ')
        .trim();

    // Ensure script is not too long (HeyGen has limits)
    if (script.length > 500) {
        script = script.slice(0, 497) + '...';
    }

    return script;
}

