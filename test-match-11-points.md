# Test Match de 11 Points - Checklist des Règles

## Règles à Vérifier

### 1. Règles de Base
- [ ] Lancement des dés au début de chaque tour
- [ ] Dés générés aléatoirement (1-6)
- [ ] Tour alterné correctement (joueur → bot → joueur)
- [ ] Mouvements légaux uniquement

### 2. Règles des Doubles
- [ ] Double génère 4 dés identiques
- [ ] Double permet 4 mouvements (pas 2)
- [ ] Chaque mouvement consomme 1 dé
- [ ] Tour ne change que quand tous les dés sont consommés

### 3. Règles de Mouvement
- [ ] Mouvement vers point vide autorisé
- [ ] Mouvement vers point avec checker de même couleur autorisé
- [ ] Mouvement vers point avec 1 checker adverse = hit (checker va au bar)
- [ ] Mouvement vers point avec 2+ checkers adverses = interdit
- [ ] Checker sur le bar doit être rentré avant autres mouvements
- [ ] Mouvement en arrière interdit (sauf bear off)

### 4. Règles du Bear Off
- [ ] Bear off possible seulement quand tous les checkers sont dans le home board
- [ ] Bear off avec valeur exacte du dé
- [ ] Bear off avec valeur supérieure si aucun checker sur point inférieur
- [ ] Bear off obligatoire si possible

### 5. Règles de Fin de Partie
- [ ] Partie gagnée quand tous les checkers sont sortis
- [ ] Gammon = adversaire n'a sorti aucun checker (x2 points)
- [ ] Backgammon = adversaire a checker dans home board adverse (x3 points)
- [ ] Score du match mis à jour correctement

### 6. Règles du Match
- [ ] Match de 11 points initialisé correctement
- [ ] Score affiché correctement
- [ ] Match se termine quand un joueur atteint 11 points
- [ ] Nouvelle partie démarre automatiquement

### 7. Règles du Doubling Cube
- [ ] Cube au centre au début
- [ ] Double proposable seulement au début du tour (avant lancer dés)
- [ ] Double accepté/refusé correctement
- [ ] Cube passe à l'adversaire si refusé
- [ ] Points multipliés par valeur du cube

## Bugs à Capturer

- Mouvements illégaux autorisés
- Mouvements légaux bloqués
- Doubles mal gérés
- Bear off incorrect
- Score incorrect
- Fin de partie incorrecte
- Gammon/Backgammon non détectés


