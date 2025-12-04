# Prompt pour Opus - Bug Critique : Bot Ne Joue Pas Automatiquement

## 🐞 Description du Bug

**Situation**: Après que le joueur termine son tour, le tour passe au bot (`guest → bot`), mais le bot ne joue pas automatiquement.

**Comportement attendu**: Le bot devrait automatiquement :
1. Lancer les dés quand c'est son tour
2. Jouer ses mouvements automatiquement
3. Passer le tour au joueur quand il a terminé

**Comportement actuel**: 
- Le tour change correctement (`[16:17:48] 🔄 [MOVE] Tour alterné: guest → bot`)
- Le bouton "Roll the dice" apparaît
- **MAIS** le bot ne lance pas les dés automatiquement
- **AUCUN** log du bot dans la console (pas de "🤖 Bot: Checking turn...")

---

## 🔎 Analyse du Bug

### Fichier concerné: `src/hooks/useGameSocket.ts`

**Ligne 1003**: Le code vérifie si c'est le tour du bot et devrait déclencher `performBotMove()`:

```typescript
if (isBotTurn && !botIsThinking.current && botAnalysisInProgress.current !== analysisKey) {
    // ... devrait déclencher performBotMove()
    performBotMove();
}
```

**Problème identifié**:
1. Le `useEffect` qui contient cette logique ne se déclenche peut-être pas quand le tour change
2. La condition `isBotTurn` pourrait ne pas être vraie même si `gameState.turn === 'bot'`
3. Le `useEffect` pourrait avoir des dépendances manquantes

### Logs manquants

Normalement, on devrait voir dans la console:
- `🤖 Bot: Checking turn...` (ligne 992)
- `🤖 Bot: Found X move(s)` (ligne 1183)
- `🤖 Bot: Playing move...` (ligne 1190)

**Aucun de ces logs n'apparaît**, ce qui indique que le `useEffect` ne se déclenche pas ou que `isBotTurn` est `false`.

---

## ✅ Correctif Attendu

### Option 1: Vérifier les dépendances du useEffect

Le `useEffect` qui gère le bot doit avoir `gameState.turn` dans ses dépendances pour se déclencher quand le tour change.

**Fichier**: `src/hooks/useGameSocket.ts`  
**Ligne**: ~965 (le useEffect qui contient la logique du bot)

**Vérifier que les dépendances incluent**:
- `gameState.turn`
- `gameState.dice`
- `players`

### Option 2: Ajouter un log de debug

Ajouter un log pour vérifier si le useEffect se déclenche:

```typescript
useEffect(() => {
    console.log('[BOT DEBUG] useEffect triggered', {
        currentTurn: gameState.turn,
        isBotTurn,
        botIsThinking: botIsThinking.current,
        analysisInProgress: botAnalysisInProgress.current
    });
    // ... reste du code
}, [gameState.turn, gameState.dice, players, ...]);
```

### Option 3: Vérifier la détection du bot

La logique de détection du bot (lignes 976-982) pourrait ne pas fonctionner correctement. Vérifier que:
- `botId` est correctement identifié
- `isBotTurn` est `true` quand `gameState.turn === 'bot'`

---

## 🧪 Tests Effectués

1. ✅ Tour change correctement après mouvement du joueur
2. ✅ Bouton "Roll the dice" apparaît (indique que c'est au bot)
3. ❌ Bot ne lance pas les dés automatiquement
4. ❌ Aucun log du bot dans la console
5. ❌ Le jeu reste bloqué sur le tour du bot

---

## 📊 Logs Capturés

```
[16:17:48] 🔄 [MOVE] Tour alterné: guest → bot
[16:17:48] Updating local game state...
[16:17:48] Local game state updated
```

**Logs attendus mais absents**:
- `🤖 Bot: Checking turn...`
- `🤖 Bot: Found X move(s)`
- `🤖 Bot: Playing move...`

---

## 🎯 Actions Attendues d'Opus

1. **Vérifier** que le `useEffect` du bot se déclenche quand `gameState.turn` change
2. **Corriger** les dépendances du `useEffect` si nécessaire
3. **Ajouter** des logs de debug pour diagnostiquer
4. **Tester** que le bot joue automatiquement après le tour du joueur
5. **Vérifier** que le bot lance les dés automatiquement
6. **Confirmer** que le bot joue ses mouvements correctement
7. **Commit et push** avec message clair

---

## 📝 Fichiers à Modifier

- `src/hooks/useGameSocket.ts` (lignes ~965-1285)

---

## ⚠️ Impact

**Sévérité**: Critique  
**Impact**: Le jeu est bloqué en mode offline-bot car le bot ne joue jamais automatiquement. Le joueur doit attendre indéfiniment.


