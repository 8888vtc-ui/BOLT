# 🔍 RAPPORT COMPLET DU SERVEUR - GuruGammon

**Date**: 2025-01-02  
**Analyse**: Automatique et complète  
**Scope**: Frontend, Backend, API, Supabase, Netlify, Railway

---

## 📊 ARCHITECTURE GLOBALE

### 1. **Frontend (BOLT/BOLT)**
- **Framework**: React 18 + TypeScript + Vite
- **Déploiement**: Netlify
- **État**: ✅ Opérationnel (localhost:5173)
- **Mode**: Demo Mode activé (Supabase non configuré)

### 2. **Backend API (gurugammon-gnubg-api)**
- **Type**: Serverless Functions (Netlify)
- **Moteurs AI**: 
  - SuperiorEngine (par défaut)
  - WorldClassEngine (fallback)
  - NeuralNetworkEngine (legacy)
- **État**: ⚠️ Configuration nécessaire

### 3. **Supabase Functions**
- **game-actions**: `/roll-dice`, `/make-move`, `/resign`
- **tournament-actions**: `/start`, `/report-match`, `/standings`
- **État**: ✅ Code présent, nécessite déploiement

### 4. **Ollama/Railway**
- **URL**: `https://bot-production-b9d6.up.railway.app`
- **Modèle**: `deepseek-coder`
- **État**: ⚠️ Répond mais réponse vide

---

## 🔌 ENDPOINTS IDENTIFIÉS

### Supabase Edge Functions

#### **game-actions** (`supabase/functions/game-actions/index.ts`)
```
POST /functions/v1/game-actions/roll-dice
POST /functions/v1/game-actions/make-move
POST /functions/v1/game-actions/resign
```

**Authentification**: Bearer Token requis  
**CORS**: ✅ Configuré  
**Validation**: ✅ Tour de jeu vérifié

#### **tournament-actions** (`supabase/functions/tournament-actions/index.ts`)
```
POST /functions/v1/tournament-actions/start
POST /functions/v1/tournament-actions/report-match
GET  /functions/v1/tournament-actions/standings
```

**Authentification**: Bearer Token requis  
**CORS**: ✅ Configuré

### Netlify Functions

#### **analyze-move** (`netlify/functions/analyze-move.ts`)
```
POST /.netlify/functions/analyze-move
```

**AI Providers** (fallback):
1. DeepSeek API (priorité)
2. Claude (Anthropic)
3. OpenAI GPT-4o

**Variables requises**:
- `DEEPSEEK_API_KEY`
- `ANTHROPIC_API_KEY`
- `OPENAI_API_KEY`

#### **analyze** (`gurugammon-gnubg-api/netlify/functions/analyze.ts`)
```
POST /.netlify/functions/analyze
```

**Moteurs**:
- SuperiorEngine (par défaut)
- WorldClassEngine (fallback)
- NeuralNetworkEngine (legacy)

### API Legacy (Render)

#### **gurugammonApi** (`src/lib/gurugammonApi.ts`)
```
Base URL: https://gurugammon.onrender.com (par défaut)
```

**Endpoints**:
- `/api/auth/guest-login`
- `/api/games`
- `/api/games/{id}/roll`
- `/api/games/{id}/move`
- `/api/games/{id}/coach`
- `/api/tournaments`

**État**: ⚠️ Legacy - Migration vers Supabase en cours

---

## 🔐 VARIABLES D'ENVIRONNEMENT

### Frontend (BOLT/BOLT)

#### Requis
```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

#### Optionnel (AI Coach)
```bash
VITE_OLLAMA_URL=https://bot-production-b9d6.up.railway.app
VITE_OLLAMA_MODEL=deepseek-coder
VITE_DEEPSEEK_API_KEY=sk-...
VITE_DEEPSEEK_API_URL=https://api.deepseek.com/v1/chat/completions
```

#### Legacy (non utilisé)
```bash
VITE_API_URL=https://gurugammon.onrender.com
VITE_WS_URL=wss://gurugammon.onrender.com
```

### Backend Netlify Functions

#### analyze-move.ts
```bash
DEEPSEEK_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...
```

#### analyze.ts (gurugammon-gnubg-api)
```bash
OLLAMA_URL=https://bot-production-b9d6.up.railway.app
OLLAMA_MODEL=deepseek-coder
```

### Supabase Edge Functions

#### Requis (auto-configuré par Supabase)
```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

---

## 🗄️ BASE DE DONNÉES (Supabase)

### Tables Identifiées

#### **users**
- `id`, `username`, `email`, `rating`, `premium`, `country`, `avatar`, `role`

#### **games**
- `id`, `player1_id`, `player2_id`, `game_type`, `status`, `board_state`, `current_turn`, `dice`, `cube_value`, `cube_owner`, `score`, `winner_id`, `win_type`

#### **tournaments**
- `id`, `name`, `description`, `created_by`, `max_participants`, `status`, `start_time`, `end_time`, `brackets`

#### **tournament_participants**
- `tournament_id`, `user_id`

#### **tournament_matches**
- `id`, `tournament_id`, `round`, `match_number`, `player1_id`, `player2_id`, `status`, `winner_id`, `completed_at`

#### **game_moves**
- `game_id`, `player_id`, `move_number`, `dice`, `moves`, `board_after`

#### **rooms**
- `id`, `name`, `created_by`, `game_type`, `status`

#### **messages**
- `id`, `room_id`, `user_id`, `content`, `created_at`

#### **room_participants**
- `room_id`, `user_id`, `joined_at`

---

## 🔄 FLUX DE DONNÉES

### 1. **Authentification**
```
User → Supabase Auth → JWT Token → Frontend
```

### 2. **Création de Partie**
```
Frontend → Supabase (games table) → Realtime Subscription → Frontend
```

### 3. **Mouvement de Pion**
```
Frontend → handleBoardMove → sendGameAction('board:move')
  → useGameSocket → Supabase (games.update) → Realtime Broadcast
  → Frontend (mise à jour UI)
```

### 4. **AI Coach**
```
Frontend → deepseekService → Ollama (Railway) [GRATUIT]
  → Fallback: DeepSeek API [PAYANT]
```

### 5. **Analyse de Mouvement**
```
Frontend → Netlify Function (analyze-move)
  → DeepSeek API / Claude / OpenAI
  → Retour analyse
```

---

## ⚠️ PROBLÈMES IDENTIFIÉS

### 1. **Mode Demo Activé**
- **Cause**: Variables Supabase non configurées
- **Impact**: Pas de persistance, pas de Realtime
- **Solution**: Configurer `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY`

### 2. **Ollama/Railway**
- **URL**: `https://bot-production-b9d6.up.railway.app`
- **État**: Répond mais réponse vide
- **Action**: Vérifier le service Railway

### 3. **API Legacy Render**
- **État**: Encore référencée dans le code
- **Impact**: Code mort, peut être supprimé
- **Action**: Nettoyer les références

### 4. **Supabase Functions Non Déployées**
- **État**: Code présent mais non déployé
- **Action**: Déployer via Supabase CLI

### 5. **Netlify Functions**
- **État**: Code présent, nécessite variables d'environnement
- **Action**: Configurer les clés API

---

## ✅ POINTS FORTS

1. **Architecture Modulaire**: Séparation claire frontend/backend
2. **Fallback Multiples**: AI providers avec fallback automatique
3. **Sécurité**: Authentification JWT, RLS Supabase
4. **CORS Configuré**: Toutes les fonctions ont CORS
5. **TypeScript**: Code typé, moins d'erreurs
6. **Realtime**: Supabase Realtime pour synchronisation

---

## 📋 ACTIONS RECOMMANDÉES

### Priorité 1 (Critique)
1. ✅ **Configurer Supabase**
   - Créer projet Supabase
   - Configurer `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY`
   - Déployer les Edge Functions

2. ✅ **Vérifier Railway/Ollama**
   - Tester `https://bot-production-b9d6.up.railway.app/api/tags`
   - Vérifier que le modèle `deepseek-coder` est disponible

### Priorité 2 (Important)
3. ✅ **Configurer Netlify Functions**
   - Ajouter `DEEPSEEK_API_KEY` (optionnel)
   - Ajouter `ANTHROPIC_API_KEY` (optionnel)
   - Ajouter `OPENAI_API_KEY` (optionnel)

4. ✅ **Nettoyer Code Legacy**
   - Supprimer références à `gurugammon.onrender.com`
   - Supprimer `gurugammonApi.ts` si non utilisé

### Priorité 3 (Amélioration)
5. ✅ **Tests E2E**
   - Tester flux complet authentification
   - Tester création partie
   - Tester mouvement avec Realtime

6. ✅ **Monitoring**
   - Ajouter logs structurés
   - Monitoring Railway
   - Monitoring Supabase

---

## 🔗 LIENS UTILES

### Services
- **Supabase**: https://supabase.com/dashboard
- **Netlify**: https://app.netlify.com
- **Railway**: https://railway.app
- **Render**: https://render.com (legacy)

### Documentation
- **Supabase Docs**: https://supabase.com/docs
- **Netlify Functions**: https://docs.netlify.com/functions/overview/
- **Railway Docs**: https://docs.railway.app

---

## 📊 STATUT FINAL

| Composant | État | Action Requise |
|-----------|------|----------------|
| Frontend | ✅ Opérationnel | Configurer Supabase |
| Supabase Functions | ⚠️ Code présent | Déployer |
| Netlify Functions | ⚠️ Code présent | Configurer API keys |
| Railway/Ollama | ⚠️ Répond | Vérifier service |
| Base de données | ⚠️ Non configurée | Créer projet Supabase |
| Realtime | ⚠️ Non activé | Configurer Supabase |

---

**Conclusion**: Architecture solide mais nécessite configuration complète des services externes pour être pleinement opérationnelle.


