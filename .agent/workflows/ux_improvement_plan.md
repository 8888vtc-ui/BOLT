---
description: Plan d'amélioration UX/UI pour le jeu de Backgammon
---

# Plan d'Amélioration UX/UI - Backgammon Premium

Ce plan vise à transformer l'expérience utilisateur pour atteindre un niveau professionnel et engageant.

## 1. Priorités immédiates (Impact Visuel Fort)
- [ ] **Plateau et Pions** :
    - Remplacer les formes basiques par des assets vectoriels (SVG) nets.
    - Augmenter le contraste entre les pions et le plateau.
    - Ajouter des ombres douces (`box-shadow`) pour la profondeur.
- [ ] **Couleurs et Palette** :
    - Définir 2 couleurs principales + 2 couleurs d'accent.
    - Assurer un contraste accessible (WCAG).
    - Suggestion : Bois chaud (#8B5E3C), Crème (#F6EFE6), Accent Teal (#2AA6A6), Sombre (#222831).
- [ ] **Typographie** :
    - Police lisible pour les boutons (ex: Inter, Roboto).
    - Police stylée pour les titres (ex: Playfair Display, Cinzel).
    - Taille adaptée pour mobile.

## 2. Micro-interactions et Animations (Game Juice)
- [ ] **Lancer de dés** : Animation courte (0.6s) avec easing et rebond.
- [ ] **Déplacement des pions** :
    - Animation fluide avec `framer-motion`.
    - Effet de "snap" final satisfaisant.
    - Feedback visuel pour les coups valides (surbrillance) et invalides (secousse).
- [ ] **Cube de doublement** : Animation de rotation et mise en valeur lors de l'offre.

## 3. Lisibilité et UX du Plateau
- [ ] **Grille et Repères** : Numéros de points discrets, repères pour la barre et le bear-off.
- [ ] **Indicateurs de Tour** : Bandeau clair "À vous" / "À l'adversaire" + Timer.
- [ ] **Historique** : Panneau latéral compact avec les derniers coups.

## 4. Thèmes et Personnalisation
- [ ] **Système de Thèmes** : Classique, Bois, Moderne, Nuit.
- [ ] **Skins de Pions** : Textures bois, marbre, métal.
- [ ] **Mode Daltonien** : Palette alternative accessible.

## 5. Performance et Adaptabilité
- [ ] **SVG** : Utilisation exclusive de SVG pour le plateau (rendu net).
- [ ] **Responsive** : Adaptation parfaite Mobile/Tablette/Desktop.
- [ ] **Lazy Loading** : Chargement des assets lourds à la demande.

## 6. Cohérence Visuelle
- [ ] **Iconographie** : Set d'icônes cohérent (Lucide React).
- [ ] **Feedback** : Messages d'erreur et de succès clairs (Toasts).
- [ ] **Transitions** : Fondus légers entre les écrans.

## 7. Plan d'Exécution (Sprint de 7 jours)
1.  **Jour 1** : Définition de la palette, typographie et Style Guide.
2.  **Jour 2** : Création des assets SVG (Plateau, Pions).
3.  **Jour 3** : Implémentation des animations (Dés, Mouvements).
4.  **Jour 4** : Intégration du système de thèmes.
5.  **Jour 5** : Responsive Design et Optimisation.
6.  **Jour 6** : Tests utilisateurs et ajustements.
7.  **Jour 7** : Polissage final et déploiement.

## Exemples Concrets (Immédiat)
- [ ] Remplacer le rendu CSS du plateau par un SVG.
- [ ] Ajouter `box-shadow: 0 6px 18px rgba(0,0,0,0.15)` aux pions.
- [ ] Animation dés : `keyframes` rotation + bounce.
