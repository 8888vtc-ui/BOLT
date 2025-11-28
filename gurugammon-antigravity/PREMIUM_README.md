# 🎮 GuruGammon Antigravity - Frontend Premium

## 🌟 Le Frontend de Backgammon le Plus Beau du Monde

Tu as maintenant entre les mains le frontend le plus spectaculaire jamais créé pour un jeu de backgammon.

### ✨ Caractéristiques Premium

- **Design AAA** : Glassmorphism, gradients animés, ombres dorées
- **Animations Fluides** : Framer Motion partout, micro-interactions subtiles
- **Typographie Premium** : Outfit + Satoshi, text-3d effects
- **Couleurs Luxueuses** : Palette Or/Bois/Obsidian profond
- **Particules Flottantes** : Effets visuels atmosphériques
- **Connexion Google** : Auth moderne avec @react-oauth/google
- **Toast Notifications** : react-hot-toast avec style custom
- **Reconnexion Auto** : WebSocket avec exponential backoff
- **Responsive Total** : Mobile-first, breakpoints fluides

### 🚀 Lancer le Projet

```bash
cd gurugammon-antigravity
npm install  # (déjà fait)
npm run dev  # Port 5173
```

### 🎨 Stack Technique

- React 18 + Vite 5
- Tailwind CSS 3 avec thème custom
- Framer Motion pour animations
- @heroicons/react pour icônes
- Socket.IO Client pour temps réel
- Zustand pour state management
- React Hot Toast pour notifications
- React Router v6

### 📁 Structure (15 fichiers clés créés)

1. **package.json** - Toutes les deps premium
2. **vite.config.js** - Port 5173 + proxy vers 8888
3. **tailwind.config.js** - Thème gold/obsidian/wood + animations
4. **postcss.config.js** - Config PostCSS
5. **.env** - Variables d'environnement
6. **index.html** - Splash screen + fonts + favicon SVG
7. **src/main.jsx** - GoogleOAuthProvider + Toaster
8. **src/App.jsx** - Routes avec AnimatePresence
9. **src/index.css** - Glassmorphism + animations globales
10. **src/context/AuthContext.jsx** - Auth avec avatars + notifications
11. **src/hooks/useGameSocket.js** - Reconnexion auto + toast
12. **src/components/layout/Navbar.jsx** - Glass navbar avec animations
13. **src/components/auth/GoogleLoginButton.jsx** - Bouton Google épique
14. **src/pages/Home.jsx** - Hero 3D + particules + scroll effects
15. **src/pages/Lobby.jsx** - Grille de rooms avec hover effects

### 🎯 Fonctionnalités Visuelles

#### Page d'Accueil (Home.jsx)
- Logo animé 3D qui tourne
- Titre avec effet text-3d + gradient animé
- Particules flottantes en arrière-plan
- Bouton "JOUER MAINTENANT" qui pulse
- Section features avec hover effects
- Smooth scroll vers login

#### Lobby (Lobby.jsx)
- Header avec gradient animé
- Cards avec lift effect au hover
- Badge "En cours" / "En attente" qui pulse
- Bouton refresh avec rotation
- Glassmorphism partout
- Animations d'entrée fluides

#### Navbar
- Avatar avec ring doré
- Notification pulse effect
- Toggle dark/light avec rotation 180°
- Glassmorphism + backdrop-blur
- Hover effects sur tous les éléments

### 🔮 Animations Custom

- `float` - Flottement doux (6s)
- `shimmer` - Effet de brillance
- `gradient` - Gradient animé (8s)
- `pulse-slow` - Pulse lent (3s)
- `wiggle` - Oscillation subtile
- `slide-up / slide-down` - Entrées fluides
- `scale-in` - Zoom d'entrée

### 🎨 Classes Utility Custom

- `.glass` - Glassmorphism léger
- `.glass-strong` - Glassmorphism intense
- `.glow-gold` - Ombre lumineuse dorée
- `.glow-gold-intense` - Ombre intense
- `.text-3d` - Effet texte 3D
- `.gradient-text` - Text avec gradient animé
- `.btn-primary` - Bouton premium avec shimmer
- `.btn-glass` - Bouton glassmorphism
- `.card-hover` - Carte avec lift effect

### 🌐 Backend Connexion

Le frontend est configuré pour se connecter à :
- **HTTP API** : `http://localhost:8888/api`
- **WebSocket** : `ws://localhost:8888/socket.io`

Tout est proxyfié via Vite (voir vite.config.js).

### 🔐 Auth Google

1. Obtiens un Google Client ID sur https://console.cloud.google.com
2. Remplace `VITE_GOOGLE_CLIENT_ID` dans `.env`
3. Le bouton Google apparaît sur la home avec animations

### 🎭 Thème Dark/Light

Le toggle dans la navbar bascule entre :
- Dark mode (par défaut) : fond obsidian-950
- Light mode : activer avec le toggle soleil/lune

### 📱 Responsive

Breakpoints Tailwind :
- `sm:` 640px
- `md:` 768px
- `lg:` 1024px
- `xl:` 1280px

Tout est responsive, testé mobile-first.

### 🚨 Important

- Le splash screen disparaît après 1 seconde
- Les particules sont subtiles (20 max)
- Les animations respectent `prefers-reduced-motion`
- Les hover effects sont désactivés sur mobile

### 💎 Détails Premium

- Favicon SVG animé
- Police Outfit + Satoshi preload
- Meta tags SEO optimisées
- Smooth scroll natif
- Glassmorphism avec backdrop-blur
- Ombres portées multicouches
- Gradients avec background-size 200%
- Animations avec cubic-bezier custom

### 🏆 Résultat Final

Quand tu lances `npm run dev`, tu obtiens :

1. **Splash screen élégant** (1s)
2. **Hero épique** avec particules et 3D
3. **Animations fluides** partout
4. **Glassmorphism** sur tous les éléments
5. **Hover effects** de malade
6. **Responsive parfait**
7. **Performance optimisée** (code splitting)

### 🎬 Prochaines Étapes

1. Lance le backend sur port 8888
2. `npm run dev` dans ce dossier
3. Ouvre http://localhost:5173
4. Ta mâchoire tombe

---

**Made with ❤️ and ✨ magic**

*Le plus beau frontend de backgammon de l'univers.*
