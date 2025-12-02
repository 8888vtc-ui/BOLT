# Bot Doubling Logic - Implementation Complete ✅

## 📋 Résumé

Le bot peut maintenant **gérer intelligemment le videau** en utilisant des heuristiques de backgammon professionnel.

## 🧠 Logique de Décision

### Seuils de Décision (Basés sur la théorie du backgammon)

#### **Proposer de Doubler**
- **Seuil minimum** : 68% de chances de gagner
- **Seuil maximum** : 85% de chances (au-delà = "too good to double")
- **Ajustement** : +10% max selon la valeur du cube (plus prudent avec un cube élevé)

#### **Accepter un Double**
- **Seuil minimum** : 25% de chances de gagner
- **Ajustement** : +5% max selon la valeur du cube
- **En dessous** : Le bot abandonne (drop/pass)

### Ajustements Match Play

Le bot adapte sa stratégie selon le score du match :

1. **Bot proche de gagner** (besoin de 1-2 points)
   - Plus agressif pour doubler (60% au lieu de 68%)
   - Accepte plus facilement (20% au lieu de 25%)

2. **Adversaire proche de gagner**
   - Plus conservateur pour doubler (75% au lieu de 68%)
   - Accepte moins facilement (35% au lieu de 25%)

3. **Le cube peut faire gagner le match**
   - Accepte à 22% si les points gagnés suffisent

## 🎮 Flux de Jeu du Bot

### 1. **Début du Tour du Bot**

```
┌─────────────────────────────────┐
│ Proposition en attente ?        │
└────────┬────────────────────────┘
         │
    ┌────▼────┐
    │   OUI   │
    └────┬────┘
         │
    ┌────▼──────────────────────────┐
    │ Analyser la position          │
    │ Calculer winProbability       │
    └────┬──────────────────────────┘
         │
    ┌────▼────────────────────────┐
    │ winProbability >= 25% ?     │
    └────┬────────────────────────┘
         │
    ┌────▼────┐         ┌──────────┐
    │ Accepter│         │ Refuser  │
    │ (Take)  │         │ (Drop)   │
    └─────────┘         └──────────┘
```

### 2. **Si Pas de Proposition**

```
┌─────────────────────────────────┐
│ Dés déjà lancés ?               │
└────────┬────────────────────────┘
         │
    ┌────▼────┐
    │   NON   │
    └────┬────┘
         │
    ┌────▼──────────────────────────┐
    │ Peut doubler ?                │
    │ (cube owner, limite 64, etc.) │
    └────┬──────────────────────────┘
         │
    ┌────▼────────────────────────┐
    │ Analyser la position        │
    └────┬────────────────────────┘
         │
    ┌────▼────────────────────────┐
    │ 68% <= winProb < 85% ?      │
    └────┬────────────────────────┘
         │
    ┌────▼────┐         ┌──────────┐
    │ Doubler │         │ Passer   │
    │         │         │ (Roll)   │
    └─────────┘         └──────────┘
```

## 📊 Exemples de Décisions

### Scénario 1 : Bot a 72% de chances
```
Position : Avantage modéré
WinProb  : 72%
Equity   : +0.45
Cube     : 1

Décision : ✅ DOUBLER (1 → 2)
Raison   : Entre 68% et 85%, position idéale pour doubler
```

### Scénario 2 : Bot a 90% de chances
```
Position : Domination totale
WinProb  : 90%
Equity   : +0.85
Cube     : 2

Décision : ❌ NE PAS DOUBLER
Raison   : "Too good to double" - l'adversaire refusera
           Mieux vaut jouer pour un gammon/backgammon
```

### Scénario 3 : Adversaire double, Bot a 30%
```
Position : Léger désavantage
WinProb  : 30%
Equity   : -0.25
Cube     : 2 → 4

Décision : ✅ ACCEPTER
Raison   : 30% > 25% (seuil minimum)
           Encore des chances de retourner la partie
```

### Scénario 4 : Adversaire double, Bot a 18%
```
Position : Très mauvaise
WinProb  : 18%
Equity   : -0.65
Cube     : 4 → 8

Décision : ❌ ABANDONNER
Raison   : 18% < 25% (seuil minimum)
           Perdre 4 points vaut mieux que risquer 8
```

## 🔧 Implémentation Technique

### Fichiers Modifiés

1. **`src/lib/botDoublingLogic.ts`** ✨ NOUVEAU
   - `shouldBotDouble()` - Décision de proposer
   - `shouldBotAcceptDouble()` - Décision d'accepter
   - `evaluateBotDoublingDecision()` - Évaluation complète

2. **`src/hooks/useGameSocket.ts`** 🔧
   - Intégration dans la boucle de jeu du bot
   - Gestion des propositions reçues
   - Proposition automatique avant de lancer les dés

### Logs de Debug

Le bot affiche ses décisions dans la console :

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

## 🎯 Tests Recommandés

### Test 1 : Bot Propose de Doubler
1. Jouer contre le bot
2. Mettre le bot en position favorable (65-80% de chances)
3. Attendre son tour
4. **Attendu** : Le bot propose de doubler

### Test 2 : Bot Accepte un Double
1. Proposer de doubler au bot
2. S'assurer que le bot a ~30-40% de chances
3. **Attendu** : Le bot accepte

### Test 3 : Bot Refuse un Double
1. Proposer de doubler au bot
2. S'assurer que le bot a <20% de chances
3. **Attendu** : Le bot abandonne

### Test 4 : Bot "Too Good to Double"
1. Mettre le bot en position dominante (>85%)
2. **Attendu** : Le bot ne double pas, joue normalement

## 📈 Améliorations Futures

- [ ] **Variance Adjustment** : Ajouter un facteur aléatoire (±3%) pour rendre le bot moins prévisible
- [ ] **Position-Specific Logic** : Ajuster selon le type de position (race, blitz, prime, backgame)
- [ ] **Gammon Consideration** : Tenir compte des chances de gammon/backgammon
- [ ] **Cube Efficiency** : Calculer l'efficacité réelle du cube selon la position
- [ ] **Learning** : Enregistrer les décisions et résultats pour améliorer les seuils

## 🐛 Notes Techniques

- Les imports dynamiques évitent les dépendances circulaires
- Le bot attend 1.5s avant de répondre (UX réaliste)
- En cas d'erreur d'analyse, le bot accepte par défaut (pour ne pas bloquer)
- Les lints `equity` non utilisé sont normaux (prévu pour futures améliorations)

---

**Statut** : ✅ **FONCTIONNEL** - Le bot gère intelligemment le videau !
