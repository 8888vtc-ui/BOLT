# Prompt pour Opus - Bugs de Déplacement et Tests Complets

## 🎯 Contexte

J'ai effectué une série complète de tests de déplacement sur GuruGammon jusqu'au blocage. Voici tous les bugs et problèmes identifiés lors des tests approfondis.

---

## 📊 Résumé des Tests Effectués

**Date**: 2025-01-02  
**Tests**: Déplacements multiples jusqu'au blocage  
**Cycles de test**: Plusieurs cycles complets  
**Mouvements testés**: Lancers de dés, déplacements simples, doubles, alternance de tours

---

## 🐛 Bugs Identifiés

### ⚠️ Bug #1: Logs de Debug Excessifs dans la Console

**Sévérité**: Faible (mais pollue la console)

**Description**:  
La console contient de nombreux logs de debug avec des emojis qui polluent la sortie :
- `[BoardWrap] 🚨🚨🚨 STATE UPDATE 🚨🚨🚨`
- `[Checker] ✅✅✅ DIRECT CLICK HANDLER ✅✅✅`
- `[BoardWrap] 🔥🔥🔥 handlePipClick - AUTO MOVE 🔥🔥🔥`
- `[BoardWrap] ✅✅✅ AUTO-MOVE EXECUTED ✅✅✅`

**Fichiers concernés**:
- `src/components/BoardWrap.tsx` (probablement)
- `src/board/components/CheckersLayer.tsx` (probablement)

**Impact**:  
- Console difficile à lire
- Performance légèrement impactée (logs répétitifs)
- Difficulté à identifier les vrais problèmes

**Solution proposée**:
```typescript
// Remplacer les logs de debug excessifs par des logs conditionnels
if (process.env.NODE_ENV === 'development' && DEBUG_MODE) {
    console.debug('[BoardWrap] State update', state);
}
```

---

### ⚠️ Bug #2: Logs "DICE EXTRACTION" Répétitifs

**Sévérité**: Faible

**Description**:  
Le log `[mappers] DICE EXTRACTION: [object Object]` apparaît deux fois à chaque action (roll dice, move).

**Fichier**: `src/board/utils/mappers.ts:181`

**Message observé**:
```
[mappers] DICE EXTRACTION: [object Object]
[mappers] DICE EXTRACTION: [object Object]
```

**Impact**:  
- Logs dupliqués inutiles
- Console encombrée

**Solution proposée**:
- Vérifier pourquoi le log est appelé deux fois
- Soit supprimer le doublon, soit utiliser un flag pour éviter la duplication

---

### ⚠️ Bug #3: Warnings React Router Future Flags

**Sévérité**: Faible (avertissements pour v7)

**Description**:  
Deux warnings React Router apparaissent à chaque chargement :
1. `React Router will begin wrapping state updates in React.startTransition in v7`
2. `Relative route resolution within Splat routes is changing in v7`

**Fichier**: `src/components/BrowserConsole.tsx:72`

**Impact**:  
- Warnings dans la console
- Nécessite migration vers React Router v7

**Solution proposée**:
```typescript
// Ajouter les future flags dans le Router
<Router future={{ 
    v7_startTransition: true,
    v7_relativeSplatPath: true 
}}>
```

---

### ⚠️ Bug #4: Messages "Demo mode" Répétitifs

**Sévérité**: Très faible (comportement attendu en mode démo)

**Description**:  
Le message `"Demo mode: Supabase not configured, skipping auth"` apparaît plusieurs fois au chargement.

**Fichier**: `src/hooks/useAuth.ts:10`

**Impact**:  
- Logs répétitifs mais attendus en mode démo
- Pourrait être réduit à un seul log au démarrage

**Solution proposée**:
```typescript
// Logger une seule fois au démarrage
if (!DEMO_MODE_LOGGED) {
    console.warn('Demo mode: Supabase not configured, skipping auth');
    DEMO_MODE_LOGGED = true;
}
```

---

### ⚠️ Bug #5: Logs avec "[object Object]" au lieu de Données Structurées

**Sévérité**: Faible (mais rend le debug difficile)

**Description**:  
Plusieurs logs affichent `[object Object]` au lieu d'afficher les données structurées :
- `[mappers] DICE EXTRACTION: [object Object]`
- `[16:15:42] 🎲 Envoi du mouvement... [object Object]`

**Impact**:  
- Impossible de voir les détails dans les logs
- Debug difficile

**Solution proposée**:
```typescript
// Utiliser JSON.stringify ou console.log avec spread
console.log('[mappers] DICE EXTRACTION:', { ...diceData });
// ou
console.log('[mappers] DICE EXTRACTION:', JSON.stringify(diceData, null, 2));
```

---

### ✅ Observations Positives

1. **Déplacements fonctionnent correctement**: Les mouvements sont exécutés avec succès
2. **Alternance de tours**: Le système alterne correctement entre joueur et bot
3. **Consommation des dés**: Les dés sont correctement consommés après chaque mouvement
4. **Calcul des legal moves**: Les mouvements légaux sont calculés correctement

---

## 📝 Logs Capturés (Exemples)

### Logs de Déplacement Réussi
```
[16:15:42] 🎲 Envoi du mouvement...
[16:15:42] Action: board:move
[16:15:42] 🔍 [board:move] Validation du tour...
[16:15:42] ✅ [board:move] Validation OK, traitement du move
[16:15:42] Action: move
[16:15:42] Player Color: 1
[16:15:42] 🔍 [MOVE] Calcul dieUsed
[16:15:42] 🔍 [MOVE] Die calculé: 6
[16:15:42] Move executed locally
[16:15:48] 🔄 [MOVE] Tour alterné: guest → bot
```

### Logs de Debug Excessifs
```
[BoardWrap] 🚨🚨🚨 STATE UPDATE 🚨🚨🚨 [object Object]
[Checker] ✅✅✅ DIRECT CLICK HANDLER ✅✅✅ [object Object]
[BoardWrap] 🔥🔥🔥 handlePipClick - AUTO MOVE 🔥🔥🔥 [object Object]
[BoardWrap] 🎯 CLICK ANALYSIS: [object Object]
[BoardWrap] ➡️ Auto-selecting best advance move: [object Object]
[BoardWrap] ✅✅✅ AUTO-MOVE EXECUTED ✅✅✅ [object Object]
```

---

## 🎯 Actions Demandées à Opus

1. **Nettoyer les logs de debug excessifs**
   - Remplacer les logs avec emojis par des logs conditionnels
   - Utiliser `console.debug` au lieu de `console.log` pour les logs de debug

2. **Corriger les logs "[object Object]"**
   - Utiliser `JSON.stringify` ou spread operator pour afficher les données
   - Rendre les logs exploitables pour le debug

3. **Réduire la duplication des logs**
   - Identifier pourquoi `DICE EXTRACTION` est appelé deux fois
   - Supprimer les doublons

4. **Ajouter les React Router Future Flags**
   - Configurer les flags pour éviter les warnings
   - Préparer la migration vers React Router v7

5. **Optimiser les logs "Demo mode"**
   - Logger une seule fois au démarrage
   - Éviter la répétition

---

## ✅ Tests de Validation

Après corrections, vérifier :
- [ ] Console propre sans logs excessifs
- [ ] Logs exploitables (données structurées visibles)
- [ ] Plus de warnings React Router
- [ ] Logs "Demo mode" une seule fois
- [ ] Déplacements fonctionnent toujours correctement
- [ ] Performance améliorée (moins de logs)

---

## 📄 Fichiers à Modifier

1. `src/components/BoardWrap.tsx` - Nettoyer logs de debug
2. `src/board/components/CheckersLayer.tsx` - Nettoyer logs de debug
3. `src/board/utils/mappers.ts` - Corriger logs "[object Object]"
4. `src/hooks/useAuth.ts` - Réduire logs "Demo mode"
5. `src/router.tsx` ou `src/main.tsx` - Ajouter React Router future flags
6. `src/components/BrowserConsole.tsx` - Améliorer formatage des logs

---

## 🔍 Notes Additionnelles

- Le jeu fonctionne correctement malgré ces logs
- Les bugs sont principalement liés à la qualité des logs, pas à la fonctionnalité
- Aucun bug critique de gameplay détecté lors des tests
- Les déplacements sont exécutés correctement
- L'alternance de tours fonctionne

---

**Fin du rapport**


