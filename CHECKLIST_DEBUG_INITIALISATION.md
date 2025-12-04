# Checklist de Débogage - Initialisation Bot

**Date**: 2025-12-03  
**Contexte**: Match Offline Bot (5 points) - Problèmes d'initialisation détectés

---

## 🎯 Objectif

Valider que chaque étape de l'initialisation fonctionne correctement et identifier les problèmes de synchronisation client/serveur.

---

## ✅ Checklist de Validation

### Étape 1: Création de la Room

**Vérifications**:
- [ ] Room `offline-bot` détectée
- [ ] Room créée avec succès
- [ ] `currentRoom.id === 'offline-bot'`
- [ ] `currentRoom.status === 'playing'` (ou équivalent)

**Logs attendus**:
```
✅ [JOIN_ROOM] Room détectée: offline-bot
✅ [JOIN_ROOM] Room créée avec succès
```

**Logs d'erreur à surveiller**:
```
❌ CHANNEL_ERROR
❌ Room not found
❌ Failed to create room
```

---

### Étape 2: Création des Joueurs

**Vérifications**:
- [ ] 2 joueurs créés : `Invité` (vous) et `Bot IA`
- [ ] `players.length === 2`
- [ ] `players[0].id` = votre ID (ex: `guest` ou `guest-1`)
- [ ] `players[1].id` = `bot` ou ID du bot
- [ ] Classement initial : **1500** chacun

**Logs attendus**:
```
✅ [JOIN_ROOM] Joueurs créés: 2
✅ [JOIN_ROOM] Player 1: Invité (ID: guest)
✅ [JOIN_ROOM] Player 2: Bot IA (ID: bot)
```

**Logs d'erreur à surveiller**:
```
❌ [BOT DEBUG] Early return: not enough players
❌ players.length < 2
```

---

### Étape 3: Opening Roll (Lancer Initial)

**Vérifications**:
- [ ] Opening roll effectué
- [ ] Dés lancés pour le joueur et le bot
- [ ] Gagnant déterminé (joueur ou bot)
- [ ] Tour initial défini selon le gagnant
- [ ] En cas d'égalité, relance effectuée

**Logs attendus**:
```
🎲 [OPENING ROLL] Joueur: X, Bot: Y
✅ [OPENING ROLL] Le bot commence (Y > X)
🎲 [JOIN_ROOM] Tour initial: bot (après opening roll)
```

**Logs d'erreur à surveiller**:
```
❌ Opening roll failed
❌ Tour initial non défini
```

---

### Étape 4: Initialisation du GameState

**Vérifications**:
- [ ] `gameState` créé
- [ ] `gameState.turn` défini (joueur ou bot)
- [ ] `gameState.dice` initialisé (vide au début)
- [ ] `gameState.board` créé
- [ ] `gameState.board.points` créé avec 24 points
- [ ] `gameState.board.points.length === 24`
- [ ] `gameState.board.bar` créé
- [ ] `gameState.board.off` créé

**Logs attendus**:
```
✅ [JOIN_ROOM] État de jeu créé (bot)
✅ [JOIN_ROOM] Board FORCÉ avec INITIAL_BOARD
✅ [JOIN_ROOM] Terminé (bot offline) - INSTANTANÉ
```

**Logs d'erreur à surveiller**:
```
❌ [BOT DEBUG] Early return: missing room or gameState
❌ hasBoard: false
❌ hasPoints: false
❌ pointsLength !== 24
```

---

### Étape 5: Validation du Board

**Vérifications**:
- [ ] `hasBoard === true`
- [ ] `hasPoints === true`
- [ ] `points.length === 24`
- [ ] Chaque point a `player` (1, 2, ou null) et `count` (nombre de pions)
- [ ] Total des pions = 30 (15 blancs + 15 noirs)
- [ ] Points initiaux corrects :
  - Point 0: 2 pions blancs
  - Point 5: 5 pions noirs
  - Point 7: 3 pions noirs
  - Point 11: 5 pions blancs
  - Point 12: 5 pions noirs
  - Point 18: 3 pions blancs
  - Point 23: 2 pions noirs

**Logs attendus**:
```
✅ [BOT DEBUG] Checking initialization...
✅ [BOT DEBUG] Initialization complete!
✅ hasBoard: true
✅ hasPoints: true
✅ pointsLength: 24
✅ totalCheckers: 30
```

**Logs d'erreur à surveiller**:
```
❌ [BOT DEBUG] Early return: board not ready
❌ hasBoard: false
❌ hasPoints: false
❌ pointsLength: X (attendu: 24)
❌ totalCheckers: X (attendu: 30)
```

---

### Étape 6: Premier Tour (Lancer des Dés)

**Vérifications**:
- [ ] Dés lancés pour le joueur actif
- [ ] `gameState.dice.length === 2` (ou 4 pour double)
- [ ] Dés valides (valeurs entre 1 et 6)
- [ ] Legal moves calculés
- [ ] `legalMovesCount > 0` (sauf si aucun coup possible)

**Logs attendus**:
```
🎲 Dés lancés: [X, Y]
✅ Legal moves calculés: N coups
```

**Logs d'erreur à surveiller**:
```
❌ STATE UPDATE avec legalMovesCount: 0
❌ Dés non lancés
❌ Legal moves non calculés
```

---

### Étape 7: Analyse IA

**Vérifications**:
- [ ] BotGammon API appelée
- [ ] Réponse reçue avec succès
- [ ] Probabilités calculées (win, gammon, backgammon)
- [ ] Meilleurs coups fournis
- [ ] Conseils stratégiques fournis

**Logs attendus**:
```
🤖 AI Service: Calling BotGammon API...
🤖 AI Service: Raw Data received
🤖 Bot: Found X move(s)
🤖 Bot: Playing move 1/X: from -> to
```

**Logs d'erreur à surveiller**:
```
❌ BotGammon API Error
❌ AI Analysis Failed
❌ No moves found
```

---

### Étape 8: Exécution des Coups

**Vérifications**:
- [ ] Coups exécutés correctement
- [ ] Dés consommés après chaque coup
- [ ] Plateau mis à jour
- [ ] Tour alterné après tous les coups joués
- [ ] Logs de déplacement corrects (ex: `0→6`, `11→12`)

**Logs attendus**:
```
🤖 Bot: Playing move 1/2: 23 -> 17 (dé: 6)
🤖 Bot: Playing move 2/2: 12 -> 11 (dé: 1)
✅ [MOVE] Tour alterné: bot → guest
```

**Logs d'erreur à surveiller**:
```
❌ Move failed
❌ Dice not consumed
❌ Turn not alternated
```

---

## 🔍 Diagnostic des Problèmes

### Problème 1: `hasBoard: false, hasPoints: false`

**Symptômes**:
- Plateau non prêt au début
- Bot retourne prématurément

**Causes possibles**:
1. `gameState.board` non créé lors de `joinRoom`
2. `updateGame()` appelé avant que le board soit initialisé
3. Désynchronisation client/serveur

**Solutions**:
1. Vérifier que `INITIAL_BOARD` est forcé dans `joinRoom`
2. Vérifier que `updateGame()` est appelé après création du board
3. Utiliser le mécanisme de retry (10 tentatives, 5s max)

**Logs de diagnostic**:
```
[BOT DEBUG] Early return: board not ready
initializationStatus: {
    room: true,
    gameState: true,
    board: false,  // ← Problème ici
    points: false  // ← Problème ici
}
```

---

### Problème 2: `CHANNEL_ERROR – Passage en mode démo`

**Symptômes**:
- Erreur de canal
- Passage automatique en mode démo

**Causes possibles**:
1. Connexion Supabase échouée
2. Channel non créé
3. Mode réel non configuré correctement

**Solutions**:
1. Vérifier `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY`
2. Vérifier que le mode réel est activé (`DEMO_MODE = false`)
3. Vérifier les politiques RLS dans Supabase

**Logs de diagnostic**:
```
❌ CHANNEL_ERROR
⚠️ Passage en mode démo
```

---

### Problème 3: `STATE UPDATE avec legalMovesCount: 0`

**Symptômes**:
- Aucun coup légal calculé
- Bot ne peut pas jouer

**Causes possibles**:
1. Dés non lancés
2. Plateau bloqué
3. Calcul des legal moves incorrect

**Solutions**:
1. Vérifier que les dés sont lancés
2. Vérifier l'état du plateau
3. Vérifier la logique de calcul des legal moves

**Logs de diagnostic**:
```
⚠️ STATE UPDATE avec legalMovesCount: 0
dice: []
board: {...}
```

---

## 📊 Tableau de Validation

| Étape | Statut | Logs | Erreurs |
|-------|--------|------|---------|
| 1. Room | ⬜ | `[JOIN_ROOM] Room créée` | `CHANNEL_ERROR` |
| 2. Joueurs | ⬜ | `Joueurs créés: 2` | `not enough players` |
| 3. Opening Roll | ⬜ | `[OPENING ROLL]` | `Opening roll failed` |
| 4. GameState | ⬜ | `État de jeu créé` | `missing gameState` |
| 5. Board | ⬜ | `hasBoard: true` | `hasBoard: false` |
| 6. Dés | ⬜ | `Dés lancés: [X, Y]` | `Dés non lancés` |
| 7. IA | ⬜ | `AI Service: Calling...` | `AI Analysis Failed` |
| 8. Coups | ⬜ | `Playing move X/Y` | `Move failed` |

**Légende**:
- ⬜ Non vérifié
- ✅ Validé
- ❌ Erreur détectée
- ⚠️ Avertissement

---

## 🚀 Actions Correctives

### Si `hasBoard: false` ou `hasPoints: false`

1. **Vérifier les logs** `[BOT DEBUG]` pour voir l'état d'initialisation
2. **Attendre le retry** (10 tentatives, 5s max)
3. **Vérifier** que `INITIAL_BOARD` est forcé dans `joinRoom`
4. **Vérifier** que `updateGame()` est appelé après création du board

### Si `CHANNEL_ERROR`

1. **Vérifier** les variables d'environnement Supabase
2. **Vérifier** que le mode réel est activé
3. **Vérifier** les politiques RLS dans Supabase

### Si `legalMovesCount: 0`

1. **Vérifier** que les dés sont lancés
2. **Vérifier** l'état du plateau
3. **Vérifier** la logique de calcul des legal moves

---

## 📝 Notes

- Les logs `[BOT DEBUG]` sont maintenant détaillés pour diagnostiquer les problèmes
- Le mécanisme de retry devrait résoudre la plupart des problèmes d'initialisation
- Les erreurs `hasBoard: false` au début sont normales si elles se résolvent rapidement

---

## ✅ Validation Finale

Une fois toutes les étapes validées :

- [ ] Room créée et active
- [ ] 2 joueurs créés
- [ ] Opening roll effectué
- [ ] GameState initialisé
- [ ] Board prêt (`hasBoard: true`, `hasPoints: true`)
- [ ] Dés lancés
- [ ] IA fonctionne
- [ ] Coups exécutés correctement
- [ ] Tour alterné
- [ ] Aucune erreur critique

**Résultat**: ✅ Jeu fonctionnel


