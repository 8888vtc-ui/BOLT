# 🧪 TESTS FONCTIONNELS - GUIDE MANUEL

## 📋 Checklist de Tests Manuels

### 1. Authentification

#### Test 1.1 : Connexion Google OAuth
- [ ] Aller sur `/login`
- [ ] Cliquer sur "Continue with Google"
- [ ] Vérifier la redirection vers Google
- [ ] Se connecter avec un compte Google
- [ ] Vérifier la redirection vers `/dashboard`
- [ ] Vérifier que le nom utilisateur s'affiche
- [ ] Vérifier que l'avatar s'affiche (si disponible)

#### Test 1.2 : Mode Invité
- [ ] Se déconnecter
- [ ] Aller sur `/login`
- [ ] Cliquer sur "Play as Guest"
- [ ] Vérifier la redirection vers `/dashboard`
- [ ] Vérifier le nom "Guest_XXXXX"
- [ ] Vérifier que le mode invité fonctionne

#### Test 1.3 : Déconnexion
- [ ] Cliquer sur "Logout" dans la navbar
- [ ] Vérifier la redirection vers `/login`
- [ ] Vérifier que la session est supprimée

---

### 2. Navigation

#### Test 2.1 : Routes principales
- [ ] `/` - Page d'accueil s'affiche
- [ ] `/login` - Page de connexion s'affiche
- [ ] `/dashboard` - Dashboard s'affiche (si connecté)
- [ ] `/lobby` - Lobby s'affiche
- [ ] `/tournaments` - Tournois s'affichent
- [ ] `/leaderboard` - Classement s'affiche
- [ ] `/profile` - Profil s'affiche

#### Test 2.2 : Routes protégées
- [ ] Accéder à `/dashboard` sans être connecté → Redirection vers `/login`
- [ ] Se connecter → Accès autorisé

---

### 3. Dashboard

#### Test 3.1 : Affichage des données
- [ ] Nom utilisateur affiché
- [ ] Statistiques affichées (wins, losses, win rate)
- [ ] ELO affiché
- [ ] Parties récentes affichées
- [ ] Trophées affichés (si disponibles)

#### Test 3.2 : Actions
- [ ] Bouton "Jouer contre l'IA" fonctionne
- [ ] Redirection vers `/game/offline-bot`
- [ ] Boutons de navigation fonctionnent

---

### 4. Jeu de Base

#### Test 4.1 : Plateau de Backgammon
- [ ] Plateau s'affiche correctement
- [ ] 24 points visibles
- [ ] Pions aux bonnes positions initiales
- [ ] Zones barre et sortie visibles
- [ ] Design cohérent (noir/or)

#### Test 4.2 : Lancer les Dés
- [ ] Bouton "Lancer les dés" visible
- [ ] Bouton fonctionne quand c'est mon tour
- [ ] Dés s'affichent après le lancer
- [ ] Un seul lancer par tour
- [ ] Bouton désactivé après lancer

#### Test 4.3 : Déplacement des Pions
- [ ] Drag & drop fonctionne (desktop)
- [ ] Tap fonctionne (mobile)
- [ ] Coups valides acceptés
- [ ] Coups invalides rejetés
- [ ] Animation des déplacements
- [ ] Feedback visuel des coups possibles

#### Test 4.4 : Validation des Coups
- [ ] Coups selon les règles du backgammon
- [ ] Gestion de la barre (entrée obligatoire)
- [ ] Gestion du bear-off (sortie)
- [ ] Blots protégés correctement

---

### 5. Bot IA

#### Test 5.1 : Bot Automatique
- [ ] Bot joue automatiquement quand c'est son tour
- [ ] Délai raisonnable entre les coups
- [ ] Coups du bot sont valides
- [ ] Pas de blocage du bot
- [ ] Bot termine son tour correctement

#### Test 5.2 : API Bot
- [ ] Appels API vers BotGammon fonctionnent
- [ ] Réponses API correctes
- [ ] Fallback si API échoue
- [ ] Logs visibles dans DebugOverlay

#### Test 5.3 : Synchronisation
- [ ] Pas de coups simultanés
- [ ] État du jeu synchronisé
- [ ] Tour alterné correctement

---

### 6. Modes de Jeu

#### Test 6.1 : Money Game
- [ ] Créer une partie Money Game
- [ ] Jouer jusqu'à la fin
- [ ] Points calculés correctement
- [ ] Fin de partie détectée
- [ ] Modal de victoire s'affiche

#### Test 6.2 : Match Game
- [ ] Créer un match 3 points
- [ ] Jouer une partie
- [ ] Score de match calculé correctement
- [ ] Score affiché correctement
- [ ] Fin de match détectée (3 points atteints)
- [ ] Modal de victoire de match s'affiche

#### Test 6.3 : Doubling Cube
- [ ] Bouton "Double" visible quand approprié
- [ ] Offre de double fonctionne
- [ ] Acceptation/refus fonctionne
- [ ] Valeur du cube mise à jour
- [ ] Points multipliés correctement

---

### 7. Interface Utilisateur

#### Test 7.1 : Responsive Design
- [ ] Desktop : Layout correct
- [ ] Tablet : Layout adapté
- [ ] Mobile : Layout adapté
- [ ] Touch interactions fonctionnent

#### Test 7.2 : Composants
- [ ] Navbar fonctionne
- [ ] ChatBox fonctionne (si disponible)
- [ ] DebugOverlay fonctionne
- [ ] Modals fonctionnent
- [ ] Toast notifications fonctionnent

#### Test 7.3 : Animations
- [ ] Animations fluides
- [ ] Pas de lag
- [ ] Transitions agréables

---

### 8. Système de Logs

#### Test 8.1 : DebugOverlay
- [ ] DebugOverlay visible (bouton en bas à gauche)
- [ ] Logs s'affichent
- [ ] Filtres fonctionnent (info, error, warning, success)
- [ ] Recherche fonctionne
- [ ] Export fonctionne
- [ ] Compteurs corrects

#### Test 8.2 : Logs du Bot
- [ ] Logs du bot visibles
- [ ] Logs des erreurs visibles
- [ ] Logs des actions visibles
- [ ] Logs utiles pour le debug

---

### 9. Performance

#### Test 9.1 : Chargement
- [ ] Page d'accueil charge rapidement (< 2s)
- [ ] Dashboard charge rapidement (< 2s)
- [ ] Jeu charge rapidement (< 3s)
- [ ] Pas de freeze

#### Test 9.2 : Réactivité
- [ ] Interactions immédiates
- [ ] Pas de lag lors des mouvements
- [ ] Animations fluides (60fps)

---

### 10. Erreurs et Edge Cases

#### Test 10.1 : Gestion des Erreurs
- [ ] Erreurs API gérées gracieusement
- [ ] Messages d'erreur clairs
- [ ] Pas de crash de l'application
- [ ] Fallback fonctionne

#### Test 10.2 : Edge Cases
- [ ] Partie complète jusqu'à la fin
- [ ] Gammon détecté correctement
- [ ] Backgammon détecté correctement
- [ ] Abandon fonctionne
- [ ] Reconnexion après déconnexion

---

## 📊 Résultats Attendus

### Critères de Succès
- ✅ Tous les tests d'authentification passent
- ✅ Tous les tests de jeu passent
- ✅ Bot fonctionne correctement
- ✅ Modes Money et Match fonctionnent
- ✅ Interface responsive
- ✅ Performance acceptable
- ✅ Pas d'erreurs critiques

### Problèmes Acceptables
- ⚠️ Petits retards occasionnels (< 500ms)
- ⚠️ Warnings mineurs dans la console
- ⚠️ Animations parfois moins fluides sur mobile

### Problèmes Critiques
- ❌ Crash de l'application
- ❌ Bot bloqué
- ❌ Erreurs API fréquentes
- ❌ Données non sauvegardées
- ❌ Authentification ne fonctionne pas

---

## 📝 Template de Rapport

```
Date: ___________
Testeur: ___________

Résultats:
- Authentification: ✅ / ❌
- Navigation: ✅ / ❌
- Dashboard: ✅ / ❌
- Jeu de Base: ✅ / ❌
- Bot IA: ✅ / ❌
- Modes de Jeu: ✅ / ❌
- Interface: ✅ / ❌
- Logs: ✅ / ❌
- Performance: ✅ / ❌
- Erreurs: ✅ / ❌

Problèmes identifiés:
1. ___________
2. ___________
3. ___________

Recommandations:
1. ___________
2. ___________
3. ___________
```

