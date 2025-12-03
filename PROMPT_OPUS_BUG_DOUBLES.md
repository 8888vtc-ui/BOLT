# Prompt pour Opus - Bug Critique : Doubles Non Joués Correctement

## 🐞 Description du Bug

**Situation**: Le joueur obtient un double (ex: double 1 = [1,1,1,1])

**Règle attendue**: Un double doit être joué **4 fois** (4 × 1 = quatre déplacements d'une case)

**Comportement actuel**: Le système n'exécute qu'**un seul déplacement** (1 × 1), puis bloque le tour

---

## 🔎 Analyse du Bug

### Problème Identifié

Le bug se trouve dans **`src/board/utils/mappers.ts`** ligne 272-273.

**Code défectueux**:
```typescript
if (gameState.dice.length === 4) {
    diceForMoves = [gameState.dice[0], gameState.dice[1]]; // ❌ ERREUR: Utilise seulement 2 dés
}
```

**Problème**: 
- Quand un double est lancé, `rollDice()` retourne correctement `[1,1,1,1]` (4 dés)
- Mais `mappers.ts` extrait seulement `[1,1]` (2 dés) pour le calcul des legal moves
- Résultat: Le système ne voit que 2 mouvements possibles au lieu de 4
- Après le premier mouvement, il reste `[1,1,1]` mais le système pense qu'il n'y a plus de mouvements

### Cause Racine

La logique d'extraction des dés pour les doubles était incorrecte :
- **Avant**: `[gameState.dice[0], gameState.dice[1]]` → 2 dés seulement
- **Après**: `[...gameState.dice]` → Tous les 4 dés

---

## ✅ Correctif Appliqué

### Fichier: `src/board/utils/mappers.ts`

**Correction**:
```typescript
// Get dice values for move calculation - handle various formats
let diceForMoves: number[] = [];
if (gameState.dice) {
    if (Array.isArray(gameState.dice)) {
        // CRITICAL FIX: Pour un double, utiliser TOUS les dés (4 dés)
        // Un double [1,1,1,1] doit permettre 4 mouvements, pas seulement 2
        if (gameState.dice.length === 4) {
            // Double: utiliser tous les 4 dés pour permettre 4 mouvements
            diceForMoves = [...gameState.dice]; // [die, die, die, die]
        } else if (gameState.dice.length >= 2) {
            // Non-double: utiliser les 2 dés
            diceForMoves = [gameState.dice[0], gameState.dice[1]];
        } else if (gameState.dice.length > 0) {
            diceForMoves = gameState.dice;
        }
    }
}
```

### Fichier: `src/hooks/useGameSocket.ts`

**Améliorations ajoutées**:
1. Meilleure détection du dé à consommer (recherche du premier dé correspondant)
2. Logs détaillés pour debug des doubles
3. Commentaires explicites sur la consommation des dés

**Lignes modifiées**:
- Ligne ~708-720: Amélioration de la consommation des dés
- Ligne ~1289-1300: Amélioration pour le bot

---

## 🎯 Comportement Attendu Après Correctif

### Pour un Double 1 [1,1,1,1]

1. **Lancement**: `rollDice()` retourne `[1,1,1,1]` ✅
2. **Calcul legal moves**: `getValidMoves()` reçoit `[1,1,1,1]` (4 dés) ✅
3. **Premier mouvement**: Consomme 1 dé → Reste `[1,1,1]` ✅
4. **Recalcul legal moves**: Avec `[1,1,1]` → 3 mouvements possibles ✅
5. **Deuxième mouvement**: Consomme 1 dé → Reste `[1,1]` ✅
6. **Troisième mouvement**: Consomme 1 dé → Reste `[1]` ✅
7. **Quatrième mouvement**: Consomme 1 dé → Reste `[]` ✅
8. **Fin du tour**: Quand `dice.length === 0` → Changement de tour ✅

---

## 🧪 Tests à Effectuer

### Test 1: Double 1
1. Lancer les dés jusqu'à obtenir un double 1
2. Vérifier que 4 mouvements sont possibles
3. Jouer les 4 mouvements consécutivement
4. Vérifier que le tour change seulement après le 4ème mouvement

### Test 2: Double 6
1. Lancer les dés jusqu'à obtenir un double 6
2. Vérifier que 4 mouvements de 6 cases sont possibles
3. Jouer les 4 mouvements
4. Vérifier le comportement correct

### Test 3: Non-Double
1. Lancer un non-double (ex: [3,4])
2. Vérifier que 2 mouvements sont possibles (3 et 4)
3. Jouer les 2 mouvements
4. Vérifier que le comportement reste correct

---

## 📋 Checklist de Vérification

- [x] Correction de l'extraction des dés dans `mappers.ts`
- [x] Amélioration de la consommation des dés dans `useGameSocket.ts`
- [x] Ajout de logs pour debug
- [ ] Tests manuels avec double 1
- [ ] Tests manuels avec double 6
- [ ] Vérification que les non-doubles fonctionnent toujours
- [ ] Vérification que le bot joue correctement les doubles

---

## 🔍 Points d'Attention

### 1. Recalcul des Legal Moves
Après chaque mouvement, les legal moves doivent être recalculés avec les dés restants. Le système React devrait automatiquement recalculer via `useMemo` dans `GameRoom.tsx`.

### 2. Consommation des Dés
Le code consomme correctement **un seul dé à la fois** avec `splice(dieIndex, 1)`. C'est correct pour les doubles.

### 3. Changement de Tour
Le tour ne change que quand `dice.length === 0`, ce qui est correct.

---

## 📝 Message pour Opus

Salut Opus,

J'ai identifié et corrigé un **bug critique** concernant les doubles au backgammon.

**Problème**: Quand un double est lancé (ex: [1,1,1,1]), le système ne permettait qu'un seul mouvement au lieu de 4.

**Cause**: Dans `src/board/utils/mappers.ts`, la logique d'extraction des dés pour les doubles utilisait seulement les 2 premiers dés `[dice[0], dice[1]]` au lieu de tous les 4.

**Correctif appliqué**:
- ✅ Correction dans `mappers.ts` pour utiliser tous les dés d'un double
- ✅ Amélioration de la consommation des dés dans `useGameSocket.ts`
- ✅ Ajout de logs pour debug

**Action requise de ta part**:
1. Vérifier que les corrections sont correctes
2. Tester avec un double 1 pour confirmer que 4 mouvements sont possibles
3. Vérifier que les non-doubles fonctionnent toujours correctement
4. Tester avec le bot pour s'assurer qu'il joue correctement les doubles

Le correctif devrait permettre de jouer les 4 mouvements d'un double correctement.

Merci ! 🎲

