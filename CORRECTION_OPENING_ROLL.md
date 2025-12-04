# Correction - Jeu de Départ (Opening Roll)

**Date**: 2025-12-03  
**Problème**: Le bot ne pouvait pas commencer, le joueur commençait toujours

---

## 🐛 Problème Identifié

### Symptômes
- Le joueur commençait toujours
- Le bot ne pouvait jamais commencer
- Pas de jeu de départ pour déterminer qui commence

### Règle du Backgammon
Dans le backgammon, il y a un **jeu de départ** (opening roll) où :
1. Chaque joueur lance un dé
2. Celui qui obtient le plus haut nombre commence
3. Si égalité, on relance jusqu'à ce qu'il y ait un gagnant

---

## ✅ Solution Implémentée

### Code Modifié
**Fichier**: `src/hooks/useGameSocket.ts` (lignes 349-360)

```typescript
// Jeu de départ (opening roll) pour déterminer qui commence
let playerRoll = 0;
let botRoll = 0;
let startingPlayerId: string;

// Jeu de départ : lancer les dés jusqu'à ce qu'il y ait un gagnant
do {
    playerRoll = Math.floor(Math.random() * 6) + 1;
    botRoll = Math.floor(Math.random() * 6) + 1;
    
    addLog(`🎲 [OPENING ROLL] Joueur: ${playerRoll}, Bot: ${botRoll}`, 'info', {
        playerRoll,
        botRoll,
        playerId: soloPlayers[0].id,
        botId: soloPlayers[1].id
    });
    
    if (playerRoll > botRoll) {
        startingPlayerId = soloPlayers[0].id; // Le joueur commence
        addLog(`✅ [OPENING ROLL] Le joueur commence (${playerRoll} > ${botRoll})`, 'success');
    } else if (botRoll > playerRoll) {
        startingPlayerId = soloPlayers[1].id; // Le bot commence
        addLog(`✅ [OPENING ROLL] Le bot commence (${botRoll} > ${playerRoll})`, 'success');
    } else {
        addLog(`🔄 [OPENING ROLL] Égalité (${playerRoll} = ${botRoll}), on relance...`, 'info');
    }
} while (playerRoll === botRoll); // Relancer en cas d'égalité

const botState = createMockGameState(startingPlayerId, options);
```

---

## 🧪 Test

### Logs Observés
```
[01:39:45] 🎲 [OPENING ROLL] Joueur: 5, Bot: 6
[01:39:45] ✅ [OPENING ROLL] Le bot commence (6 > 5)
[01:39:45] 🎲 [JOIN_ROOM] Tour initial: bot (après opening roll)
[01:39:45] 🤖 Bot: C'est mon tour!
[01:39:45] 🤖 AI Service: Preparing analysis...
```

### Résultat
✅ Le jeu de départ fonctionne correctement  
✅ Le bot peut maintenant commencer  
✅ Le bot détecte son tour et commence l'analyse automatiquement

---

## 📝 Notes

- Le jeu de départ est effectué automatiquement lors de la création de la partie
- Si égalité, on relance jusqu'à ce qu'il y ait un gagnant
- Le tour initial est déterminé par le résultat du jeu de départ
- Le bot jouera automatiquement s'il gagne le jeu de départ

