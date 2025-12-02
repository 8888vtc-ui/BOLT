# 🏆 Guide de Jeu : Tournois

Le système de tournois est maintenant complet et fonctionnel ! Voici comment l'activer et l'utiliser.

## 1. Activer la Logique de Tournoi (Backend)

Une nouvelle migration SQL a été créée pour gérer automatiquement la création des salles de jeu (Rooms) et des parties (Games) lorsqu'un tournoi commence.

**Action requise :**
Appliquez la migration `supabase/migrations/20251202_tournament_logic.sql` sur votre base de données Supabase.

```bash
supabase db push
```
*Ou copiez le contenu du fichier dans l'éditeur SQL de votre dashboard Supabase.*

## 2. Déroulement d'un Tournoi

### Étape 1 : Création et Inscription
1.  Allez sur la page **Tournois**.
2.  Cliquez sur **"Créer un Tournoi"** et configurez-le (Format, Date, etc.).
3.  Les joueurs s'inscrivent via le bouton **"S'inscrire"**.
4.  Le tournoi apparaît dans la section "Mes Tournois" avec le statut "Inscrit".

### Étape 2 : Démarrage (Manuel)
1.  Le créateur du tournoi voit un bouton **"Démarrer"** dans la section "Mes Tournois" (si le statut est "Inscription ouverte").
2.  En cliquant dessus, le tournoi passe en "En cours".
3.  L'arbre (bracket) est généré et les matchs sont créés.
4.  **Une salle de jeu (Room) est créée automatiquement pour chaque match.**

### Étape 3 : Jouer le Match
1.  Dans la section "Mes Tournois", si le tournoi est "En cours", un bouton **"Jouer le Match"** apparaît.
2.  Cliquez dessus pour être redirigé directement vers votre salle de jeu.
3.  Jouez votre match normalement (avec videau, chat, etc.).

### Étape 4 : Progression
*À implémenter dans le futur :*
-   Une fois le match terminé, le gagnant avance automatiquement au tour suivant.
-   L'arbre se met à jour.

## ✅ État Actuel du Jeu

-   **Videau** : Fonctionnel (Logic + UI + Chat).
-   **Chat** : Fonctionnel (Messages joueurs + Système).
-   **Coach** : Fonctionnel (Texte + Vidéo HeyGen).
-   **Tournois** : Fonctionnel (Création, Inscription, Matchmaking, Redirection vers la Game Room).

**Le jeu est donc fonctionnel ! 🚀**
