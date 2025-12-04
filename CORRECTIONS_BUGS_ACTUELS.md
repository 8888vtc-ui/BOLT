# Corrections des Bugs Actuels

**Date**: 2025-12-03  
**Problèmes identifiés**: Erreur `null.id` et bot ne joue pas automatiquement

---

## 🐛 Bug #1: Erreur `null.id`

### Problème
```
Uncaught (in promise) TypeError: Cannot read properties of null (reading 'id')
```

### Localisation
- **Fichier**: `src/hooks/useGameSocket.ts`
- **Ligne**: 1035

### Cause
Accès à `players[0].id` sans vérification null.

### Correction Appliquée
```typescript
// AVANT
if (currentPlayerId === players[0].id || currentPlayerId === 'guest' || currentPlayerId === 'guest-1') currentPlayerColor = 1;

// APRÈS
if (currentPlayerId === players[0]?.id || currentPlayerId === 'guest' || currentPlayerId === 'guest-1') currentPlayerColor = 1;
```

✅ **Corrigé**: Ajout de l'opérateur de chaînage optionnel `?.` pour éviter l'erreur si `players[0]` est `null` ou `undefined`.

---

## 🐛 Bug #2: Bot ne joue pas automatiquement après avoir lancé les dés

### Problème
Le bot lance les dés (1, 2) mais ne joue pas automatiquement après. Les logs montrent :
- ✅ Bot lance les dés
- ✅ Bot dit "C'est mon tour!"
- ❌ Bot ne joue pas les mouvements

### Localisation
- **Fichier**: `src/hooks/useGameSocket.ts`
- **Ligne**: 1451-1462

### Cause
Le bot libère le verrou (`botIsThinking.current = false` et `botAnalysisInProgress.current = null`) immédiatement après avoir lancé les dés, ce qui empêche le `useEffect` de se déclencher à nouveau pour jouer les mouvements.

### Correction Appliquée
```typescript
// AVANT
if (currentGameState.dice.length === 0) {
    addLog('🤖 Bot: Rolling dice...', 'info');
    await new Promise(r => setTimeout(r, 1000));
    sendGameAction('rollDice', {}, 2);
    // Clear timeout on success
    if (botTimeoutRef.current) {
        clearTimeout(botTimeoutRef.current);
        botTimeoutRef.current = null;
    }
    botIsThinking.current = false;
    botAnalysisInProgress.current = null;
    return;
}

// APRÈS
if (currentGameState.dice.length === 0) {
    addLog('🤖 Bot: Rolling dice...', 'info');
    await new Promise(r => setTimeout(r, 1000));
    sendGameAction('rollDice', {}, 2);
    // Ne pas libérer le verrou immédiatement - laisser le useEffect se déclencher à nouveau
    // Le useEffect se déclenchera quand gameState.dice changera, et le bot jouera alors
    // Clear timeout on success
    if (botTimeoutRef.current) {
        clearTimeout(botTimeoutRef.current);
        botTimeoutRef.current = null;
    }
    // Libérer le verrou après un court délai pour permettre au useEffect de se déclencher
    setTimeout(() => {
        botIsThinking.current = false;
        botAnalysisInProgress.current = null;
    }, 500);
    return;
}
```

✅ **Corrigé**: Le verrou est libéré après un court délai (500ms) pour permettre au `useEffect` de se déclencher à nouveau quand `gameState.dice` change, permettant au bot de jouer automatiquement.

---

## 📋 Résumé des Corrections

1. ✅ **Erreur `null.id`** : Ajout de l'opérateur de chaînage optionnel `?.` pour éviter l'accès à `players[0].id` si `players[0]` est `null`.

2. ✅ **Bot ne joue pas** : Libération différée du verrou après avoir lancé les dés pour permettre au `useEffect` de se déclencher à nouveau et de jouer les mouvements.

---

## 🧪 Tests à Effectuer

1. **Test erreur `null.id`** :
   - ✅ Vérifier qu'il n'y a plus d'erreur `Cannot read properties of null (reading 'id')` dans la console
   - ✅ Vérifier que le jeu fonctionne correctement même si `players[0]` est `null`

2. **Test bot joue automatiquement** :
   - ✅ Vérifier que le bot lance les dés
   - ✅ Vérifier que le bot joue automatiquement après avoir lancé les dés
   - ✅ Vérifier que le bot joue tous les mouvements disponibles
   - ✅ Vérifier que le tour alterne correctement après que le bot a joué

---

## ✅ Statut

- ✅ **Bug #1**: Corrigé
- ✅ **Bug #2**: Corrigé
- ⏳ **Tests**: En attente

