# 🚨 PROMPT MEGA ULTRA COMPLET POUR GEMINI 3 PRO THINKING

## ⚠️ SITUATION CRITIQUE
Le bot ne joue JAMAIS. Le tour ne change JAMAIS. Les checkers sont invisibles. Le username affiche "Guest" au lieu du vrai nom. **TU DOIS TOUT CORRIGER MAINTENANT.**

---

## 📋 CONTEXTE TECHNIQUE COMPLET

**Stack :**
- React 18.3.1, TypeScript 5.5.3, Vite 5.4.2
- Zustand 5.0.8 (state management)
- Supabase (Auth + Database)
- Netlify (déploiement frontend)
- Railway (Ollama/DeepSeek backend)

**Architecture :**
- `src/hooks/useGameSocket.ts` : Logique du jeu et bot (1235 lignes)
- `src/pages/GameRoom.tsx` : Interface du jeu (1088 lignes)
- `src/components/Point.tsx` : Rendu des points (120 lignes)
- `src/components/Checker.tsx` : Rendu des checkers (101 lignes)
- `src/stores/gameStore.ts` : Store Zustand global (106 lignes)
- `src/hooks/useAuth.ts` : Authentification (276 lignes)

---

## 🔴 PROBLÈME #1 : BOT NE JOUE JAMAIS - TOUR NE CHANGE JAMAIS

### Symptômes EXACTS
```
🤖 Bot: Checking turn...
{
  currentTurn: "guest-1",  // ❌ TOUJOURS "guest-1", JAMAIS "bot"
  myId: "c1473d69-a765-4fd6-8c07-30b3b24d7470",
  isBotTurn: false,  // ❌ TOUJOURS false
  botIsThinking: false,
  analysisInProgress: null,
  analysisKey: "guest-1-no-dice",
  players: [
    { id: "guest", username: "Invité" },
    { id: "bot", username: "Bot IA" }  // ✅ Bot est bien là
  ]
}
```

### Code ACTUEL (PROBLÉMATIQUE)

**Fichier : `src/hooks/useGameSocket.ts`**

**Ligne 45** - Tour initial :
```typescript
turn: userId || 'guest-1', // Le tour est au joueur par défaut
```

**Ligne 853-859** - Détection du tour :
```typescript
const myId = user?.id || 'guest-1';
const currentTurn = gameState.turn;

// CRITIQUE : Identifier le bot depuis la liste des joueurs
const botId = players && players.length > 1 ? players[1].id : 'bot';
const isBotTurn = currentTurn === botId || currentTurn === 'bot';
```

**Ligne 758-792** - Alternance du tour (PROBLÈME ICI) :
```typescript
// Switch turn if no dice left
if (newState.dice.length === 0) {
    const currentPlayerId = newState.turn;
    const myId = user?.id || 'guest-1';

    // Switch to other player
    if (players && players.length > 1) {
        // Multiplayer: switch between players[0] and players[1]
        const newTurn = currentPlayerId === players[0].id ? players[1].id : players[0].id;
        newState.turn = newTurn;
        addLog(`🔄 [MOVE] Tour alterné: ${currentPlayerId} → ${newTurn}`, 'info', {
            players: players.map(p => p.id),
            currentPlayerId,
            newTurn
        });
    } else {
        // Solo/Bot mode: switch between user and bot
        const botId = 'bot';
        const newTurn = currentPlayerId === myId ? botId : myId;
        newState.turn = newTurn;
        addLog(`🔄 [MOVE] Tour alterné (fallback): ${currentPlayerId} → ${newTurn}`, 'warning');
    }
}
```

**Ligne 798-800** - Mise à jour du state :
```typescript
if (newState.board) {
    addLog('Updating local game state...', 'info');
    updateGame(newState);  // ⚠️ EST-CE QUE C'EST APPELÉ ?
}
```

### Analyse REQUISE

1. **Vérifier si `updateGame(newState)` est appelé** :
   - Le log `🔄 [MOVE] Tour alterné` apparaît-il dans les logs ?
   - Si OUI : Le problème est que `updateGame` ne met pas à jour le state correctement
   - Si NON : La condition `newState.dice.length === 0` n'est jamais vraie

2. **Vérifier la condition `newState.dice.length === 0`** :
   - Quand le joueur joue un coup, `dice` est-il vidé correctement ?
   - Après chaque coup, `dice.length` devrait diminuer
   - Quand tous les coups sont joués, `dice.length === 0` devrait être vrai

3. **Vérifier le timing** :
   - `updateGame` est-il appelé AVANT que le bot vérifie son tour ?
   - Y a-t-il un problème de synchronisation React ?

4. **Vérifier le store Zustand** :
   - `updateGame: (gameState) => set({ gameState })` est-il correct ?
   - Le state est-il mis à jour de manière réactive ?

### Solution PROPOSÉE

**Option 1 : Forcer l'alternance du tour explicitement**
```typescript
// Après chaque coup, forcer l'alternance si dice.length === 0
if (newState.dice.length === 0) {
    const currentPlayerId = newState.turn;
    const botId = players && players.length > 1 ? players[1].id : 'bot';
    const myId = user?.id || 'guest-1';
    
    // FORCER l'alternance
    const newTurn = currentPlayerId === myId ? botId : myId;
    newState.turn = newTurn;
    
    // LOGS CRITIQUES
    addLog(`🔄 [MOVE] FORCE Tour alterné: ${currentPlayerId} → ${newTurn}`, 'error', {
        currentPlayerId,
        newTurn,
        myId,
        botId,
        players: players?.map(p => p.id),
        diceLength: newState.dice.length
    });
    
    // FORCER la mise à jour
    updateGame(newState);
    
    // Vérifier que c'est bien mis à jour
    setTimeout(() => {
        const updatedState = useGameStore.getState().gameState;
        addLog(`✅ [MOVE] Vérification tour après update: ${updatedState?.turn}`, 'info', {
            expected: newTurn,
            actual: updatedState?.turn,
            match: updatedState?.turn === newTurn
        });
    }, 100);
}
```

**Option 2 : Vérifier pourquoi `updateGame` ne fonctionne pas**
```typescript
// Dans gameStore.ts, vérifier que set() fonctionne
updateGame: (gameState) => {
    console.log('🔄 [STORE] updateGame appelé', gameState.turn);
    set({ gameState });
    // Vérifier immédiatement après
    setTimeout(() => {
        const state = useGameStore.getState();
        console.log('🔄 [STORE] État après updateGame', state.gameState?.turn);
    }, 0);
},
```

---

## 🔴 PROBLÈME #2 : JETONS INVISIBLES ("PAS DE JETONS")

### Symptômes EXACTS
```
🎯 [GAME_ROOM] Board pour rendu
{
  totalCheckers: 30,  // ✅ Correct
  pointsWithCheckers: 8,  // ✅ Correct
  samplePoints: {
    point0: { player: 2, count: 2 },  // ✅ Correct
    point5: { player: 1, count: 5 },  // ✅ Correct
    point11: { player: 2, count: 5 }, // ✅ Correct
    point12: { player: 1, count: 5 },  // ✅ Correct
    point23: { player: 1, count: 2 }  // ✅ Correct
  }
}
```
**MAIS** : Aucun checker visible sur le plateau visuellement.

### Code ACTUEL

**Fichier : `src/components/Point.tsx`**

**Lignes 45-77** - Rendu des checkers :
```typescript
const checkers = [];
// Vérifier que point.count existe et est > 0
const displayCount = point && point.count > 0 ? Math.min(point.count, 5) : 0;

for (let i = 0; i < displayCount; i++) {
    const isLastVisible = i === displayCount - 1;
    const stackHeight = isLastVisible ? point.count : 1;

    // Seul le pion du haut est interactif (click ou drag)
    const isInteractive = canMove && point.player === currentPlayer && isLastVisible;

    checkers.push(
        <div
            key={i}
            className="relative w-[90%] aspect-square flex-shrink-0"
            style={{ marginBottom: '-15%' }}
            onClick={(e) => {
                if (isInteractive && onClick) {
                    e.stopPropagation();
                    onClick();
                }
            }}
        >
            <Checker
                player={point.player || 1}
                draggable={isInteractive}
                onDragStart={() => onDragStart(index)}
                index={i}
                stackHeight={stackHeight}
            />
        </div>
    );
}
```

**Lignes 99-103** - Affichage des checkers :
```typescript
{/* Conteneur des pions */}
<div className="relative z-10 flex flex-col items-center w-full py-2">
    {/* Pas de reverse() ici car flex-col-reverse gère déjà l'ordre visuel pour le bas */}
    {checkers}
</div>
```

**Fichier : `src/components/Checker.tsx`**

**Lignes 39-60** - Rendu du checker :
```typescript
return (
    <motion.div
        ref={draggable ? drag : null}
        className="absolute cursor-pointer select-none"
        style={{
            width: '100%',
            height: '100%',
            zIndex: index,
            opacity: isDragging ? 0.3 : 1,
            // Positionnement géré par le parent (Point.tsx) via Flexbox + Marges négatives
        }}
        animate={{
            scale: draggable ? [1, 1.05, 1] : 1,
        }}
        transition={{
            scale: {
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
            },
        }}
        whileHover={draggable ? { scale: 1.1 } : {}}
    >
```

### Analyse REQUISE

1. **Vérifier si `displayCount > 0`** :
   - Ajouter un log : `console.log('Point', index, 'displayCount', displayCount, 'point', point)`
   - Si `displayCount === 0`, les checkers ne seront jamais rendus

2. **Vérifier si les checkers sont dans le DOM** :
   - Ouvrir DevTools → Elements
   - Chercher les éléments `<Checker>` ou `<motion.div>` avec `className="absolute"`
   - Sont-ils présents mais invisibles ?

3. **Vérifier les styles CSS** :
   - `opacity: 1` est-il appliqué ?
   - `z-index` est-il correct ?
   - Le parent a-t-il `overflow: hidden` qui masque les checkers ?

4. **Vérifier le positionnement** :
   - `position: absolute` est-il correct ?
   - Le parent a-t-il `position: relative` ?
   - Les marges négatives `marginBottom: '-15%'` causent-elles un problème ?

5. **Vérifier Framer Motion** :
   - Les animations peuvent-elles masquer les checkers ?
   - `initial={{ opacity: 0 }}` dans `Point.tsx` ligne 82 peut causer un problème

### Solution PROPOSÉE

**Option 1 : Forcer l'affichage avec logs**
```typescript
// Dans Point.tsx, ligne 45
const displayCount = point && point.count > 0 ? Math.min(point.count, 5) : 0;

// AJOUTER DES LOGS CRITIQUES
if (displayCount > 0) {
    console.log(`🎯 [POINT ${index}] Rendering ${displayCount} checkers`, {
        point,
        displayCount,
        player: point.player,
        count: point.count
    });
}

// Dans la boucle, ajouter un log pour chaque checker
for (let i = 0; i < displayCount; i++) {
    console.log(`🎯 [POINT ${index}] Creating checker ${i}/${displayCount}`);
    // ... reste du code
}
```

**Option 2 : Forcer l'opacity et visibility**
```typescript
// Dans Checker.tsx, forcer l'affichage
style={{
    width: '100%',
    height: '100%',
    zIndex: index + 100,  // Augmenter z-index
    opacity: 1,  // FORCER opacity
    visibility: 'visible',  // FORCER visibility
    position: 'absolute',  // FORCER position
}}
```

**Option 3 : Vérifier le parent Point**
```typescript
// Dans Point.tsx, s'assurer que le conteneur est visible
<div 
    className="relative z-10 flex flex-col items-center w-full py-2"
    style={{
        minHeight: displayCount > 0 ? '40px' : '0',  // FORCER hauteur minimale
        visibility: 'visible',  // FORCER visibility
        opacity: 1,  // FORCER opacity
    }}
>
    {checkers}
    {/* DEBUG : Afficher le nombre de checkers */}
    {displayCount > 0 && (
        <div className="absolute top-0 left-0 text-xs bg-red-500 text-white p-1 z-50">
            {displayCount}
        </div>
    )}
</div>
```

---

## 🔴 PROBLÈME #3 : "GUEST" / "INVITÉ" AU LIEU DU VRAI USERNAME

### Symptômes EXACTS
```
✅ [JOIN_ROOM] Joueurs créés: 2
[
  { id: "guest", username: "Invité" },  // ❌ Devrait être le vrai username
  { id: "bot", username: "Bot IA" }
]
```

**MAIS** : L'utilisateur s'est connecté avec Google OAuth ou Email/Password et a un username dans `profiles` table.

### Code ACTUEL

**Fichier : `src/hooks/useGameSocket.ts` ligne 296-304** :
```typescript
const soloPlayers = user 
    ? [
        { id: user.id, username: user.username || 'Joueur', avatar: user.avatar },
        { id: botId, username: 'Bot IA', avatar: undefined }
      ]
    : [
        { id: 'guest', username: 'Invité', avatar: undefined },  // ❌ PROBLÈME ICI
        { id: botId, username: 'Bot IA', avatar: undefined }
      ];
```

**Fichier : `src/hooks/useAuth.ts` ligne 92-151** :
```typescript
const formatAndSetUser = async (authUser: any) => {
    try {
        const metadata = authUser.user_metadata || {};
        let username = metadata.username || metadata.full_name || authUser.email?.split('@')[0] || 'Joueur';
        let avatar = metadata.avatar_url || metadata.picture;

        // Vérifier si le profil existe dans la table profiles
        try {
            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('username, avatar_url')
                .eq('id', authUser.id)
                .single();

            if (!profileError && profile) {
                // Utiliser le pseudo du profil s'il existe
                if (profile.username) {
                    username = profile.username;
                }
                if (profile.avatar_url) {
                    avatar = profile.avatar_url;
                }
            } else {
                // Créer le profil s'il n'existe pas
                const displayName = metadata.full_name || metadata.name || authUser.email?.split('@')[0] || `Joueur${Math.floor(Math.random() * 1000)}`;
                
                const { error: insertError } = await supabase
                    .from('profiles')
                    .upsert({
                        id: authUser.id,
                        username: displayName,
                        email: authUser.email,  // ⚠️ PROBLÈME : profiles table n'a pas de colonne email
                        avatar_url: avatar,
                        created_at: new Date().toISOString()
                    }, {
                        onConflict: 'id'
                    });

                if (!insertError) {
                    username = displayName;
                }
            }
        } catch (err) {
            console.error('Error checking/creating profile:', err);
        }

        setUser({
            id: authUser.id,
            username: username,
            email: authUser.email,
            avatar: avatar,
            role: authUser.is_anonymous ? 'guest' : 'user'
        });
    } catch (error) {
        console.error('Error formatting user:', error);
    } finally {
        setLoading(false);
    }
};
```

### Analyse REQUISE

1. **Vérifier pourquoi `user` est `undefined` lors de `joinRoom`** :
   - `useAuth()` retourne-t-il `user` correctement ?
   - Y a-t-il un problème de timing où `joinRoom` est appelé avant que `user` soit chargé ?
   - Le `useEffect` dans `useAuth` a-t-il fini de charger ?

2. **Vérifier la récupération du username depuis `profiles`** :
   - La requête `supabase.from('profiles').select('username')` fonctionne-t-elle ?
   - Y a-t-il une erreur de permissions (42501) qui empêche la récupération ?
   - Le username est-il bien sauvegardé dans `profiles` après OAuth ?

3. **Vérifier le timing** :
   - `joinRoom` est appelé dans un `useEffect` dans `GameRoom.tsx`
   - Ce `useEffect` dépend de `[roomId, mode, length, location.search, joinRoom, navigate]`
   - `user` n'est PAS dans les dépendances, donc si `user` change après, `joinRoom` n'est pas re-appelé

### Solution PROPOSÉE

**Option 1 : Attendre que `user` soit chargé**
```typescript
// Dans GameRoom.tsx, modifier le useEffect pour attendre user
useEffect(() => {
    const addLog = useDebugStore.getState().addLog;
    
    // ⚠️ ATTENDRE que user soit chargé
    if (loading) {
        addLog('⏳ [GAME_ROOM] En attente du chargement de user...', 'info');
        return;
    }
    
    // Si pas de roomId, rediriger
    if (!roomId) {
        addLog(`⚠️ [GAME_ROOM] Pas de roomId, redirection lobby`, 'warning');
        navigate('/lobby');
        return;
    }
    
    // ... reste du code
}, [roomId, mode, length, location.search, joinRoom, navigate, user, loading]);  // ✅ Ajouter user et loading
```

**Option 2 : Re-créer les joueurs quand `user` change**
```typescript
// Dans useGameSocket.ts, ajouter un useEffect pour mettre à jour les joueurs
useEffect(() => {
    if (currentRoom?.id === 'offline-bot' && user && players.length > 0) {
        const addLog = useDebugStore.getState().addLog;
        
        // Vérifier si le username du premier joueur est incorrect
        if (players[0]?.id === user.id && players[0]?.username !== user.username) {
            addLog(`🔄 [JOIN_ROOM] Mise à jour username: ${players[0].username} → ${user.username}`, 'info');
            
            const updatedPlayers = [
                { ...players[0], username: user.username, avatar: user.avatar },
                players[1]
            ];
            setPlayers(updatedPlayers);
        }
    }
}, [user, currentRoom?.id, players]);
```

**Option 3 : Forcer la récupération du username depuis profiles**
```typescript
// Dans useGameSocket.ts, ligne 296, récupérer le username depuis profiles
const soloPlayers = user 
    ? (async () => {
        // Récupérer le username depuis profiles si disponible
        let finalUsername = user.username || 'Joueur';
        try {
            const { data: profile } = await supabase
                .from('profiles')
                .select('username')
                .eq('id', user.id)
                .single();
            
            if (profile?.username) {
                finalUsername = profile.username;
            }
        } catch (err) {
            // Fallback sur user.username
        }
        
        return [
            { id: user.id, username: finalUsername, avatar: user.avatar },
            { id: botId, username: 'Bot IA', avatar: undefined }
        ];
    })()
    : [
        { id: 'guest', username: 'Invité', avatar: undefined },
        { id: botId, username: 'Bot IA', avatar: undefined }
      ];
```

---

## 🟠 PROBLÈME #4 : TESTS D'OUVERTURE ÉCHOUENT (6/6)

### Symptômes
- Tests attendent 2 coups pour une ouverture simple
- API retourne 6-8 coups au lieu de 2
- Exemple : "Ouverture 3-1" → Attendu 2, obtenu 7

### Code ACTUEL

**Fichier : `src/lib/aiService.ts` ligne 153-214** :
```typescript
let bestMoves = data.bestMoves || [];

// CRITICAL FIX FOR DOUBLES
const isDouble = dice.length === 2 && dice[0] === dice[1];

if (isDouble && bestMoves.length === 2) {
    addLog('🎲 Doubles detected - duplicating moves', 'info');
    bestMoves = [
        bestMoves[0],
        bestMoves[1],
        bestMoves[0],
        bestMoves[1]
    ];
}

// 4. Map moves back to Frontend coordinates
if (bestMoves.length > 0) {
    bestMoves = bestMoves.map((move: any) => {
        // ... mapping logic
    });
}
```

### Analyse REQUISE

1. **Vérifier la réponse brute de l'API** :
   - L'API retourne-t-elle vraiment 7 coups ou seulement 2 ?
   - Le log `🤖 AI Service: Raw Data received` montre quoi ?

2. **Vérifier le mapping** :
   - Le mapping crée-t-il des doublons ?
   - La logique de duplication pour doubles s'applique-t-elle aux non-doubles ?

3. **Vérifier les tests** :
   - Les tests comptent-ils correctement les coups ?
   - Y a-t-il une confusion entre "coups" et "mouvements" ?

### Solution PROPOSÉE

**Option 1 : Limiter les coups retournés**
```typescript
// Dans aiService.ts, après le mapping
if (bestMoves.length > 0) {
    // Pour les ouvertures simples (2 dés non-doubles), limiter à 2 coups
    const isDouble = dice.length === 2 && dice[0] === dice[1];
    if (!isDouble && dice.length === 2) {
        bestMoves = bestMoves.slice(0, 2);  // Prendre seulement les 2 premiers
        addLog('🎯 [AI] Limitation à 2 coups pour ouverture simple', 'info');
    }
    
    bestMoves = bestMoves.map((move: any) => {
        // ... mapping
    });
}
```

---

## 🟡 PROBLÈME #5 : INCOHÉRENCE DANS LES IDs

### Symptômes
- `myId` change entre `"guest-1"` et `"c1473d69-a765-4fd6-8c07-30b3b24d7470"` (UUID)
- Cela cause des problèmes de détection du tour

### Solution PROPOSÉE

**Forcer la cohérence** :
```typescript
// Dans useGameSocket.ts, toujours utiliser le même ID
const myId = user?.id || (players && players.length > 0 ? players[0].id : 'guest-1');
// Utiliser l'ID du premier joueur si user est undefined mais players existe
```

---

## 📋 PLAN D'ACTION PRIORITAIRE

### ÉTAPE 1 : CORRIGER L'ALTERNANCE DU TOUR (URGENT)
1. Ajouter des logs détaillés dans `sendGameAction` pour tracer chaque étape
2. Vérifier que `updateGame(newState)` est appelé avec le nouveau `turn`
3. Forcer l'alternance explicitement après chaque coup
4. Vérifier que le state Zustand est mis à jour réactivement

### ÉTAPE 2 : CORRIGER L'AFFICHAGE DES JETONS (URGENT)
1. Ajouter des logs dans `Point.tsx` pour vérifier `displayCount`
2. Forcer `opacity: 1` et `visibility: visible` dans `Checker.tsx`
3. Vérifier le z-index et le positionnement
4. Tester avec un checker simple sans animations

### ÉTAPE 3 : CORRIGER LE USERNAME (IMPORTANT)
1. Attendre que `user` soit chargé avant de créer les joueurs
2. Re-créer les joueurs quand `user` change
3. Récupérer le username depuis `profiles` table explicitement

### ÉTAPE 4 : CORRIGER LES TESTS D'OUVERTURE (MOYEN)
1. Limiter les coups retournés à 2 pour les ouvertures simples
2. Vérifier la logique de duplication pour doubles

---

## 🔍 CODE EXACT À CORRIGER

### Correction #1 : Alternance du tour FORCÉE

**Fichier : `src/hooks/useGameSocket.ts` ligne 758-792**

**REMPLACER** :
```typescript
if (newState.dice.length === 0) {
    const currentPlayerId = newState.turn;
    const myId = user?.id || 'guest-1';

    if (players && players.length > 1) {
        const newTurn = currentPlayerId === players[0].id ? players[1].id : players[0].id;
        newState.turn = newTurn;
        addLog(`🔄 [MOVE] Tour alterné: ${currentPlayerId} → ${newTurn}`, 'info');
    }
}
```

**PAR** :
```typescript
if (newState.dice.length === 0) {
    const currentPlayerId = newState.turn;
    const myId = user?.id || (players && players.length > 0 ? players[0].id : 'guest-1');
    const botId = players && players.length > 1 ? players[1].id : 'bot';
    
    // FORCER l'alternance explicitement
    let newTurn: string;
    if (players && players.length > 1) {
        newTurn = currentPlayerId === players[0].id ? players[1].id : players[0].id;
    } else {
        newTurn = currentPlayerId === myId ? botId : myId;
    }
    
    newState.turn = newTurn;
    
    // LOGS CRITIQUES
    const addLog = useDebugStore.getState().addLog;
    addLog(`🔄 [MOVE] FORCE Tour alterné: ${currentPlayerId} → ${newTurn}`, 'error', {
        currentPlayerId,
        newTurn,
        myId,
        botId,
        players: players?.map(p => ({ id: p.id, username: p.username })),
        diceLength: newState.dice.length,
        beforeUpdate: gameState.turn,
        afterUpdate: newState.turn
    });
    
    // FORCER la mise à jour IMMÉDIATE
    updateGame(newState);
    
    // Vérifier après un court délai
    setTimeout(() => {
        const updatedState = useGameStore.getState().gameState;
        const addLog = useDebugStore.getState().addLog;
        addLog(`✅ [MOVE] Vérification tour: attendu=${newTurn}, actuel=${updatedState?.turn}`, 
            updatedState?.turn === newTurn ? 'success' : 'error',
            { expected: newTurn, actual: updatedState?.turn, match: updatedState?.turn === newTurn }
        );
    }, 50);
}
```

### Correction #2 : Affichage des checkers FORCÉ

**Fichier : `src/components/Point.tsx` ligne 45-77**

**AJOUTER** après ligne 47 :
```typescript
// LOGS CRITIQUES POUR DEBUG
if (displayCount > 0) {
    console.log(`🎯 [POINT ${index}] Rendering ${displayCount} checkers`, {
        point,
        displayCount,
        player: point.player,
        count: point.count,
        hasPoint: !!point,
        pointType: typeof point
    });
}
```

**MODIFIER** ligne 100-103 :
```typescript
{/* Conteneur des pions */}
<div 
    className="relative z-10 flex flex-col items-center w-full py-2"
    style={{
        minHeight: displayCount > 0 ? '40px' : '0',
        visibility: 'visible',
        opacity: 1,
        zIndex: 10
    }}
>
    {checkers}
    {/* DEBUG : Afficher le nombre si > 0 */}
    {displayCount > 0 && process.env.NODE_ENV === 'development' && (
        <div className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 text-white text-[8px] rounded-full flex items-center justify-center z-50">
            {displayCount}
        </div>
    )}
</div>
```

**Fichier : `src/components/Checker.tsx` ligne 39-60**

**MODIFIER** le style :
```typescript
style={{
    width: '100%',
    height: '100%',
    zIndex: index + 100,  // Augmenter z-index
    opacity: isDragging ? 0.3 : 1,  // FORCER opacity
    visibility: 'visible',  // FORCER visibility
    position: 'absolute',  // FORCER position
    pointerEvents: draggable ? 'auto' : 'none',  // Permettre les interactions
}}
```

### Correction #3 : Username depuis user

**Fichier : `src/pages/GameRoom.tsx` ligne 97-149**

**MODIFIER** le useEffect pour attendre user :
```typescript
useEffect(() => {
    const addLog = useDebugStore.getState().addLog;
    
    // ⚠️ CRITIQUE : Attendre que user soit chargé
    if (loading) {
        addLog('⏳ [GAME_ROOM] En attente du chargement de user...', 'info', { loading });
        return;
    }
    
    // Si pas de roomId, rediriger
    if (!roomId) {
        addLog(`⚠️ [GAME_ROOM] Pas de roomId, redirection lobby`, 'warning');
        navigate('/lobby');
        return;
    }
    
    // Si déjà rejoint cette room, skip
    if (hasJoinedRef.current === roomId) {
        addLog(`✅ [GAME_ROOM] Déjà rejoint ${roomId}, skip`, 'info');
        return;
    }
    
    // Si déjà dans la bonne room, skip
    if (currentRoom && currentRoom.id === roomId) {
        hasJoinedRef.current = roomId;
        addLog(`✅ [GAME_ROOM] Déjà dans la room ${roomId}, skip`, 'info');
        return;
    }
    
    addLog(`🎮 [GAME_ROOM] Démarrage join - roomId: ${roomId}`, 'info', { 
        roomId, 
        user: user?.id, 
        username: user?.username,
        hasUser: !!user,
        loading 
    });
    
    // ... reste du code
}, [roomId, mode, length, location.search, joinRoom, navigate, user, loading]);  // ✅ Ajouter user et loading
```

**Fichier : `src/hooks/useGameSocket.ts` ligne 296-304**

**MODIFIER** pour utiliser le vrai username :
```typescript
// CRITIQUE : Utiliser le vrai username de user, pas 'Invité'
const soloPlayers = user    
    ? [
        { 
            id: user.id, 
            username: user.username || user.email?.split('@')[0] || 'Joueur',  // ✅ Prioriser username
            avatar: user.avatar 
        },
        { id: botId, username: 'Bot IA', avatar: undefined }
      ]
    : [
        // Même en mode guest, essayer de récupérer un username si disponible
        { 
            id: 'guest', 
            username: 'Invité',  // Fallback seulement
            avatar: undefined 
        },
        { id: botId, username: 'Bot IA', avatar: undefined }
      ];
```

---

## ✅ VALIDATION FINALE

Après corrections, vérifier :

1. **Tour alterne** : Les logs montrent `🔄 [MOVE] FORCE Tour alterné: guest-1 → bot`
2. **Bot joue** : Les logs montrent `🤖 Bot: Checking turn... { isBotTurn: true }`
3. **Checkers visibles** : 30 checkers affichés sur le plateau
4. **Username correct** : Le vrai username est affiché, pas "Invité"
5. **Tests passent** : Les tests d'ouverture retournent 2 coups

---

## 🚨 INSTRUCTIONS FINALES

**TU DOIS :**
1. Lire TOUS les fichiers mentionnés en entier
2. Identifier la CAUSE RACINE de chaque problème
3. Proposer des solutions CONCRÈTES avec code exact
4. Expliquer POURQUOI chaque solution fonctionne
5. Tester chaque correction individuellement

**NE PAS :**
- Faire des suppositions sans vérifier le code
- Proposer des solutions sans expliquer la cause
- Ignorer les problèmes de timing/synchronisation
- Oublier de vérifier les logs et le state

**PRIORITÉ ABSOLUE :** Le bot doit jouer. Le tour doit alterner. Les checkers doivent être visibles.

---

**COMMENCE PAR LE PROBLÈME #1 (Tour ne change pas) - C'EST LE PLUS CRITIQUE.**
```

Le prompt est prêt. Souhaitez-vous que je le pousse dans le dépôt ou que je l’améliore encore ?
<｜tool▁calls▁begin｜><｜tool▁call▁begin｜>
run_terminal_cmd
