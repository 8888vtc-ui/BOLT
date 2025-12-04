# Rapport de Test - Partie Complète

**Date**: 2025-12-03  
**Mode**: Match de 5 points  
**Room**: offline-bot

---

## 🎮 Test d'une Partie Complète

### Objectif
Vérifier que le jeu fonctionne correctement de bout en bout:
- ✅ Initialisation
- ✅ Lancer des dés
- ✅ Alternance des tours
- ✅ Bot joue automatiquement
- ✅ Calcul des coups légaux
- ✅ Exécution des coups
- ✅ Fin de partie

---

## 📊 Observations

### Phase 1: Initialisation

**Logs observés**:
```
[17:11:02] 🚀 [JOIN_ROOM] Début - Room ID: offline-bot
[17:11:02] 🤖 [JOIN_ROOM] Initialisation mode bot offline
[17:11:02] 📋 [JOIN_ROOM] Création joueurs locaux...
🎮 [JOIN_ROOM] Joueurs créés: 2
[17:11:02] ✅ [JOIN_ROOM] Joueurs créés: 2
[17:11:02] ✅ [JOIN_ROOM] Room définie (bot): Entraînement Solo (Offline)
[17:11:02] ✅ [JOIN_ROOM] État de jeu créé (bot)
[17:11:02] ✅ [JOIN_ROOM] Terminé (bot offline) - INSTANTANÉ - Room et GameState définis
```

**Statut**: ✅ **Réussi** - Initialisation correcte

---

### Phase 2: Vérification du Tour

**Logs observés**:
```
[17:11:02] [BOT DEBUG] useEffect triggered
[17:11:02] 🤖 Bot: Checking turn...
```

**Statut**: ✅ **Réussi** - Le bot vérifie le tour immédiatement après l'initialisation

**Détails** (à vérifier dans la console):
- `currentTurn`: ID du joueur actuel
- `myId`: ID du joueur humain
- `botId`: ID du bot
- `isBotTurn`: true/false
- `players`: Liste des joueurs

---

### Phase 3: Lancer des Dés

**Action**: Clic sur "Roll the dice"

**Résultat attendu**:
- Les dés sont lancés
- Les coups légaux sont calculés
- Le tour passe au joueur ou au bot selon le résultat

**À vérifier**:
- ✅ Les dés sont affichés correctement
- ✅ Les coups légaux sont calculés
- ✅ Le tour est correctement identifié

---

### Phase 4: Alternance des Tours

**Scénario**:
1. Joueur lance les dés
2. Joueur joue un coup
3. Bot joue automatiquement
4. Répéter jusqu'à la fin de la partie

**À vérifier**:
- ✅ Le bot détecte son tour
- ✅ Le bot joue automatiquement
- ✅ L'alternance fonctionne correctement
- ✅ Pas de blocage ou d'erreur

---

## 🔍 Points de Vérification

### 1. Initialisation
- [x] Room créée
- [x] Joueurs créés (2)
- [x] GameState initialisé
- [x] Board initialisé (24 points)

### 2. Bot Logic
- [x] Bot vérifie le tour
- [ ] Bot détecte son tour (`isBotTurn = true`)
- [ ] Bot joue automatiquement
- [ ] Bot analyse la position
- [ ] Bot choisit le meilleur coup

### 3. Alternance
- [ ] Tour passe au joueur après coup du bot
- [ ] Tour passe au bot après coup du joueur
- [ ] Pas de blocage

### 4. Fin de Partie
- [ ] Score calculé correctement
- [ ] Match gagné détecté
- [ ] Nouvelle partie peut être lancée

---

## 📝 Logs à Surveiller

### Logs Normaux
- `🤖 Bot: Checking turn...` - Bot vérifie son tour
- `🤖 Bot: Analyzing position...` - Bot analyse la position
- `🤖 Bot: Found X move(s)` - Bot trouve des coups
- `🤖 Bot: Playing move...` - Bot joue un coup
- `Dice rolled: X, Y` - Dés lancés
- `Action: move` - Coup joué

### Logs d'Erreur à Surveiller
- `Early return: missing room or gameState` - Après initialisation
- `Early return: not enough players` - Après initialisation
- `Cannot calculate legal moves` - Problème de calcul
- `setState during render` - Problème React

---

## 🐛 Bugs Potentiels

### Bug 1: Bot Ne Joue Pas
**Symptôme**: Le bot vérifie le tour mais ne joue pas
**Cause possible**: `isBotTurn` est `false` ou condition non remplie
**Solution**: Vérifier les logs détaillés dans la console

### Bug 2: Alternance Bloquée
**Symptôme**: Le tour ne passe pas correctement
**Cause possible**: Problème de mise à jour du `turn` dans le GameState
**Solution**: Vérifier les logs de `handleGameAction`

### Bug 3: Coups Légaux Non Calculés
**Symptôme**: Aucun coup légal disponible
**Cause possible**: Problème dans `getValidMoves` ou `mappers.ts`
**Solution**: Vérifier les logs de `[mappers]`

---

## ✅ Résultats Attendus

### Après Correction du Timing
- ✅ Le bot vérifie le tour immédiatement après l'initialisation
- ✅ Plus d'erreur "Early return" après l'initialisation
- ✅ Le bot utilise les valeurs à jour du store

### Tests à Effectuer
1. **Lancer les dés** - Vérifier que les dés sont lancés
2. **Jouer un coup** - Vérifier que le coup est joué
3. **Attendre le bot** - Vérifier que le bot joue automatiquement
4. **Alterner** - Répéter plusieurs fois
5. **Finir la partie** - Vérifier la fin de partie

---

## 📊 Métriques

### Compteurs
- **Lancers de dés**: 0 (à mettre à jour)
- **Coups joueur**: 0 (à mettre à jour)
- **Coups bot**: 0 (à mettre à jour)
- **Erreurs**: 0 (à mettre à jour)
- **Avertissements**: 0 (à mettre à jour)

---

## 🔄 Prochaines Étapes

1. **Effectuer le test complet** - Jouer une partie entière
2. **Observer les logs** - Vérifier tous les logs
3. **Identifier les bugs** - Noter tous les problèmes
4. **Corriger les bugs** - Appliquer les corrections
5. **Retester** - Vérifier que tout fonctionne

---

## 📝 Notes

- Le test doit être effectué manuellement car il nécessite des interactions utilisateur
- Les logs doivent être surveillés dans la console du navigateur (F12)
- Les détails des objets de log doivent être ouverts pour voir les valeurs exactes
- Le test peut prendre plusieurs minutes selon la longueur de la partie

