# 🧪 Guide de Test Rapide - Videau (Doubling Cube)

## ⚡ Tests Essentiels (5 minutes)

### Test 1 : Lancer une Partie ✅
```bash
# 1. Démarrer le serveur de développement
npm run dev

# 2. Ouvrir http://localhost:5173
# 3. Se connecter (ou jouer en tant qu'invité)
# 4. Cliquer sur "Jouer contre l'IA"
```

**Attendu :**
- ✅ Le plateau s'affiche
- ✅ Le cube est visible au centre (gris, valeur "1")
- ✅ Pas d'erreurs dans la console

---

### Test 2 : Proposer de Doubler (Joueur) ✅

**Étapes :**
1. Lancer les dés et jouer quelques coups
2. **AVANT** de lancer les dés au tour suivant
3. Chercher le bouton "DOUBLER (1 → 2)"
4. Cliquer dessus

**Attendu :**
- ✅ Modal "PROPOSITION DE DOUBLE !" apparaît
- ✅ Message "En attente de la réponse du Bot..."
- ✅ Le cube tourne (animation 3D)
- ✅ Après 1-2 secondes, le bot répond

**Si le bot ACCEPTE :**
- ✅ Message "Bot: J'accepte !"
- ✅ Le cube devient ROUGE (propriété du bot)
- ✅ La valeur passe à "2"
- ✅ Vous ne pouvez plus doubler (le bot possède le cube)

**Si le bot REFUSE :**
- ✅ Message "Bot: J'abandonne"
- ✅ Vous gagnez 1 point (valeur du cube avant doublement)
- ✅ Nouvelle partie commence

---

### Test 3 : Bot Propose de Doubler ✅

**Étapes :**
1. Jouer MAL volontairement (laisser le bot prendre l'avantage)
2. Attendre plusieurs tours
3. Observer le tour du bot

**Attendu :**
- ✅ Si le bot a ~70% de chances, il propose de doubler
- ✅ Message dans les logs : "🤖 Bot: Je propose de doubler !"
- ✅ Modal apparaît avec 2 boutons :
  - "✓ Accepter"
  - "✗ Abandonner"

**Si vous ACCEPTEZ :**
- ✅ Le cube devient DORÉ (vous possédez)
- ✅ La valeur double (ex: 1 → 2)
- ✅ Le bot ne peut plus doubler

**Si vous REFUSEZ :**
- ✅ Le bot gagne les points
- ✅ Nouvelle partie commence

---

### Test 4 : Vérifier les Règles ✅

**Test 4.1 : On ne peut pas doubler après avoir lancé les dés**
1. Lancer les dés
2. Chercher le bouton "DOUBLER"

**Attendu :**
- ✅ Le bouton n'est PAS visible
- ✅ Message : "Lancez les dés pour jouer"

**Test 4.2 : On ne peut pas doubler si l'adversaire possède le cube**
1. Accepter une proposition du bot
2. Attendre votre tour
3. Chercher le bouton "DOUBLER"

**Attendu :**
- ✅ Le bouton n'est PAS visible
- ✅ Message : "Bot possède le cube"

**Test 4.3 : Limite du cube à 64**
1. Doubler plusieurs fois (ou modifier manuellement dans le code)
2. Atteindre la valeur 64

**Attendu :**
- ✅ Le bouton "DOUBLER" disparaît
- ✅ Message : "Limite du cube atteinte (64)"

---

## 🔍 Vérifications Visuelles

### Couleurs du Cube
- ⚪ **Gris** : Cube au centre (personne ne possède)
- 🟡 **Doré** : Vous possédez le cube
- 🔴 **Rouge** : Le bot possède le cube

### Animations
- 🔄 Rotation 3D lors des propositions
- ✨ Hover effect sur les boutons
- 🎭 Modal avec glassmorphism

### Messages
- "🎲 Cube au centre"
- "✨ Vous possédez le cube"
- "⚠️ Bot possède le cube"
- "🔥 PROPOSITION DE DOUBLE !"

---

## 🐛 Debugging

### Ouvrir la Console du Navigateur (F12)

**Logs à chercher :**
```
🤖 Bot: Évaluation de la proposition de double...
🤖 Bot: J'accepte ! (32.5% de chances)
```

```
🤖 Bot: Je propose de doubler ! (71.2% de chances)
```

```
🤖 Bot: J'abandonne. (19.3% de chances, trop faible)
```

### Erreurs Communes

**Erreur : "Cannot read property 'cubeOwner' of undefined"**
- ❌ Le gameState n'est pas initialisé
- ✅ Solution : Vérifier que `createMockGameState` inclut `cubeOwner: null`

**Erreur : "DoublingCube is not defined"**
- ❌ Import incorrect
- ✅ Solution : Vérifier `import DoublingCube from '../components/game/DoublingCube'`

**Le bot ne répond jamais**
- ❌ Erreur dans l'analyse
- ✅ Solution : Vérifier les logs, l'API GNU Backgammon doit répondre

---

## 📊 Scénarios de Test Avancés

### Scénario A : Match Play (si implémenté)
```
1. Créer une partie en mode "Match to 5"
2. Jouer jusqu'à avoir un score de 4-3
3. Observer les décisions du bot (devrait être plus agressif)
```

### Scénario B : Doubles Multiples
```
1. Proposer de doubler (1 → 2)
2. Bot accepte
3. Attendre que le bot double (2 → 4)
4. Accepter
5. Doubler à nouveau (4 → 8)
6. Continuer jusqu'à 64
```

### Scénario C : Gammon avec Cube
```
1. Doubler à 4
2. Gagner avec un gammon
3. Vérifier que vous gagnez 4 × 2 = 8 points
```

---

## ✅ Checklist Finale

Avant de considérer le test complet :

- [ ] Le cube s'affiche correctement
- [ ] Je peux proposer de doubler
- [ ] Le bot répond aux propositions
- [ ] Le bot peut proposer de doubler
- [ ] Je peux accepter/refuser les propositions du bot
- [ ] Les couleurs changent selon le propriétaire
- [ ] Les règles sont respectées (timing, propriété, limite)
- [ ] Les animations fonctionnent
- [ ] Les messages sont clairs
- [ ] Pas d'erreurs dans la console
- [ ] La synchronisation fonctionne (si multijoueur)

---

## 🎯 Résultat Attendu

Si tous les tests passent :

```
✅ Videau 100% Fonctionnel
✅ Interface Premium
✅ Bot Intelligent
✅ Règles Respectées
✅ Prêt pour Production
```

---

## 🚀 Prochaine Étape

Une fois les tests validés :

1. **Déployer** sur un environnement de staging
2. **Inviter** des beta-testeurs
3. **Collecter** les retours
4. **Itérer** sur les seuils du bot si nécessaire
5. **Documenter** les cas limites rencontrés

---

**Bon test ! 🎲✨**
