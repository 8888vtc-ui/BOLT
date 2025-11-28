# 🚀 GURUGAMMON ANTIGRAVITY - QUICK START

## 💥 Tu veux voir la magie maintenant ?

### Étape 1 : Lance le Backend (Port 8888)

```bash
# Dans un terminal séparé
cd ton-backend-gurugammon
npm start  # ou node server.js
# Doit tourner sur http://localhost:8888
```

### Étape 2 : Lance le Frontend (Port 5173)

```bash
cd gurugammon-antigravity
npm run dev
```

### Étape 3 : Ouvre ton navigateur

```
http://localhost:5173
```

### 🎯 Ce que tu vas voir :

1. **Splash screen** (1 seconde)
   - Loader doré qui tourne
   - Logo "GuruGammon" qui fade in

2. **Page d'accueil**
   - Logo 3D qui tourne en permanence
   - 20 particules dorées qui flottent
   - Titre "GuruGammon Antigravity" en 3D
   - Bouton "JOUER MAINTENANT" qui pulse
   - 4 features avec hover effects
   - Bouton Google OAuth en bas

3. **Cliquer sur "JOUER MAINTENANT"**
   - Scroll smooth vers le bouton Google
   - Ou redirection vers /lobby si déjà connecté

4. **Se connecter avec Google**
   - Modal Google OAuth
   - Avatar créé automatiquement
   - Toast "Bienvenue [ton nom] !"
   - Redirection vers /lobby

5. **Le Lobby** 🏆
   - Liste de rooms en grille 3 colonnes
   - Hover sur une card → elle se soulève avec glow doré
   - Badge "LIVE" qui pulse en rouge
   - Badge "En cours" en vert
   - Badge "En attente" en gris
   - Bouton "Créer une Partie" en haut à droite

6. **Créer une partie**
   - Modal qui slide depuis le haut
   - Options:
     - Nom de la salle
     - Timer par tour (10s à 5min)
     - Match en X points
     - Nombre de joueurs (2 ou 4)
     - Enjeu (1× à 50×)
     - Toggle "Salle privée" avec mot de passe
   - Bouton "Créer la Partie" qui brille

7. **Rejoindre une partie**
   - Click sur "Rejoindre"
   - Toast "Connexion à la partie..."
   - Redirection vers /game/:roomId

8. **La Game Room** 🎮
   - Layout 3 colonnes:
     - **Gauche**: Joueur 1, Historique, Dés
     - **Centre**: Plateau de backgammon
     - **Droite**: Joueur 2, Chat

9. **Le Plateau**
   - Texture bois réaliste
   - 24 points en triangle (SVG gradient)
   - Bar central avec "ANTIGRAVITY"
   - Off-board à droite
   - Bordures dorées
   - Checkers blancs et noirs
   - Drag & drop fonctionnel

10. **Les Dés**
    - Bouton "Lancer les dés"
    - Animation 3D (rotation 720°)
    - Dots qui apparaissent
    - Résultat en gros

11. **Le Doubling Cube**
    - Cube doré 3D
    - Valeur actuelle (1, 2, 4, 8, 16, 32, 64)
    - Bouton "Doubler" si ton tour
    - Modal de confirmation

12. **Le Chat**
    - Messages en temps réel
    - Bulles différentes par joueur
    - Timestamps
    - Scroll auto
    - Input avec compteur de caractères

13. **Les Toasts**
    - Apparaissent en haut à droite
    - 5 types avec icônes et couleurs
    - Auto-ferment après 3-5s
    - Barre de progression
    - Close button

### 🎨 Interactions à Tester

#### Dans le Lobby:
- Hover sur une room card → lift effect + glow
- Click sur refresh → animation de rotation
- Click sur "Créer une Partie" → modal slide-in
- Toggle "Salle privée" → input mot de passe apparaît
- Skeleton loading si aucune room

#### Dans la Game Room:
- Click sur "Lancer les dés" → animation 3D
- Drag un checker → cursor grab, glow doré
- Hover sur le cube → rotation 3D
- Écrire dans le chat → bulle qui slide-in
- Timer qui descend → cercle rouge à <10s
- Click sur avatar → pulse effect

#### Navigation:
- Logo dans navbar → hover rotation 12°
- Avatar dans navbar → pulse si notification
- Toggle dark/light → rotation 180°
- Bouton déconnexion → hover red

### 🔥 Raccourcis Clavier (TODO)

- `Esc` → Ferme modal/dialog
- `Enter` dans chat → Envoie message
- `Space` → Lance les dés (si ton tour)
- `1-6` → Sélectionne un point (debug)

### 📊 Debug Tools

Ouvre la console pour voir:
- WebSocket connection status
- Game state updates
- Move validation
- Chat messages
- Errors

### 🎯 Ce Qui Devrait Marcher

✅ Splash screen  
✅ Hero avec particules  
✅ Google OAuth  
✅ Navigation avec animations  
✅ Lobby avec rooms  
✅ Création de room  
✅ Join room  
✅ Plateau responsive  
✅ Dés animés  
✅ Chat temps réel  
✅ Toasts partout  
✅ Glassmorphism  
✅ Hover effects  
✅ Mobile responsive  

### ⚠️ Ce Qui Peut Ne Pas Marcher

Si le backend n'est pas lancé:
- ❌ Liste des rooms vide
- ❌ Création de room échoue
- ❌ Chat ne fonctionne pas
- ❌ Dés ne se lancent pas

Si Google OAuth pas configuré:
- ❌ Bouton Google en erreur
- → Utilise un compte test manuel

### 🐛 En Cas de Problème

```bash
# Vérifier que le backend tourne
curl http://localhost:8888/api/health

# Vérifier les WebSockets
# Dans la console navigateur:
ws://localhost:8888/socket.io

# Nettoyer et rebuild
rm -rf node_modules dist
npm install
npm run build
npm run dev

# Vider le localStorage
# Dans la console:
localStorage.clear()
```

### 🏆 La Check-list Ultime

1. [ ] Backend tourne sur port 8888
2. [ ] Frontend tourne sur port 5173
3. [ ] Splash screen apparaît
4. [ ] Particules flottent
5. [ ] Logo tourne au hover
6. [ ] Bouton pulse
7. [ ] Google OAuth fonctionne
8. [ ] Lobby affiche des rooms
9. [ ] Hover lift les cards
10. [ ] Modal création s'ouvre
11. [ ] Room se crée
12. [ ] Plateau s'affiche
13. [ ] Dés se lancent
14. [ ] Chat envoie messages
15. [ ] Toasts apparaissent

Si tous les ✅ sont verts:

**🎉 FÉLICITATIONS ! TU AS LE PLUS BEAU BACKGAMMON DU MONDE ! 🎉**

---

Enjoy! 🚀
