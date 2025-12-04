# Guide Rapide - Configuration Bot

**Pour que le bot fonctionne, vous devez configurer DeepSeek API sur Netlify**

---

## 🚀 Configuration Rapide (5 minutes)

### 1. Backend Netlify (`gurugammon-gnubg-api`)

**URL**: https://app.netlify.com → Votre projet backend

**Variables à ajouter**:
```
DEEPSEEK_API_KEY = sk-56ff5e77bb064dad93cbadb750fd2c3
```

**Comment faire**:
1. Aller sur Netlify Dashboard
2. Sélectionner votre projet backend
3. **Site settings** → **Environment variables**
4. Cliquer **Add variable**
5. Nom: `DEEPSEEK_API_KEY`
6. Valeur: `sk-56ff5e77bb064dad93cbadb750fd2c3`
7. **Save**
8. **Trigger deploy** (ou attendre le prochain déploiement)

---

### 2. Frontend Netlify (`BOLT`)

**URL**: https://app.netlify.com → Votre projet frontend

**Variables à ajouter**:
```
VITE_BOT_API_URL = https://botgammon.netlify.app/.netlify/functions/analyze
VITE_COACH_API_URL = https://botgammon.netlify.app/.netlify/functions/coach
```

**Comment faire**:
1. Aller sur Netlify Dashboard
2. Sélectionner votre projet frontend
3. **Site settings** → **Environment variables**
4. Ajouter chaque variable une par une
5. **Save**
6. **Trigger deploy** (ou attendre le prochain déploiement)

---

## ✅ Vérification

### Test Bot Joueur
1. Lancer une partie avec le bot
2. Le bot doit jouer automatiquement
3. Vérifier les logs : `🤖 Bot: Found X move(s)`

### Test Bot Chat
1. Poser une question dans le chat
2. Le coach doit répondre
3. Vérifier les logs : `[Coach] Using DeepSeek API`

---

## 📝 Résumé

**Ce qui est nécessaire**:
- ✅ `DEEPSEEK_API_KEY` sur Netlify Backend
- ✅ `VITE_BOT_API_URL` sur Netlify Frontend
- ✅ `VITE_COACH_API_URL` sur Netlify Frontend

**Version DeepSeek**:
- Modèle: `deepseek-chat`
- API: `https://api.deepseek.com/v1/chat/completions`
- Clé: `sk-56ff5e77bb064dad93cbadb750fd2c3`

**Pourquoi**:
- Ollama échoue avec OOM (manque de mémoire)
- DeepSeek API fonctionne correctement
- Déjà configuré avec votre clé


