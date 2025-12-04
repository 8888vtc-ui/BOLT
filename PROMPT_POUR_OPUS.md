# 🎯 PROMPT POUR OPUS - CORRECTION DES ERREURS TROUVÉES

**Date**: 2025-01-02  
**Contexte**: Tests automatiques en boucle - 61 erreurs trouvées  
**Priorité**: 🔴 CRITIQUE

---

## 📊 RÉSUMÉ DES ERREURS

**Total d'erreurs trouvées**: 61  
**Erreurs critiques**: 3  
**Erreurs importantes**: 2  
**Warnings**: 2

---

## ❌ ERREUR CRITIQUE #1 : gameState undefined au rendu

**Type**: Error  
**Message**: `[GameRoom] No gameState for boardState undefined`  
**Fichier**: `src/pages/GameRoom.tsx`  
**Ligne**: ~200  
**Impact**: ⚠️ **CRITIQUE** - Le plateau ne peut pas se rendre correctement  
**Fréquence**: Au chargement de la page  
**Cause**: `gameState` est `null` ou `undefined` au moment du premier rendu

**Code concerné**:
```typescript
// Dans GameRoom.tsx
const boardState = mapGameStateToBoardState(gameState, ...);
// gameState peut être null au premier rendu
```

**Solution proposée**: 
```typescript
// Ajouter une vérification avant le rendu
if (!gameState || !gameState.board) {
    return <div>Chargement...</div>; // ou un loader
}
```

---

## ❌ ERREUR CRITIQUE #2 : setState pendant le render (GameRoom)

**Type**: Error (Warning React)  
**Message**: `Cannot update a component (BrowserConsole) while rendering a different component (GameRoom)`  
**Fichier**: `src/pages/GameRoom.tsx:43`  
**Impact**: ⚠️ **CRITIQUE** - Violation des règles React  
**Fréquence**: Au chargement  
**Cause**: Appel de `setState` ou `addLog` pendant le render

**Stack trace**:
```
BrowserConsole GameRoom GameRoom
at GameRoom (src/pages/GameRoom.tsx:43:22)
```

**Solution proposée**: 
```typescript
// Déplacer les appels addLog dans des useEffect
useEffect(() => {
    if (!gameState) {
        const addLog = useDebugStore.getState().addLog;
        addLog('[GameRoom] No gameState for boardState', 'error');
    }
}, [gameState]);
```

---

## ❌ ERREUR CRITIQUE #3 : setState pendant le render (CheckersLayer)

**Type**: Error (Warning React)  
**Message**: `Cannot update a component (BrowserConsole) while rendering a different component (CheckersLayer)`  
**Fichier**: `src/board/components/CheckersLayer.tsx:22`  
**Impact**: ⚠️ **CRITIQUE** - Violation des règles React  
**Fréquence**: Au rendu du plateau  
**Cause**: Appel de `setState` ou `addLog` pendant le render dans CheckersLayer

**Solution proposée**: 
```typescript
// Supprimer ou déplacer les logs dans useEffect
// Dans CheckersLayer.tsx, ligne 22
// Remplacer les console.log/addLog dans le render par useEffect
```

---

## ⚠️ ERREUR IMPORTANTE #4 : Extraction des dés - Log niveau incorrect

**Type**: Error  
**Message**: `[mappers] DICE EXTRACTION: [object Object]`  
**Fichier**: `src/board/utils/mappers.ts`  
**Impact**: ⚠️ **IMPORTANT** - Log d'erreur pour extraction des dés  
**Fréquence**: À chaque rendu  
**Cause**: Log d'erreur au lieu d'info pour extraction des dés

**Solution proposée**: 
```typescript
// Changer le niveau de log de error à info ou debug
console.info('[mappers] DICE EXTRACTION:', diceData);
// ou
console.debug('[mappers] DICE EXTRACTION:', diceData);
```

---

## ⚠️ ERREUR IMPORTANTE #5 : Calcul legal moves quand dice=0

**Type**: Warning  
**Message**: `❌ CANNOT CALCULATE LEGAL MOVES: dice=0, points=24`  
**Fichier**: `src/board/utils/mappers.ts`  
**Impact**: ⚠️ **IMPORTANT** - Pas de moves disponibles au début (normal mais mal géré)  
**Fréquence**: Au chargement (normal si pas de dés)  
**Cause**: Pas de dés lancés, donc pas de moves possibles

**Solution proposée**: 
```typescript
// Gérer proprement le cas dice=0
if (dice.length === 0) {
    return { legalMoves: [], legalMovesCount: 0 }; // Retourner vide au lieu d'erreur
}
```

---

## 📋 ACTIONS À PRENDRE

### 1. Corriger gameState undefined
- ✅ Ajouter vérification `if (!gameState) return null;` dans GameRoom.tsx
- ✅ Ajouter un loader pendant le chargement

### 2. Corriger setState pendant render
- ✅ Déplacer tous les `addLog` du render vers `useEffect` dans GameRoom.tsx
- ✅ Déplacer tous les `addLog` du render vers `useEffect` dans CheckersLayer.tsx

### 3. Corriger logs d'erreur
- ✅ Changer niveau de log pour DICE EXTRACTION (error → info/debug)
- ✅ Gérer proprement le cas dice=0 pour legal moves

---

## 🎯 PROMPT COMPLET POUR OPUS

```
Salut Opus — besoin d'une intervention urgente sur GuruGammon : correction de 3 erreurs critiques React et 2 erreurs importantes identifiées lors de tests automatiques.

Résumé du problème
61 erreurs trouvées lors de tests automatiques en boucle, dont 3 critiques qui empêchent le bon fonctionnement du jeu.

Actions demandées (ordre de priorité)

1. Corriger gameState undefined au rendu
   - Fichier: src/pages/GameRoom.tsx
   - Problème: gameState est null au premier rendu, causant "No gameState for boardState undefined"
   - Solution: Ajouter vérification if (!gameState) return <Loader />; avant le rendu du plateau

2. Corriger setState pendant render (GameRoom)
   - Fichier: src/pages/GameRoom.tsx:43
   - Problème: Appel de addLog pendant le render, violation des règles React
   - Solution: Déplacer tous les addLog du render vers useEffect

3. Corriger setState pendant render (CheckersLayer)
   - Fichier: src/board/components/CheckersLayer.tsx:22
   - Problème: Appel de addLog pendant le render, violation des règles React
   - Solution: Déplacer tous les addLog du render vers useEffect ou les supprimer

4. Corriger niveau de log pour DICE EXTRACTION
   - Fichier: src/board/utils/mappers.ts
   - Problème: Log d'erreur pour extraction des dés (normal)
   - Solution: Changer console.error en console.info ou console.debug

5. Gérer proprement dice=0 pour legal moves
   - Fichier: src/board/utils/mappers.ts
   - Problème: Erreur quand dice=0 (normal au début)
   - Solution: Retourner { legalMoves: [], legalMovesCount: 0 } au lieu d'erreur

Tests à exécuter après correctifs
- Charger la page de jeu → vérifier qu'il n'y a plus d'erreur "gameState undefined"
- Vérifier console → plus d'erreur "setState during render"
- Lancer les dés → vérifier que les legal moves sont calculés correctement
- Répéter 5 fois sans erreur

Ce que j'attends de toi, Opus
- Appliquer les 5 correctifs listés
- Vérifier qu'il n'y a plus d'erreurs React dans la console
- Confirmer que le jeu fonctionne correctement
- Commit et push des changements avec message clair

Merci de traiter en priorité.
```

---

## ✅ RÉSULTATS DES TESTS

**Tests effectués**:
- ✅ Chargement de la page
- ✅ Lancement des dés (fonctionne : 2, 2, 2, 2)
- ✅ Calcul des legal moves (fonctionne : 8 moves)
- ⏳ Test d'un move (en cours)

**Erreurs trouvées**:
- ❌ 3 erreurs critiques React
- ⚠️ 2 erreurs importantes
- ⚠️ 2 warnings non critiques

---

**Prêt pour correction par Opus !**


