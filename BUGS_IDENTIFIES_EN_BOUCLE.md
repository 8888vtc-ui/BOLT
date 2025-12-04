# 🐛 Bugs Identifiés en Boucle de Tests

## Date: 2025-01-02

## 🔴 Erreur Critique: `null.id` à la ligne 882

### Description
L'erreur `Cannot read properties of null (reading 'id')` persiste à la ligne 882 de `useGameSocket.ts`, même après plusieurs corrections.

### Corrections Appliquées

1. **Protection dans `addLog` pour `board:move` (ligne 884)**:
   ```typescript
   players: safePlayers.map(p => p && p.id ? { id: p.id, username: p.username || 'Unknown' } : null).filter(Boolean),
   ```

2. **Protection dans `addLog` pour tour alterné (ligne 1084)**:
   ```typescript
   players: players?.filter(p => p && p.id).map(p => p && p.id ? p.id : null).filter(Boolean) || [],
   ```

3. **Protection dans `addLog` pour bot debug (lignes 1226, 1286)**:
   ```typescript
   players: latestPlayers?.filter(p => p && p.id).map(p => p && p.id ? { id: p.id, username: p.username || 'Unknown' } : null).filter(Boolean) || [],
   ```

4. **Protection dans `isBotTurn` (ligne 1244)**:
   ```typescript
   (latestPlayers && latestPlayers.length > 1 && latestPlayers[1] && currentTurn === latestPlayers[1].id) ||
   ```

5. **Protection dans `check3` log (ligne 1266)**:
   ```typescript
   check3: latestPlayers && latestPlayers.length > 1 && latestPlayers[1] && currentTurn === latestPlayers[1].id,
   ```

6. **Protection dans `some` (ligne 1253)**:
   ```typescript
   !latestPlayers.some(p => p && p.id === currentTurn)
   ```

7. **Protection dans callback message (ligne 606-614)**:
   ```typescript
   .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `room_id=eq.${roomId}` }, (payload) => {
       try {
           const msg = payload.new as any;
           if (!msg || !msg.id) {
               addLog('⚠️ [JOIN_ROOM] Message invalide reçu', 'warning');
               return;
           }
           addMessage({
               id: msg.id,
               userId: msg.user_id || 'unknown',
               username: 'Joueur',
               text: msg.content || '',
               timestamp: msg.created_at ? new Date(msg.created_at).getTime() : Date.now()
           });
       } catch (error: any) {
           addLog(`⚠️ [JOIN_ROOM] Erreur traitement message: ${error?.message || 'Unknown error'}`, 'error', error);
       }
   })
   ```

### État Actuel
- ✅ Toutes les protections null ont été ajoutées
- ⚠️ L'erreur peut encore se produire si elle vient d'une autre source (promesse non catchée, callback asynchrone)
- 🔄 Tests en boucle en cours pour identifier la source exacte

### Prochaines Étapes
1. Continuer les tests en boucle pour capturer l'erreur exacte
2. Ajouter un gestionnaire d'erreurs global pour capturer toutes les promesses non catchées
3. Vérifier tous les callbacks asynchrones qui pourraient accéder à `.id`
