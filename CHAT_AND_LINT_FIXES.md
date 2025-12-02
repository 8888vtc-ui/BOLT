# 🛠️ Mises à jour : Chat & Correctifs

## ✅ Chat Système (Videau)

Les actions du videau sont maintenant annoncées dans le chat pour tous les joueurs.

### Modifications
1. **`src/stores/gameStore.ts`** : Ajout du type `system` aux messages.
2. **`src/components/game/ChatBox.tsx`** : Affichage spécial pour les messages système (centrés, style discret).
3. **`src/hooks/useDoublingCube.ts`** : Envoi automatique de messages lors des actions :
   - "Joueur propose de doubler à 2"
   - "Joueur accepte le double. Cube à 2"
   - "Joueur refuse le double et abandonne la partie."

## 🧹 Correctifs Techniques (Lint)

Plusieurs erreurs de type et d'import ont été corrigées pour assurer un build propre.

1. **`src/lib/aiService.ts`** : Export correct de l'interface `AIAnalysis`.
2. **`src/hooks/useGameSocket.ts`** :
   - Correction du niveau de log (`warning` -> `error`).
   - Suppression des imports inutilisés.
   - Suppression des TODOs obsolètes.

## 🚀 État Actuel

- **Chat** : Supporte les messages système.
- **Videau** : Intégré au chat.
- **Build** : Plus propre (moins de warnings/erreurs).

---

## 🧪 À Tester

1. **Lancer une partie** (contre bot ou autre joueur).
2. **Proposer un double**.
3. **Vérifier le chat** : Un message système doit apparaître.
