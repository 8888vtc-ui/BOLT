# Guide de Validation Étape par Étape

**Date**: 2025-12-03  
**Contexte**: Validation complète de l'initialisation du bot

---

## 🎯 Objectif

Valider chaque étape de l'initialisation et identifier précisément où se situe le problème.

---

## 📋 Procédure de Validation

### Étape 1: Ouvrir la Console de Débogage

1. Ouvrir le jeu dans le navigateur
2. Ouvrir la console développeur (F12)
3. Aller dans l'onglet **Console**
4. Filtrer les logs par `[BOT DEBUG]` ou `[JOIN_ROOM]`

---

### Étape 2: Lancer une Partie

1. Cliquer sur **"DÉFIER LE BOT"**
2. Observer les logs dans la console
3. Noter les erreurs et avertissements

---

### Étape 3: Vérifier l'Initialisation (Checklist)

#### ✅ Étape 3.1: Room

**Vérifier dans les logs**:
```
✅ [JOIN_ROOM] Room détectée: offline-bot
✅ [JOIN_ROOM] Room créée avec succès
```

**Si erreur**:
```
❌ CHANNEL_ERROR
❌ Room not found
```

**Action**: Vérifier la connexion Supabase ou le mode démo.

---

#### ✅ Étape 3.2: Joueurs

**Vérifier dans les logs**:
```
✅ [JOIN_ROOM] Joueurs créés: 2
✅ [JOIN_ROOM] Player 1: Invité (ID: guest)
✅ [JOIN_ROOM] Player 2: Bot IA (ID: bot)
```

**Si erreur**:
```
❌ [BOT DEBUG] Early return: not enough players
❌ players.length < 2
```

**Action**: Vérifier que les joueurs sont créés dans `joinRoom`.

---

#### ✅ Étape 3.3: Opening Roll

**Vérifier dans les logs**:
```
🎲 [OPENING ROLL] Joueur: X, Bot: Y
✅ [OPENING ROLL] Le bot commence (Y > X)
🎲 [JOIN_ROOM] Tour initial: bot (après opening roll)
```

**Si erreur**:
```
❌ Opening roll failed
❌ Tour initial non défini
```

**Action**: Vérifier la logique d'opening roll dans `joinRoom`.

---

#### ✅ Étape 3.4: GameState

**Vérifier dans les logs**:
```
✅ [JOIN_ROOM] État de jeu créé (bot)
✅ [JOIN_ROOM] Board FORCÉ avec INITIAL_BOARD
✅ [JOIN_ROOM] Terminé (bot offline) - INSTANTANÉ
```

**Si erreur**:
```
❌ [BOT DEBUG] Early return: missing room or gameState
❌ hasGameState: false
```

**Action**: Vérifier que `updateGame()` est appelé après création du gameState.

---

#### ✅ Étape 3.5: Board

**Vérifier dans les logs**:
```
✅ [BOT DEBUG] Checking initialization...
✅ [BOT DEBUG] Initialization complete!
✅ hasBoard: true
✅ hasPoints: true
✅ pointsLength: 24
✅ totalCheckers: 30
```

**Si erreur**:
```
❌ [BOT DEBUG] Early return: board not ready
❌ hasBoard: false
❌ hasPoints: false
❌ pointsLength: X (attendu: 24)
```

**Action**: 
1. Vérifier que `INITIAL_BOARD` est forcé dans `joinRoom`
2. Attendre le retry (10 tentatives, 5s max)
3. Vérifier les logs `initializationStatus`

---

### Étape 4: Vérifier le Retry

**Si `hasBoard: false` au début**, observer les logs de retry :

```
[BOT DEBUG] Waiting for initialization... (1/10)
[BOT DEBUG] Waiting for initialization... (2/10)
...
[BOT DEBUG] Initialization complete after retry!
```

**Si timeout**:
```
[BOT DEBUG] Initialization timeout - giving up
```

**Action**: Vérifier les logs `finalStatus` pour identifier le problème.

---

### Étape 5: Vérifier le Premier Tour

**Vérifier dans les logs**:
```
🎲 Dés lancés: [X, Y]
✅ Legal moves calculés: N coups
🤖 Bot: Found X move(s)
🤖 Bot: Playing move 1/X: from -> to
```

**Si erreur**:
```
❌ STATE UPDATE avec legalMovesCount: 0
❌ Dés non lancés
❌ AI Analysis Failed
```

**Action**: Vérifier que les dés sont lancés et que l'IA fonctionne.

---

## 🔍 Diagnostic Détaillé

### Problème: `hasBoard: false, hasPoints: false`

**Symptômes observés**:
- Plateau non prêt au début
- Bot retourne prématurément

**Diagnostic**:

1. **Vérifier les logs `[BOT DEBUG]`**:
   ```
   [BOT DEBUG] Early return: board not ready
   initializationStatus: {
       room: true,
       gameState: true,
       board: false,  // ← Problème ici
       points: false  // ← Problème ici
   }
   ```

2. **Vérifier les logs `[JOIN_ROOM]`**:
   ```
   ✅ [JOIN_ROOM] Board FORCÉ avec INITIAL_BOARD
   ✅ [JOIN_ROOM] Terminé (bot offline) - INSTANTANÉ
   ```

3. **Vérifier le timing**:
   - Le board devrait être créé **immédiatement** après `joinRoom`
   - Si `hasBoard: false` persiste, vérifier que `updateGame()` est appelé

**Solutions**:

1. **Vérifier le code** `joinRoom` dans `useGameSocket.ts`:
   ```typescript
   // Le board devrait être forcé ici
   if (!boardCheck.hasBoard || !boardCheck.hasPoints) {
       botState.board = JSON.parse(JSON.stringify(INITIAL_BOARD));
       updateGame(botState); // ← Doit être appelé immédiatement
   }
   ```

2. **Utiliser le retry**:
   - Le mécanisme de retry devrait résoudre le problème
   - Attendre jusqu'à 5 secondes

3. **Vérifier les dépendances du useEffect**:
   - Le useEffect devrait se redéclencher quand `gameState.board` change
   - Vérifier: `[gameState?.board, ...]`

---

### Problème: `CHANNEL_ERROR – Passage en mode démo`

**Symptômes observés**:
- Erreur de canal
- Passage automatique en mode démo

**Diagnostic**:

1. **Vérifier les variables d'environnement**:
   ```
   VITE_SUPABASE_URL=https://...
   VITE_SUPABASE_ANON_KEY=...
   ```

2. **Vérifier le mode réel**:
   ```typescript
   const DEMO_MODE = false; // Doit être false
   ```

3. **Vérifier les politiques RLS** dans Supabase

**Solutions**:

1. **Configurer Supabase**:
   - Vérifier que les variables sont définies
   - Vérifier que les politiques RLS sont correctes

2. **Activer le mode réel**:
   - Vérifier que `DEMO_MODE = false` dans tous les fichiers

---

### Problème: `STATE UPDATE avec legalMovesCount: 0`

**Symptômes observés**:
- Aucun coup légal calculé
- Bot ne peut pas jouer

**Diagnostic**:

1. **Vérifier les dés**:
   ```
   dice: []  // ← Problème: dés non lancés
   ```

2. **Vérifier le plateau**:
   ```
   board: {...}  // Vérifier que le plateau est valide
   ```

3. **Vérifier les legal moves**:
   ```
   legalMovesCount: 0  // ← Aucun coup possible
   ```

**Solutions**:

1. **Vérifier que les dés sont lancés**:
   - Le bot devrait lancer les dés au début de son tour
   - Vérifier les logs: `🎲 Dés lancés: [X, Y]`

2. **Vérifier l'état du plateau**:
   - Vérifier que le plateau est valide
   - Vérifier que les pions sont bien placés

3. **Vérifier la logique de calcul**:
   - Vérifier que `getValidMoves()` fonctionne correctement

---

## 📊 Tableau de Suivi

| Étape | Statut | Temps | Erreurs | Notes |
|-------|--------|-------|---------|-------|
| Room | ⬜ | - | - | - |
| Joueurs | ⬜ | - | - | - |
| Opening Roll | ⬜ | - | - | - |
| GameState | ⬜ | - | - | - |
| Board | ⬜ | - | - | - |
| Retry | ⬜ | - | - | - |
| Premier Tour | ⬜ | - | - | - |
| IA | ⬜ | - | - | - |
| Coups | ⬜ | - | - | - |

**Légende**:
- ⬜ Non vérifié
- ✅ Validé
- ❌ Erreur
- ⚠️ Avertissement

---

## ✅ Validation Finale

Une fois toutes les étapes validées :

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
- [ ] Aucune erreur critique

**Résultat**: ✅ Jeu fonctionnel

---

## 📝 Notes Importantes

1. **Les erreurs `hasBoard: false` au début sont normales** si elles se résolvent rapidement grâce au retry
2. **Le mécanisme de retry** devrait résoudre la plupart des problèmes d'initialisation
3. **Les logs `[BOT DEBUG]`** sont maintenant détaillés pour diagnostiquer les problèmes
4. **Le timing** est important : le board devrait être créé immédiatement après `joinRoom`

---

## 🚀 Actions Correctives Rapides

### Si `hasBoard: false` persiste

1. Vérifier les logs `[JOIN_ROOM]` pour voir si le board est forcé
2. Vérifier que `updateGame()` est appelé immédiatement
3. Attendre le retry (jusqu'à 5 secondes)
4. Vérifier les logs `initializationStatus` pour identifier le problème

### Si `CHANNEL_ERROR`

1. Vérifier les variables d'environnement Supabase
2. Vérifier que le mode réel est activé
3. Vérifier les politiques RLS dans Supabase

### Si `legalMovesCount: 0`

1. Vérifier que les dés sont lancés
2. Vérifier l'état du plateau
3. Vérifier la logique de calcul des legal moves

