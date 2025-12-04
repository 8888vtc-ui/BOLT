# Configuration Complète pour le Bot

**Date**: 2025-12-03  
**Problème**: Ni le bot joueur ni le bot chat ne fonctionnent

---

## 🔍 Analyse du Problème

### Bot Joueur (Analyze API)
**Fichier**: `gurugammon-gnubg-api/netlify/functions/analyze.ts`

**Moteur utilisé**: `SuperiorEngine`

**Configuration requise**:
- **PRIORITÉ 1**: `OLLAMA_URL` (gratuit) - **ÉCHOUE avec OOM**
- **PRIORITÉ 2**: `DEEPSEEK_API_KEY` (payant) - **NON CONFIGURÉ sur Netlify**

**Problème**: 
- Ollama échoue à cause du manque de mémoire (OOM)
- DeepSeek API n'est pas configuré dans les variables d'environnement Netlify

---

### Bot Chat (Coach API)
**Fichier**: `gurugammon-gnubg-api/netlify/functions/coach.ts`

**Configuration requise**:
- **PRIORITÉ 1**: `OLLAMA_URL` + `OLLAMA_MODEL` (gratuit) - **ÉCHOUE avec OOM**
- **PRIORITÉ 2**: `DEEPSEEK_API_KEY` (payant) - **NON CONFIGURÉ sur Netlify**

**Problème**: 
- Ollama échoue à cause du manque de mémoire (OOM)
- DeepSeek API n'est pas configuré dans les variables d'environnement Netlify

---

## ✅ Solution Recommandée

### Configuration Netlify (Variables d'Environnement)

**Pour que le bot fonctionne avec DeepSeek API**, vous devez configurer les variables d'environnement suivantes sur Netlify :

#### 1. Variables d'Environnement Netlify (Backend)

**Dans le projet `gurugammon-gnubg-api` sur Netlify** :

```
DEEPSEEK_API_KEY=sk-56ff5e77bb064dad93cbadb750fd2c3
DEEPSEEK_API_URL=https://api.deepseek.com/v1/chat/completions
```

**Optionnel** (si vous voulez garder Ollama comme priorité) :
```
OLLAMA_URL=https://bot-production-b9d6.up.railway.app
OLLAMA_MODEL=deepseek-coder:latest
```

#### 2. Variables d'Environnement Frontend (Netlify)

**Dans le projet `BOLT` sur Netlify** :

```
VITE_BOT_API_URL=https://botgammon.netlify.app/.netlify/functions/analyze
VITE_COACH_API_URL=https://botgammon.netlify.app/.netlify/functions/coach
VITE_DEEPSEEK_API_KEY=sk-56ff5e77bb064dad93cbadb750fd2c3
```

---

## 📋 Étapes de Configuration

### Étape 1: Configurer Netlify Backend (`gurugammon-gnubg-api`)

1. Aller sur [Netlify Dashboard](https://app.netlify.com)
2. Sélectionner le projet `gurugammon-gnubg-api` (ou le projet qui contient les fonctions Netlify)
3. Aller dans **Site settings** → **Environment variables**
4. Ajouter les variables suivantes :

```
DEEPSEEK_API_KEY = sk-56ff5e77bb064dad93cbadb750fd2c3
DEEPSEEK_API_URL = https://api.deepseek.com/v1/chat/completions
```

5. **Redéployer** le site pour que les variables soient prises en compte

---

### Étape 2: Configurer Netlify Frontend (`BOLT`)

1. Aller sur [Netlify Dashboard](https://app.netlify.com)
2. Sélectionner le projet `BOLT` (ou le projet frontend)
3. Aller dans **Site settings** → **Environment variables**
4. Ajouter les variables suivantes :

```
VITE_BOT_API_URL = https://botgammon.netlify.app/.netlify/functions/analyze
VITE_COACH_API_URL = https://botgammon.netlify.app/.netlify/functions/coach
VITE_DEEPSEEK_API_KEY = sk-56ff5e77bb064dad93cbadb750fd2c3
```

5. **Redéployer** le site pour que les variables soient prises en compte

---

## 🎯 Version DeepSeek Recommandée

### Pour le Bot Joueur (Analyze)
- **Modèle**: `deepseek-chat` (utilisé dans `SuperiorEngine.ts:480`)
- **API**: `https://api.deepseek.com/v1/chat/completions`
- **Clé**: `sk-56ff5e77bb064dad93cbadb750fd2c3` (déjà fournie)

### Pour le Bot Chat (Coach)
- **Modèle**: `deepseek-chat` (utilisé dans `coach.ts:226`)
- **API**: `https://api.deepseek.com/v1/chat/completions`
- **Clé**: `sk-56ff5e77bb064dad93cbadb750fd2c3` (déjà fournie)

---

## 🔧 Comment Vérifier la Configuration

### Test 1: Vérifier les Variables Netlify Backend

```bash
# Via Netlify CLI (si installé)
netlify env:list --site=gurugammon-gnubg-api
```

**Vérifier que**:
- ✅ `DEEPSEEK_API_KEY` est présent
- ✅ `DEEPSEEK_API_URL` est présent (optionnel, valeur par défaut utilisée)

---

### Test 2: Vérifier les Variables Netlify Frontend

```bash
# Via Netlify CLI (si installé)
netlify env:list --site=BOLT
```

**Vérifier que**:
- ✅ `VITE_BOT_API_URL` est présent
- ✅ `VITE_COACH_API_URL` est présent
- ✅ `VITE_DEEPSEEK_API_KEY` est présent

---

### Test 3: Tester le Bot Joueur

1. Lancer une partie avec le bot
2. Observer les logs dans la console
3. Vérifier que le bot joue automatiquement

**Logs attendus**:
```
🤖 AI Service: Calling BotGammon API...
🤖 Bot: Found X move(s)
🤖 Bot: Playing move...
```

**Si erreur**:
```
❌ AI Analysis Failed
```

---

### Test 4: Tester le Bot Chat

1. Poser une question dans le chat
2. Observer les logs dans la console
3. Vérifier que le coach répond

**Logs attendus**:
```
[Coach] Using DeepSeek API (fallback)
```

**Si erreur**:
```
AI Coach unavailable
```

---

## 📝 Résumé des Variables Requises

### Backend Netlify (`gurugammon-gnubg-api`)
| Variable | Valeur | Requis |
|----------|--------|--------|
| `DEEPSEEK_API_KEY` | `sk-56ff5e77bb064dad93cbadb750fd2c3` | ✅ OUI |
| `DEEPSEEK_API_URL` | `https://api.deepseek.com/v1/chat/completions` | ⚠️ Optionnel |
| `OLLAMA_URL` | `https://bot-production-b9d6.up.railway.app` | ❌ NON (OOM) |
| `OLLAMA_MODEL` | `deepseek-coder:latest` | ❌ NON (OOM) |

### Frontend Netlify (`BOLT`)
| Variable | Valeur | Requis |
|----------|--------|--------|
| `VITE_BOT_API_URL` | `https://botgammon.netlify.app/.netlify/functions/analyze` | ✅ OUI |
| `VITE_COACH_API_URL` | `https://botgammon.netlify.app/.netlify/functions/coach` | ✅ OUI |
| `VITE_DEEPSEEK_API_KEY` | `sk-56ff5e77bb064dad93cbadb750fd2c3` | ⚠️ Optionnel (pour fallback direct) |

---

## ⚠️ Notes Importantes

1. **Ollama ne fonctionne pas** à cause du manque de mémoire sur Railway (OOM)
2. **DeepSeek API est la solution** - Il fonctionne correctement et est déjà configuré avec votre clé
3. **Les variables doivent être configurées sur Netlify**, pas seulement dans `.env` local
4. **Redéployer après configuration** pour que les variables soient prises en compte

---

## 🚀 Actions Immédiates

1. ✅ Configurer `DEEPSEEK_API_KEY` sur Netlify Backend
2. ✅ Configurer `VITE_BOT_API_URL` et `VITE_COACH_API_URL` sur Netlify Frontend
3. ✅ Redéployer les deux projets
4. ✅ Tester le bot joueur
5. ✅ Tester le bot chat

---

## 📊 Architecture

```
Frontend (BOLT)
  ↓
  ├─→ Bot Joueur → VITE_BOT_API_URL → Netlify Function (analyze.ts)
  │                                              ↓
  │                                         SuperiorEngine
  │                                              ↓
  │                                         DeepSeek API (DEEPSEEK_API_KEY)
  │
  └─→ Bot Chat → VITE_COACH_API_URL → Netlify Function (coach.ts)
                                              ↓
                                         DeepSeek API (DEEPSEEK_API_KEY)
```

---

## ✅ Checklist de Configuration

### Backend Netlify
- [ ] `DEEPSEEK_API_KEY` configuré
- [ ] `DEEPSEEK_API_URL` configuré (optionnel)
- [ ] Site redéployé

### Frontend Netlify
- [ ] `VITE_BOT_API_URL` configuré
- [ ] `VITE_COACH_API_URL` configuré
- [ ] `VITE_DEEPSEEK_API_KEY` configuré (optionnel, pour fallback direct)
- [ ] Site redéployé

### Tests
- [ ] Bot joueur fonctionne
- [ ] Bot chat fonctionne
- [ ] Pas d'erreurs dans les logs


