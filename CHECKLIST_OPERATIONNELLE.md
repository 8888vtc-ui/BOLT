# Checklist Opérationnelle - Test et Validation

**Date**: 2025-12-03  
**Contexte**: Match Offline Bot (5 points) - Validation étape par étape

---

## 🎯 Objectif

Checklist opérationnelle pour tester et valider chaque étape (room, board, points, dés, coups) et déboguer efficacement.

---

## 📋 Préparation

### Étape 0: Configuration de l'Environnement

- [ ] Ouvrir le navigateur (Chrome/Firefox recommandé)
- [ ] Ouvrir la console développeur (F12)
- [ ] Aller dans l'onglet **Console**
- [ ] Filtrer les logs par `[BOT DEBUG]` ou `[JOIN_ROOM]`
- [ ] Ouvrir l'onglet **Network** pour surveiller les appels API
- [ ] Naviguer vers: `https://gurugammon-react.netlify.app/lobby`

**Vérification**:
```
✅ Console ouverte
✅ Filtre [BOT DEBUG] actif
✅ Network tab ouvert
✅ Page lobby chargée
```

---

## 🎮 Étape 1: Mise en Place du Jeu

### Action 1.1: Lancer une Partie

**Action**:
1. Cliquer sur le bouton **"DÉFIER LE BOT"**
2. Attendre la redirection vers la page de jeu
3. Observer les logs dans la console

**Logs attendus**:
```
✅ Creating training room...
✅ [JOIN_ROOM] Room détectée: offline-bot
✅ [JOIN_ROOM] Room créée avec succès
```

**Vérification**:
- [ ] URL contient `/game/offline-bot`
- [ ] Logs `[JOIN_ROOM]` visibles
- [ ] Pas d'erreur `CHANNEL_ERROR` immédiate

**Si erreur**:
```
❌ CHANNEL_ERROR – Passage en mode démo
```
→ Vérifier les variables d'environnement Supabase

---

### Action 1.2: Vérifier les Joueurs

**Action**:
1. Observer les logs `[JOIN_ROOM]`
2. Vérifier que 2 joueurs sont créés

**Logs attendus**:
```
✅ [JOIN_ROOM] Joueurs créés: 2
✅ [JOIN_ROOM] Player 1: Invité (ID: guest)
✅ [JOIN_ROOM] Player 2: Bot IA (ID: bot)
✅ Classement initial: 1500 chacun
```

**Vérification**:
- [ ] `players.length === 2`
- [ ] `players[0].id` = votre ID (ex: `guest`)
- [ ] `players[1].id` = `bot`
- [ ] Classement = 1500 pour chacun

**Si erreur**:
```
❌ [BOT DEBUG] Early return: not enough players
❌ players.length < 2
```
→ Vérifier la création des joueurs dans `joinRoom`

---

### Action 1.3: Vérifier l'Opening Roll

**Action**:
1. Observer les logs `[OPENING ROLL]`
2. Vérifier que le gagnant est déterminé

**Logs attendus**:
```
🎲 [OPENING ROLL] Joueur: 5, Bot: 5
🔄 [OPENING ROLL] Égalité (5 = 5), relance...
🎲 [OPENING ROLL] Joueur: 2, Bot: 1
✅ [OPENING ROLL] Le bot commence (2 > 1)
🎲 [JOIN_ROOM] Tour initial: bot (après opening roll)
```

**Vérification**:
- [ ] Opening roll effectué
- [ ] Gagnant déterminé (joueur ou bot)
- [ ] Tour initial défini selon le gagnant
- [ ] En cas d'égalité, relance effectuée

**Si erreur**:
```
❌ Opening roll failed
❌ Tour initial non défini
```
→ Vérifier la logique d'opening roll dans `joinRoom`

---

## 🧩 Étape 2: État du Plateau

### Action 2.1: Vérifier l'Initialisation du Board

**Action**:
1. Observer les logs `[JOIN_ROOM]` et `[BOT DEBUG]`
2. Vérifier que `hasBoard` et `hasPoints` passent à `true`

**Logs attendus**:
```
✅ [JOIN_ROOM] État de jeu créé (bot)
✅ [JOIN_ROOM] Board FORCÉ avec INITIAL_BOARD
✅ [JOIN_ROOM] Terminé (bot offline) - INSTANTANÉ
✅ [BOT DEBUG] Checking initialization...
✅ [BOT DEBUG] Initialization complete!
```

**Vérification**:
- [ ] `hasBoard: true` (pas `false`)
- [ ] `hasPoints: true` (pas `false`)
- [ ] `pointsLength: 24` (pas autre chose)
- [ ] `totalCheckers: 30` (15 blancs + 15 noirs)

**Si erreur au début** (normal si résolu rapidement):
```
⚠️ [BOT DEBUG] Early return: board not ready
⚠️ hasBoard: false, hasPoints: false
```
→ Attendre le retry (jusqu'à 5 secondes)

**Si erreur persistante**:
```
❌ [BOT DEBUG] Initialization timeout - giving up
❌ hasBoard: false (persiste)
```
→ Vérifier que `INITIAL_BOARD` est forcé dans `joinRoom`

---

### Action 2.2: Vérifier le Retry

**Action**:
1. Si `hasBoard: false` au début, observer les logs de retry
2. Compter les tentatives (max 10)

**Logs attendus**:
```
[BOT DEBUG] Waiting for initialization... (1/10)
[BOT DEBUG] Waiting for initialization... (2/10)
...
[BOT DEBUG] Initialization complete after retry!
```

**Vérification**:
- [ ] Retry fonctionne (tentatives visibles)
- [ ] Initialisation complète après retry
- [ ] Pas de timeout après 10 tentatives

**Si timeout**:
```
❌ [BOT DEBUG] Initialization timeout - giving up
❌ finalStatus: { board: false, points: false }
```
→ Vérifier les logs `initializationStatus` pour identifier le problème

---

### Action 2.3: Vérifier la Structure du Board

**Action**:
1. Dans la console, exécuter:
   ```javascript
   // Récupérer le gameState depuis le store
   const store = window.__GAME_STORE__; // Si exposé
   // Ou observer les logs [BOT DEBUG] avec initializationStatus
   ```

2. Vérifier les points initiaux:
   - Point 0: 2 pions blancs
   - Point 5: 5 pions noirs
   - Point 7: 3 pions noirs
   - Point 11: 5 pions blancs
   - Point 12: 5 pions noirs
   - Point 18: 3 pions blancs
   - Point 23: 2 pions noirs

**Vérification**:
- [ ] 24 points créés
- [ ] Points initiaux corrects
- [ ] Total = 30 pions (15 blancs + 15 noirs)

**Si erreur**:
```
❌ pointsLength !== 24
❌ totalCheckers !== 30
```
→ Vérifier que `INITIAL_BOARD` est correctement appliqué

---

## 🎲 Étape 3: Déroulement des Tours

### Action 3.1: Vérifier l'Alternance des Tours

**Action**:
1. Observer les logs `🤖 Bot:`
2. Vérifier que le bot annonce correctement son tour

**Logs attendus**:
```
🤖 Bot: C'est mon tour!
🤖 Bot: Ce n'est pas mon tour
🔄 [MOVE] Tour alterné: bot → guest
```

**Vérification**:
- [ ] Bot annonce correctement son tour
- [ ] Tour alterné après chaque coup
- [ ] Pas de confusion entre joueur et bot

**Si erreur**:
```
❌ Bot ne joue pas quand c'est son tour
❌ Tour non alterné
```
→ Vérifier la logique `isBotTurn` dans `useGameSocket.ts`

---

### Action 3.2: Vérifier le Lancer des Dés

**Action**:
1. Observer les logs `🎲` ou `Dés lancés`
2. Vérifier que les dés sont lancés au début de chaque tour

**Logs attendus**:
```
🎲 Dés lancés: [1, 6]
🎲 Dés lancés: [2, 4]
🎲 Dés lancés: [3, 3] (double)
```

**Vérification**:
- [ ] Dés lancés au début de chaque tour
- [ ] `gameState.dice.length === 2` (ou 4 pour double)
- [ ] Valeurs valides (entre 1 et 6)

**Si erreur**:
```
❌ Dés non lancés
❌ dice: []
❌ STATE UPDATE avec legalMovesCount: 0
```
→ Vérifier que le bot lance les dés au début de son tour

---

### Action 3.3: Vérifier le Calcul des Coups

**Action**:
1. Observer les logs `Legal moves` ou `STATE UPDATE`
2. Vérifier que les coups sont calculés

**Logs attendus**:
```
✅ Legal moves calculés: N coups
✅ STATE UPDATE avec legalMovesCount: N (N > 0)
```

**Vérification**:
- [ ] `legalMovesCount > 0` (sauf si aucun coup possible)
- [ ] Coups valides calculés
- [ ] Pas d'erreur `legalMovesCount: 0` sans raison

**Si erreur**:
```
❌ STATE UPDATE avec legalMovesCount: 0
❌ Legal moves non calculés
```
→ Vérifier que les dés sont lancés et que le plateau est valide

---

### Action 3.4: Vérifier l'Exécution des Coups

**Action**:
1. Observer les logs `🤖 Bot: Playing move`
2. Vérifier que les coups sont exécutés

**Logs attendus**:
```
🤖 Bot: Found 2 move(s)
🤖 Bot: Playing move 1/2: 23 -> 17 (dé: 6)
🤖 Bot: Playing move 2/2: 12 -> 11 (dé: 1)
✅ [MOVE] Tour alterné: bot → guest
```

**Vérification**:
- [ ] Coups exécutés correctement
- [ ] Dés consommés après chaque coup
- [ ] Plateau mis à jour
- [ ] Tour alterné après tous les coups

**Si erreur**:
```
❌ Move failed
❌ Dice not consumed
❌ Turn not alternated
```
→ Vérifier la logique d'exécution des coups dans `performBotMove`

---

## 🤖 Étape 4: Analyse IA

### Action 4.1: Vérifier l'Appel à l'API

**Action**:
1. Observer les logs `🤖 AI Service:`
2. Vérifier dans l'onglet **Network** les appels à l'API

**Logs attendus**:
```
🤖 AI Service: Calling BotGammon API...
🤖 AI Service: Raw Data received
```

**Network attendu**:
```
POST https://botgammon.netlify.app/.netlify/functions/analyze
Status: 200 OK
Response: { bestMoves: [...], evaluation: {...} }
```

**Vérification**:
- [ ] API appelée
- [ ] Réponse reçue (status 200)
- [ ] Données reçues (bestMoves, evaluation)

**Si erreur**:
```
❌ BotGammon API Error: 500
❌ AI Analysis Failed
❌ All retry attempts failed
```
→ Vérifier la configuration `VITE_BOT_API_URL` et `DEEPSEEK_API_KEY`

---

### Action 4.2: Vérifier les Probabilités

**Action**:
1. Observer les logs `evaluation` ou `winProbability`
2. Vérifier que les probabilités sont calculées

**Logs attendus**:
```
🤖 Bot: Equity: 0.123, Win: 52.3%
🤖 Bot: Gammon: 10.5%, Backgammon: 2.1%
```

**Vérification**:
- [ ] Probabilité de victoire calculée (0-100%)
- [ ] Probabilité de gammon calculée
- [ ] Probabilité de backgammon calculée
- [ ] Equity calculée

**Si erreur**:
```
❌ winProbability: undefined
❌ evaluation: null
```
→ Vérifier la réponse de l'API

---

### Action 4.3: Vérifier les Conseils Stratégiques

**Action**:
1. Observer les logs `strategicAdvice` ou `recommendedStrategy`
2. Vérifier que les conseils sont fournis

**Logs attendus**:
```
🧠 STRATÉGIE: CONSOLIDATE
📝 On joue la sécurité...
📝 On renforce notre prime...
```

**Vérification**:
- [ ] Conseils stratégiques fournis
- [ ] Scripts vocaux fournis
- [ ] Analyse de la position fournie

**Si erreur**:
```
❌ strategicAdvice: undefined
❌ No strategic advice
```
→ Vérifier que l'API retourne `strategicAdvice`

---

## ⚠️ Étape 5: Diagnostic des Problèmes

### Action 5.1: Identifier les Erreurs

**Action**:
1. Compter les erreurs dans la console
2. Noter les types d'erreurs:
   - `hasBoard: false, hasPoints: false`
   - `CHANNEL_ERROR`
   - `legalMovesCount: 0`
   - Autres erreurs

**Vérification**:
- [ ] Liste des erreurs créée
- [ ] Fréquence de chaque erreur notée
- [ ] Logs d'erreur capturés

---

### Action 5.2: Analyser les Désynchronisations

**Action**:
1. Observer les logs `STATE UPDATE`
2. Vérifier les incohérences entre client et serveur

**Logs à surveiller**:
```
⚠️ STATE UPDATE avec legalMovesCount: 0
⚠️ hasBoard: false (persiste)
⚠️ CHANNEL_ERROR – Passage en mode démo
```

**Vérification**:
- [ ] Désynchronisations identifiées
- [ ] Causes possibles notées
- [ ] Solutions proposées

---

### Action 5.3: Vérifier les Solutions

**Action**:
1. Pour chaque erreur, vérifier si la solution fonctionne:
   - Retry pour `hasBoard: false`
   - Configuration Supabase pour `CHANNEL_ERROR`
   - Vérification des dés pour `legalMovesCount: 0`

**Vérification**:
- [ ] Solutions testées
- [ ] Résultats notés
- [ ] Problèmes résolus ou en cours

---

## ✅ Étape 6: Validation Finale

### Action 6.1: Checklist Complète

**Vérification finale**:
- [ ] Room créée et active
- [ ] 2 joueurs créés
- [ ] Opening roll effectué
- [ ] GameState initialisé
- [ ] Board prêt (`hasBoard: true`, `hasPoints: true`)
- [ ] Retry fonctionne (si nécessaire)
- [ ] Dés lancés
- [ ] IA fonctionne
- [ ] Coups exécutés correctement
- [ ] Tour alterné
- [ ] Aucune erreur critique persistante

---

### Action 6.2: Rapport de Test

**Action**:
1. Créer un rapport avec:
   - Liste des étapes validées
   - Liste des erreurs détectées
   - Solutions appliquées
   - Résultats obtenus

**Format**:
```markdown
## Rapport de Test - [Date]

### Étapes Validées
- ✅ Room créée
- ✅ Joueurs créés
- ✅ Board initialisé
- ...

### Erreurs Détectées
- ⚠️ hasBoard: false (résolu par retry)
- ❌ CHANNEL_ERROR (en cours)
- ...

### Solutions Appliquées
- Retry mécanisme: ✅ Fonctionne
- Configuration Supabase: ⏳ En cours
- ...

### Résultat
✅ Jeu fonctionnel (avec quelques avertissements)
```

---

## 📊 Tableau de Suivi

| Étape | Action | Statut | Temps | Erreurs | Notes |
|-------|--------|--------|-------|---------|-------|
| 0. Préparation | Console ouverte | ⬜ | - | - | - |
| 1.1 | Lancer partie | ⬜ | - | - | - |
| 1.2 | Vérifier joueurs | ⬜ | - | - | - |
| 1.3 | Opening roll | ⬜ | - | - | - |
| 2.1 | Initialisation board | ⬜ | - | - | - |
| 2.2 | Retry | ⬜ | - | - | - |
| 2.3 | Structure board | ⬜ | - | - | - |
| 3.1 | Alternance tours | ⬜ | - | - | - |
| 3.2 | Lancer dés | ⬜ | - | - | - |
| 3.3 | Calcul coups | ⬜ | - | - | - |
| 3.4 | Exécution coups | ⬜ | - | - | - |
| 4.1 | Appel API | ⬜ | - | - | - |
| 4.2 | Probabilités | ⬜ | - | - | - |
| 4.3 | Conseils | ⬜ | - | - | - |
| 5.1 | Identifier erreurs | ⬜ | - | - | - |
| 5.2 | Analyser désync | ⬜ | - | - | - |
| 5.3 | Vérifier solutions | ⬜ | - | - | - |
| 6.1 | Checklist finale | ⬜ | - | - | - |
| 6.2 | Rapport de test | ⬜ | - | - | - |

**Légende**:
- ⬜ Non testé
- ✅ Validé
- ❌ Erreur
- ⚠️ Avertissement
- ⏳ En cours

---

## 🚀 Actions Rapides

### Si `hasBoard: false` persiste

1. **Vérifier les logs** `[JOIN_ROOM]`:
   ```
   ✅ [JOIN_ROOM] Board FORCÉ avec INITIAL_BOARD
   ```

2. **Attendre le retry** (jusqu'à 5 secondes):
   ```
   [BOT DEBUG] Waiting for initialization... (X/10)
   ```

3. **Vérifier les logs** `initializationStatus`:
   ```
   initializationStatus: {
       board: false,  // ← Problème
       points: false  // ← Problème
   }
   ```

---

### Si `CHANNEL_ERROR`

1. **Vérifier les variables**:
   ```
   VITE_SUPABASE_URL=...
   VITE_SUPABASE_ANON_KEY=...
   ```

2. **Vérifier le mode réel**:
   ```typescript
   const DEMO_MODE = false;
   ```

3. **Vérifier les politiques RLS** dans Supabase

---

### Si `legalMovesCount: 0`

1. **Vérifier les dés**:
   ```
   dice: [X, Y]  // Doit être non vide
   ```

2. **Vérifier le plateau**:
   ```
   board: {...}  // Doit être valide
   ```

3. **Vérifier la logique** de calcul des legal moves

---

## 📝 Notes Importantes

1. **Les erreurs `hasBoard: false` au début sont normales** si elles se résolvent rapidement grâce au retry
2. **Le mécanisme de retry** devrait résoudre la plupart des problèmes d'initialisation
3. **Les logs `[BOT DEBUG]`** sont maintenant détaillés pour diagnostiquer les problèmes
4. **Le timing** est important : le board devrait être créé immédiatement après `joinRoom`
5. **Les désynchronisations** peuvent être normales si elles se résolvent rapidement

---

## ✅ Résultat Attendu

Une fois toutes les étapes validées :

- ✅ Jeu fonctionnel
- ✅ Bot joue automatiquement
- ✅ IA fournit des conseils
- ✅ Coups exécutés correctement
- ✅ Tour alterné
- ⚠️ Quelques avertissements acceptables (si résolus rapidement)

