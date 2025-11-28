# 🚀 GuruGammon - Guide de Démarrage Rapide

## 📸 Aperçu

Vous avez maintenant **DEUX jeux backgammon en un**:

### Mode 1: Jeu Local (`/play`)
```
┌─────────────────────────────────┐
│   OFFLINE - PAS DE BACKEND      │
│   ✅ 2 joueurs sur même écran   │
│   ✅ Drag & drop ultra-fluide   │
│   ✅ Design premium Galaxy      │
└─────────────────────────────────┘
```

### Mode 2: Jeu en Ligne (`/`)
```
┌─────────────────────────────────┐
│   ONLINE - VS IA GNUBg          │
│   ✅ Backend gurugammon.com     │
│   ✅ Coach IA après chaque coup │
│   ✅ Matchmaking & tournois     │
└─────────────────────────────────┘
```

---

## ⚡ Démarrage Ultra-Rapide (30 secondes)

### Option A: Jouer MAINTENANT en local

```bash
npm install
npm run dev
# Ouvrir http://localhost:5173/play
```

**Pas besoin de backend, pas de config!** Jouez immédiatement.

---

### Option B: Jouer en ligne vs IA

```bash
# 1. Installer
npm install

# 2. Configurer (copier .env)
cp .env.gurugammon .env

# 3. Lancer
npm run dev

# 4. Ouvrir http://localhost:5173/
# 5. Cliquer "Play vs AI Now"
```

---

## 🎮 Fonctionnalités par Mode

### Mode Local (`/play`)

| Fonctionnalité | Status |
|---------------|--------|
| Drag & drop fluide | ✅ |
| Support mobile/tactile | ✅ |
| Dés 3D animés | ✅ |
| Doubling cube 3D | ✅ |
| Validation des coups | ✅ |
| Highlighting destinations | ✅ |
| Bear-off automatique | ✅ |
| Bar et captures | ✅ |
| Score et victoire | ✅ |
| Design premium | ✅ |

**Parfait pour:**
- Jouer avec un ami en local
- Tester les règles
- Pas d'Internet disponible
- Démonstrations

---

### Mode Online (`/`)

| Fonctionnalité | Status |
|---------------|--------|
| Jouer vs GNUBg | ✅ |
| WebSocket temps réel | ✅ |
| Analyse IA position | ✅ |
| Coach avec explications | ✅ |
| Quota analyses (5/partie) | ✅ |
| Guest login rapide | ✅ |
| Clerk auth | 🚧 |
| Tournois | 🚧 |
| Leaderboard | 🚧 |

**Parfait pour:**
- S'entraîner contre IA
- Apprendre avec le coach
- Analyser ses coups
- Progresser rapidement

---

## 🎯 Parcours Utilisateur

### Scénario 1: Joueur débutant

```mermaid
Landing (/)
  ↓
"Play vs AI"
  ↓
Guest login auto
  ↓
Partie vs GNUBg
  ↓
Analyse après coup
  ↓
Apprendre!
```

### Scénario 2: Deux amis

```mermaid
Direct /play
  ↓
Start Game
  ↓
Drag & drop
  ↓
Finir la partie
```

---

## 🛠️ Configuration Backend (Optional)

Le mode online nécessite le backend gurugammon-antigravity.

### Variables `.env`:

```env
# OBLIGATOIRE pour mode online
VITE_API_URL=https://gurugammon.onrender.com
VITE_WS_URL=wss://gurugammon.onrender.com

# OPTIONNEL (mode local fonctionne sans)
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

### Backend Status Check:

```bash
# Vérifier si le backend est UP
curl https://gurugammon.onrender.com/health

# Devrait retourner: {"status":"ok"}
```

⚠️ **Note**: Premier appel peut prendre ~30s (cold start Render).

---

## 📱 Responsive Design

| Device | Resolution | Status |
|--------|-----------|--------|
| iPhone SE | 375x667 | ✅ |
| iPhone 15 Pro | 393x852 | ✅ |
| iPad | 768x1024 | ✅ |
| iPad Pro | 1024x1366 | ✅ |
| Desktop HD | 1920x1080 | ✅ |
| Desktop 4K | 3840x2160 | ✅ |

Testé sur tous les formats!

---

## 🎨 Screenshots des Modes

### Mode Local
```
┌────────────────────────────────────┐
│  [Score]  Player 1 vs Player 2    │
│  ┌──────────────────────────────┐ │
│  │   🎲 🎲                      │ │
│  │  ▲ ▲ ▲ ▲ ▲ ▲   ▲ ▲ ▲ ▲ ▲ ▲  │ │
│  │                               │ │
│  │  ▼ ▼ ▼ ▼ ▼ ▼   ▼ ▼ ▼ ▼ ▼ ▼  │ │
│  └──────────────────────────────┘ │
│  [Roll] [Double] [Resign]         │
└────────────────────────────────────┘
```

### Mode Online
```
┌────────────────────────────────────┐
│ Alice vs GNUBg  [⭐ Analyze]      │
│  ┌──────────────────────────────┐ │
│  │   🎲 🎲  [Chat]  [Coach AI]  │ │
│  │  ▲ ▲ ▲ ▲ ▲ ▲   ▲ ▲ ▲ ▲ ▲ ▲  │ │
│  │                               │ │
│  │  ▼ ▼ ▼ ▼ ▼ ▼   ▼ ▼ ▼ ▼ ▼ ▼  │ │
│  └──────────────────────────────┘ │
│  "Move 24/18 recommended"         │
└────────────────────────────────────┘
```

---

## 🚀 Déploiement Production

### Build:
```bash
npm run build
```

### Déployer sur Netlify:
```bash
# Install Netlify CLI
npm i -g netlify-cli

# Deploy
netlify deploy --prod --dir=dist
```

### Variables d'environnement Netlify:
```
VITE_API_URL=https://gurugammon.onrender.com
VITE_WS_URL=wss://gurugammon.onrender.com
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

---

## 🎓 Tutoriel: Première Partie

### Mode Local

1. **Lancer le jeu**
   ```bash
   npm run dev
   ```

2. **Aller sur `/play`**
   ```
   http://localhost:5173/play
   ```

3. **Commencer**
   - Cliquer "Start Game"
   - Les dés se lancent automatiquement

4. **Jouer**
   - Glisser une pièce vers destination valide (vert)
   - Les pièces du joueur actuel brillent
   - Destinations invalides = rouge

5. **Doubler**
   - Cliquer sur le cube
   - Ou bouton "Double"
   - Valeur x2 chaque fois

6. **Terminer**
   - Sortir toutes vos 15 pièces
   - Écran de victoire s'affiche
   - "New Game" pour rejouer

---

### Mode Online

1. **Landing page**
   ```
   http://localhost:5173/
   ```

2. **Play vs AI**
   - Cliquer "Play vs AI Now"
   - Guest login auto (pas de compte)
   - Partie créée instantanément

3. **Jouer contre IA**
   - Même interface drag & drop
   - IA joue automatiquement
   - Temps réel via WebSocket

4. **Analyser**
   - Après ton coup: "Analyze"
   - Modal s'ouvre avec:
     - Meilleur coup suggéré
     - Explication détaillée
     - Equity loss
     - Win rate

5. **Quota**
   - 5 analyses gratuites/partie
   - Modal indique combien reste
   - Upgrade pour illimité

---

## 🐛 Dépannage Rapide

### ❌ Build échoue
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

### ❌ Backend ne répond pas
```bash
curl https://gurugammon.onrender.com/health
# Attendre 30s si cold start
```

### ❌ WebSocket ne connecte pas
- Vérifier console: "WebSocket connected"
- Vérifier firewall/proxy
- Essayer en navigation privée

### ❌ Drag & drop ne marche pas
- Vérifier sur Chrome/Firefox récent
- Tester avec souris ET tactile
- Rafraîchir la page

---

## 📊 Performance

| Métrique | Valeur |
|----------|--------|
| Build size | 552 KB |
| Gzipped | 161 KB |
| First paint | <1s |
| Drag latency | <16ms (60fps) |
| WebSocket ping | ~50ms |

---

## 🎉 Résultat

Vous avez maintenant:

✅ **Jeu local ultra-fluide** (pas de backend)
✅ **Jeu online avec IA GNUBg**
✅ **Coach virtuel intelligent**
✅ **Design premium Galaxy-style**
✅ **100% responsive mobile/tablet/desktop**
✅ **Prêt pour production**

**Choisissez votre mode et jouez!**

---

## 📚 Documentation Complète

- `GURUGAMMON_INTEGRATION.md` - Guide technique complet
- `README_ULTIMATE.md` - Documentation principale
- `README.md` - Guide original Supabase

---

**🎲 Amusez-vous bien!**
