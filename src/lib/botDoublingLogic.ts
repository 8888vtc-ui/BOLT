/**
 * Bot Decision Engine pour le Doubling Cube
 * Basé sur des heuristiques de backgammon professionnel
 */

export interface BotDoublingDecision {
    shouldDouble: boolean;
    shouldAccept: boolean;
    confidence: number; // 0-1
    reasoning: string;
}

/**
 * Évalue si le bot devrait proposer de doubler
 * @param winProbability Probabilité de victoire du bot (0-1)
 * @param equity Équité de la position
 * @param cubeValue Valeur actuelle du cube
 * @param matchScore Score du match (optionnel)
 * @param matchLength Longueur du match (0 = money game)
 * @returns Decision de doubler ou non
 */
export function shouldBotDouble(
    winProbability: number,
    equity: number,
    cubeValue: number,
    matchScore?: { bot: number; opponent: number },
    matchLength: number = 0
): boolean {
    // 1. Seuil de base pour doubler : ~65-70% de chances de gagner
    const DOUBLE_THRESHOLD = 0.68;

    // 2. Ne pas doubler si trop fort (risque de refus)
    // "Too good to double" : > 85% de chances
    const TOO_GOOD_THRESHOLD = 0.85;

    // 3. Ajustements selon la valeur du cube
    // Plus le cube est haut, plus on est prudent
    const cubeAdjustment = Math.min(cubeValue / 64, 0.1); // Max +10%
    const adjustedThreshold = DOUBLE_THRESHOLD + cubeAdjustment;

    // 4. Money Game vs Match Play
    if (matchLength === 0) {
        // Money game : stratégie standard
        return winProbability >= adjustedThreshold && winProbability < TOO_GOOD_THRESHOLD;
    } else {
        // Match play : considérer le score
        if (matchScore) {
            const botNeedsToWin = matchLength - matchScore.bot;
            const oppNeedsToWin = matchLength - matchScore.opponent;

            // Si on est proche de gagner le match, être plus agressif
            if (botNeedsToWin <= 2) {
                return winProbability >= 0.60;
            }

            // Si l'adversaire est proche de gagner, être plus conservateur
            if (oppNeedsToWin <= 2) {
                return winProbability >= 0.75;
            }
        }

        return winProbability >= adjustedThreshold && winProbability < TOO_GOOD_THRESHOLD;
    }
}

/**
 * Évalue si le bot devrait accepter une proposition de double
 * @param winProbability Probabilité de victoire du bot (0-1)
 * @param equity Équité de la position
 * @param cubeValue Valeur actuelle du cube (AVANT doublement)
 * @param matchScore Score du match (optionnel)
 * @param matchLength Longueur du match (0 = money game)
 * @returns Decision d'accepter ou refuser
 */
export function shouldBotAcceptDouble(
    winProbability: number,
    equity: number,
    cubeValue: number,
    matchScore?: { bot: number; opponent: number },
    matchLength: number = 0
): boolean {
    // 1. Seuil de base pour accepter : ~25% de chances de gagner
    // En dessous, il vaut mieux abandonner
    const ACCEPT_THRESHOLD = 0.25;

    // 2. Ajustements selon la valeur du cube
    // Plus le cube est haut, plus on est prudent (on accepte moins facilement)
    const cubeAdjustment = Math.min(cubeValue / 128, 0.05); // Max +5%
    const adjustedThreshold = ACCEPT_THRESHOLD + cubeAdjustment;

    // 3. Money Game vs Match Play
    if (matchLength === 0) {
        // Money game : stratégie standard
        return winProbability >= adjustedThreshold;
    } else {
        // Match play : considérer le score
        if (matchScore) {
            const botNeedsToWin = matchLength - matchScore.bot;
            const oppNeedsToWin = matchLength - matchScore.opponent;

            // Si on est très proche de gagner le match, accepter plus facilement
            // (on a moins à perdre)
            if (botNeedsToWin === 1) {
                return winProbability >= 0.20;
            }

            // Si l'adversaire est très proche de gagner, être plus conservateur
            if (oppNeedsToWin === 1) {
                return winProbability >= 0.35;
            }

            // Si le cube peut nous faire gagner le match directement
            const pointsIfWin = cubeValue * 2; // Valeur après doublement
            if (pointsIfWin >= botNeedsToWin) {
                // On accepte plus facilement si ça peut nous faire gagner
                return winProbability >= 0.22;
            }
        }

        return winProbability >= adjustedThreshold;
    }
}

/**
 * Évaluation complète de la décision du bot
 * @param winProbability Probabilité de victoire (0-1)
 * @param equity Équité de la position
 * @param cubeValue Valeur actuelle du cube
 * @param isOffered Si une proposition est en cours
 * @param matchScore Score du match
 * @param matchLength Longueur du match
 * @returns Décision complète avec raisonnement
 */
export function evaluateBotDoublingDecision(
    winProbability: number,
    equity: number,
    cubeValue: number,
    isOffered: boolean,
    matchScore?: { bot: number; opponent: number },
    matchLength: number = 0
): BotDoublingDecision {
    if (isOffered) {
        // Le bot doit décider d'accepter ou refuser
        const shouldAccept = shouldBotAcceptDouble(
            winProbability,
            equity,
            cubeValue,
            matchScore,
            matchLength
        );

        const confidence = Math.abs(winProbability - 0.25) * 2; // 0-1

        return {
            shouldDouble: false,
            shouldAccept,
            confidence,
            reasoning: shouldAccept
                ? `Acceptation : ${(winProbability * 100).toFixed(1)}% de chances de gagner (seuil: 25%)`
                : `Refus : ${(winProbability * 100).toFixed(1)}% de chances de gagner (trop faible)`
        };
    } else {
        // Le bot doit décider de proposer de doubler
        const shouldDouble = shouldBotDouble(
            winProbability,
            equity,
            cubeValue,
            matchScore,
            matchLength
        );

        const confidence = Math.abs(winProbability - 0.68) * 2; // 0-1

        return {
            shouldDouble,
            shouldAccept: false,
            confidence,
            reasoning: shouldDouble
                ? `Proposition de double : ${(winProbability * 100).toFixed(1)}% de chances de gagner`
                : winProbability > 0.85
                    ? `Trop fort pour doubler (${(winProbability * 100).toFixed(1)}%)`
                    : `Pas assez fort pour doubler (${(winProbability * 100).toFixed(1)}%)`
        };
    }
}
