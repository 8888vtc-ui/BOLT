# Configuration DeepSeek API pour Netlify

**Date**: 2025-12-03  
**Clé API**: `sk-56ff5e77bb064dad93cbadb750fd2c3`

---

## ✅ Configuration Netlify

### Backend (`botgammon`)

**Aller sur**: https://app.netlify.com/sites/botgammon/configuration/env

**Ajouter/Modifier les variables suivantes**:

```
OLLAMA_URL=https://bot-production-b9d6.up.railway.app
OLLAMA_MODEL=deepseek-coder:latest
DEEPSEEK_API_KEY=sk-56ff5e77bb064dad93cbadb750fd2c3
```

**Instructions**:
1. Cliquer sur "Add a variable"
2. Ajouter chaque variable une par une
3. Pour `DEEPSEEK_API_KEY`, sélectionner "Sensitive" pour masquer la valeur
4. Sauvegarder

---

### Frontend (`gurugammon-react`)

**Aller sur**: https://app.netlify.com/sites/gurugammon-react/configuration/env

**Ajouter/Modifier**:

```
VITE_COACH_API_URL=https://botgammon.netlify.app/.netlify/functions/coach
```

**Note**: La clé DeepSeek API n'est pas nécessaire côté frontend (elle est utilisée côté serveur dans la fonction Netlify).

---

## 🔄 Redéploiement

### Backend (`botgammon`)

**Option 1: Redéploiement automatique**
- Après avoir configuré les variables, Netlify redéploiera automatiquement
- Vérifier: https://app.netlify.com/sites/botgammon/deploys

**Option 2: Redéploiement manuel**
- Aller sur: https://app.netlify.com/sites/botgammon/deploys
- Cliquer sur "Trigger deploy" → "Deploy site"

### Frontend (`gurugammon-react`)

**Option 1: Redéploiement automatique**
- Après avoir configuré la variable, Netlify redéploiera automatiquement
- Vérifier: https://app.netlify.com/sites/gurugammon-react/deploys

**Option 2: Redéploiement manuel**
- Aller sur: https://app.netlify.com/sites/gurugammon-react/deploys
- Cliquer sur "Trigger deploy" → "Deploy site"

---

## 🧪 Test Après Configuration

### Test de la Fonction Netlify

```bash
curl -X POST https://botgammon.netlify.app/.netlify/functions/coach \
  -H "Content-Type: application/json" \
  -d '{
    "question": "Comment jouer un double 1?",
    "contextType": "rules"
  }'
```

**Réponse attendue**:
```json
{
  "answer": "Un double 1 permet de jouer quatre fois la valeur 1..."
}
```

### Test depuis le Frontend

1. Ouvrir: https://gurugammon-react.netlify.app/
2. Aller dans une partie
3. Ouvrir le chat
4. Poser une question au coach
5. Vérifier la console:
   - `[AI Coach] Using Netlify Function (recommended)` ✅

---

## 📋 Checklist

### Configuration
- [ ] Variables Netlify backend configurées (`OLLAMA_URL`, `OLLAMA_MODEL`, `DEEPSEEK_API_KEY`)
- [ ] Variable Netlify frontend configurée (`VITE_COACH_API_URL`)
- [ ] `DEEPSEEK_API_KEY` marquée comme "Sensitive"

### Déploiement
- [ ] Fonction `coach.ts` commitée et pushée
- [ ] Netlify backend redéployé
- [ ] Netlify frontend redéployé
- [ ] Fonction `coach` visible dans Netlify Functions

### Test
- [ ] Test fonction Netlify réussi (200 OK)
- [ ] Test depuis le frontend réussi
- [ ] Coach répond aux questions
- [ ] Fallback DeepSeek API fonctionne si Ollama échoue

---

## 🔍 Vérification

### Vérifier les Logs Netlify

**Backend**:
1. Aller sur: https://app.netlify.com/sites/botgammon/functions
2. Cliquer sur `coach`
3. Vérifier les logs:
   - `[Coach] Using Ollama (FREE)` ✅ (si Ollama fonctionne)
   - `[Coach] Using DeepSeek API (fallback)` ✅ (si Ollama échoue)

**Frontend**:
1. Ouvrir la console du navigateur
2. Vérifier les logs:
   - `[AI Coach] Using Netlify Function (recommended)` ✅

---

## 🎯 Ordre de Priorité

Le coach utilise maintenant cet ordre:

1. **Netlify Function** (`VITE_COACH_API_URL`)
   - Appelle Ollama depuis le serveur Netlify
   - Si Ollama échoue → Fallback DeepSeek API

2. **Ollama Direct** (`VITE_OLLAMA_URL`)
   - Fallback si Netlify Function non disponible
   - Problème mémoire actuel (OOM)

3. **DeepSeek API** (`DEEPSEEK_API_KEY`)
   - Fallback si Ollama non disponible
   - **Configuré et prêt** ✅

---

## ✅ Résultat Attendu

Après configuration et redéploiement:
- ✅ Le coach fonctionne via Netlify Function
- ✅ Si Ollama échoue (mémoire), DeepSeek API prend le relais automatiquement
- ✅ Les réponses sont en français automatiquement
- ✅ Pas de problème CORS ou de sécurité


