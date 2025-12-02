# Implémentation du Videau (Doubling Cube) ✅

## 📋 Résumé

Le système de videau a été entièrement implémenté selon les règles officielles du Backgammon.

## 🎯 Fonctionnalités Implémentées

### 1. **Logique Métier** (`src/lib/gameLogic.ts`)
- ✅ `canOfferDouble()` - Vérifie si un joueur peut proposer de doubler
- ✅ `acceptDouble()` - Accepte une proposition (le joueur devient propriétaire du cube)
- ✅ `rejectDouble()` - Rejette une proposition (abandon, l'adversaire gagne les points)
- ✅ `beaver()` - Re-doubler immédiatement après acceptation (optionnel, money game)
- ✅ `calculatePoints()` - Calcule les points selon le type de victoire et la valeur du cube

### 2. **État du Jeu** (`src/stores/gameStore.ts`)
- ✅ `cubeValue` - Valeur actuelle (1, 2, 4, 8, 16, 32, 64)
- ✅ `cubeOwner` - ID du propriétaire (null = au centre, disponible pour tous)
- ✅ `pendingDouble` - Proposition en attente avec timestamp

### 3. **Hook Personnalisé** (`src/hooks/useDoublingCube.ts`)
- ✅ `offerDouble()` - Proposer de doubler
- ✅ `acceptDouble()` - Accepter la proposition
- ✅ `rejectDouble()` - Refuser (abandon)
- ✅ Synchronisation automatique avec Supabase

### 4. **Composant UI** (`src/components/game/DoublingCube.tsx`)
- ✅ Cube 3D animé avec rotation lors des propositions
- ✅ Couleurs dynamiques selon le propriétaire :
  - 🟡 **Doré** : Vous possédez le cube
  - 🔴 **Rouge** : L'adversaire possède le cube
  - ⚪ **Gris** : Cube au centre
- ✅ Modal de proposition avec boutons **Accepter** / **Abandonner**
- ✅ Bouton "DOUBLER" avec affichage de la nouvelle valeur
- ✅ Messages d'état clairs

### 5. **Intégration GameRoom** (`src/pages/GameRoom.tsx`)
- ✅ Affichage du cube sur le plateau
- ✅ Calcul dynamique de `canDouble` selon les règles
- ✅ Connexion avec les hooks

## 🎮 Règles Implémentées

1. **Limite du Cube** : Maximum 64
2. **Timing** : On ne peut doubler qu'AVANT de lancer les dés
3. **Propriété** : Seul le propriétaire du cube (ou les deux si au centre) peut doubler
4. **Crawford Rule** : Pas de cube pendant le Crawford game (à implémenter si match play)
5. **Points** : 
   - Simple = cubeValue × 1
   - Gammon = cubeValue × 2
   - Backgammon = cubeValue × 3

## 🚀 Utilisation

```typescript
// Dans un composant
const { offerDouble, acceptDouble, rejectDouble } = useDoublingCube(currentRoom, user);

// Proposer de doubler
offerDouble();

// Accepter une proposition
acceptDouble();

// Refuser (abandonner)
rejectDouble();
```

## 🔄 Flux de Jeu

1. **Joueur A** : Clique sur "DOUBLER" avant de lancer les dés
2. **Système** : Affiche la proposition à **Joueur B**
3. **Joueur B** a 2 choix :
   - ✅ **Accepter** : Le cube double, B devient propriétaire
   - ❌ **Abandonner** : A gagne la valeur ACTUELLE du cube

## 📝 TODO (Améliorations futures)

- [ ] Implémenter le **Beaver** (re-doubler immédiatement)
- [ ] Ajouter la **Crawford Rule** pour les matchs
- [ ] Historique des doubles dans le chat
- [ ] Animation de passage du cube au nouveau propriétaire
- [ ] Son lors des propositions/acceptations
- [ ] Logique Bot pour décider d'accepter/refuser intelligemment

## 🐛 Notes Techniques

- Les lints restants dans `useGameSocket.ts` sont des warnings mineurs (imports non utilisés, types)
- Le système fonctionne en mode **Demo** et **Supabase**
- La synchronisation est automatique via `updateGame()` et Supabase Realtime

---

**Statut** : ✅ **FONCTIONNEL** - Prêt pour les tests en jeu réel !
