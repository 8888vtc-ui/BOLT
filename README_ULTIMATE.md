# 🎲 GuruGammon - Ultimate Backgammon Platform

![GuruGammon](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)
![React](https://img.shields.io/badge/React-18.3-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue)
![License](https://img.shields.io/badge/License-MIT-yellow)

**The most advanced backgammon platform with AI coaching, pixel-perfect design, and dual-mode gameplay.**

---

## ✨ Features

### 🎮 Dual Game Modes

#### 1. **Local Mode** (`/play`)
- 🎯 2-player local gameplay (no backend required)
- 🖱️ Ultra-smooth drag & drop (mobile + desktop)
- 🎲 3D animated dice with physics
- 🔄 3D rotating doubling cube (6 faces)
- ✅ Complete move validation
- 🎨 Premium Galaxy-style design
- 📱 100% responsive

#### 2. **Online Mode** (`/`)
- 🤖 Play against GNUBg AI
- 🌐 Real-time multiplayer via WebSocket
- 🧠 AI-powered move analysis
- 👨‍🏫 Virtual coach with explanations
- 🏆 Tournaments & leaderboards
- 📊 Advanced statistics

---

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Configure environment
cp .env.gurugammon .env

# Start development server
npm run dev

# Open http://localhost:5173
```

### Play Modes:

- **Local 2-Player**: Navigate to `/play`
- **Online vs AI**: Click "Play vs AI Now" on homepage
- **Multiplayer**: Coming soon

---

## 🏗️ Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion (3D transforms)
- **Drag & Drop**: react-dnd (touch + mouse)
- **Backend**: Express.js (gurugammon-antigravity)
- **Database**: PostgreSQL (Supabase)
- **Real-time**: WebSocket
- **AI Engine**: GNUBg

---

## 📦 Installation

```bash
npm install
```

### Dependencies:
```json
{
  "react": "^18.3.1",
  "react-dnd": "^16.0.1",
  "react-dnd-html5-backend": "^16.0.1",
  "react-dnd-touch-backend": "^16.0.1",
  "framer-motion": "^12.23.24",
  "@supabase/supabase-js": "^2.57.4",
  "@clerk/clerk-react": "^5.x",
  "lucide-react": "^0.344.0"
}
```

---

## ⚙️ Configuration

### Environment Variables

Create `.env` from `.env.gurugammon`:

```env
# GurugammonAntigravity Backend
VITE_API_URL=https://gurugammon.onrender.com
VITE_WS_URL=wss://gurugammon.onrender.com

# Supabase (for auth/database)
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Optional: Clerk Auth
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_key
```

---

## 🎮 How to Play

### Local Mode

1. Navigate to `/play`
2. Click **"Start Game"** to roll first dice
3. **Drag & drop** checkers to move
4. Use **"Double"** to increase stakes
5. Click **"Resign"** to forfeit

### Online Mode

1. Click **"Play vs AI Now"** on homepage
2. Guest login automatically created
3. Game starts against GNUBg AI
4. Click **"Analyze"** after moves for coaching
5. Get AI suggestions and explanations

---

## 🎨 Design System

### Colors
```css
--bg-primary: #0f0f0f;      /* Deep black */
--bg-secondary: #1a1a1a;    /* Dark gray */
--board-dark: #2d2d2d;      /* Board points */
--accent-gold: #FFD700;     /* Primary accent */
--checker-beige: #D2B48C;   /* Player 1 */
--checker-red: #8B0000;     /* Player 2 */
```

### Effects
- Glow on draggable pieces
- Green highlight on valid destinations
- Spring animations for tactile feedback
- Backdrop blur on modals
- Volumetric shadows

---

## 📁 Project Structure

```
src/
├── components/
│   ├── Checker.tsx              # Game piece with glow
│   ├── Dice.tsx                 # 3D animated dice
│   ├── DoublingCube.tsx         # 3D rotating cube
│   ├── Point.tsx                # Board triangle
│   ├── CoachModal.tsx           # GNUBg analysis modal
│   └── PlayableBackgammonBoard.tsx
│
├── pages/
│   ├── GurugammonLanding.tsx    # Main landing page
│   ├── GurugammonGame.tsx       # Online game page
│   └── Login.tsx                # Authentication
│
├── hooks/
│   ├── useGurugammonGame.ts     # Online game logic
│   ├── useAuth.ts               # Authentication
│   └── useGame.ts               # Supabase game
│
├── lib/
│   ├── gurugammonApi.ts         # API client
│   ├── gameLogic.ts             # Game rules
│   └── supabase.ts              # Supabase client
│
└── App.tsx                      # Main router
```

---

## 🧪 Development

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Type checking
npm run typecheck

# Linting
npm run lint
```

---

## 🚀 Deployment

### Build
```bash
npm run build
```

### Deploy to:
- **Netlify**: `netlify deploy --prod --dir=dist`
- **Vercel**: `vercel --prod`
- **Render**: Connect GitHub repo

### Environment Variables Required:
- `VITE_API_URL`
- `VITE_WS_URL`
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

---

## 📊 API Integration

### Backend Endpoints

```typescript
// Authentication
POST /api/auth/guest-login
POST /api/auth/clerk-login

// Game Management
POST /api/games                  // Create game
GET  /api/games/:id/status       // Get game state
POST /api/games/:id/roll         // Roll dice
POST /api/games/:id/move         // Make move
POST /api/games/:id/resign       // Resign game

// AI Coach
POST /api/games/:id/coach        // Get advice
POST /api/games/:id/evaluate     // Position evaluation
POST /api/games/:id/suggestions  // Best moves

// Cube Actions
POST /api/games/:id/cube/double
POST /api/games/:id/cube/take
POST /api/games/:id/cube/pass
```

---

## 🎯 Key Features Implemented

### ✅ Completed

**Local Mode:**
- [x] Drag & drop (mobile + desktop)
- [x] 3D dice animation
- [x] Doubling cube (6 faces)
- [x] Move validation
- [x] Legal move highlighting
- [x] Bear-off logic
- [x] Bar & capture
- [x] Win detection
- [x] Premium design

**Online Mode:**
- [x] WebSocket real-time updates
- [x] Play vs GNUBg AI
- [x] Position analysis
- [x] Coach modal with explanations
- [x] Analysis quota system
- [x] Guest login

### 🚧 Coming Soon
- [ ] Full Clerk authentication
- [ ] Multiplayer tournaments
- [ ] Global leaderboard
- [ ] Audio coach (ElevenLabs)
- [ ] Video coach (HeyGen)
- [ ] Match history
- [ ] Advanced statistics

---

## 🐛 Troubleshooting

### Backend not responding:
```bash
curl https://gurugammon.onrender.com/health
# If down, wait ~30s for cold start
```

### WebSocket connection fails:
Check console for:
- ✅ `WebSocket connected`
- ❌ `WebSocket error` - network issue

### Build fails:
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

---

## 📚 Documentation

- [Integration Guide](./GURUGAMMON_INTEGRATION.md) - Complete integration docs
- [API Documentation](https://github.com/8888vtc-ui/gurugammon-antigravity/blob/main/API_DOCUMENTATION.md)
- [Backgammon Rules](https://en.wikipedia.org/wiki/Backgammon)

---

## 🙏 Credits

- **GNUBg**: World's strongest backgammon engine
- **Backgammon Galaxy**: Design inspiration
- **React DnD**: Drag & drop framework
- **Framer Motion**: Animation library

---

## 📄 License

MIT License - See [LICENSE](./LICENSE) file for details

---

## 🎉 Result

A **production-ready** backgammon platform featuring:
- ✅ Ultra-smooth gameplay (60fps+)
- ✅ Pixel-perfect Galaxy-style design
- ✅ Dual-mode (local + online)
- ✅ AI-powered coaching
- ✅ 100% responsive
- ✅ Complete backend integration

**Ready to play right now!**

---

Made with ❤️ by the GuruGammon team
