# Configuration Coach AI via Netlify Function

**Date**: 2025-12-03  
**Objectif**: Utiliser Netlify Function pour le coach AI au lieu d'appeler Ollama directement depuis le client

---

## ✅ Solution Implémentée

### Architecture

**Avant** (Problème):
```
Frontend (Client) → Ollama Railway (Problème mémoire)
```

**Après** (Solution):
```
Frontend (Client) → Netlify Function → Ollama Railway
```

**Avantages**:
- ✅ Les appels Ollama se font depuis le serveur Netlify (pas de problème CORS)
- ✅ Les variables d'environnement sont sécurisées (pas exposées au client)
- ✅ Meilleure gestion des erreurs et fallback
- ✅ Pas de problème de mémoire côté client

---

## 📋 Configuration Netlify

### Étape 1: Variables d'Environnement Netlify

**Aller sur**: https://app.netlify.com/sites/botgammon/configuration/env

**Ajouter les variables suivantes**:

```
OLLAMA_URL=https://bot-production-b9d6.up.railway.app
OLLAMA_MODEL=deepseek-coder:latest
DEEPSEEK_API_KEY=sk-votre_cle_api (optionnel, pour fallback)
```

**Note**: 
- `OLLAMA_URL` et `OLLAMA_MODEL` sont nécessaires pour que la fonction Netlify appelle Ollama
- `DEEPSEEK_API_KEY` est optionnel (fallback si Ollama échoue)

---

### Étape 2: Déployer la Fonction Netlify

**La fonction est déjà créée**: `gurugammon-gnubg-api/netlify/functions/coach.ts`

**Pour déployer**:
1. Aller sur le projet `gurugammon-gnubg-api`
2. Push les changements sur GitHub
3. Netlify redéploiera automatiquement

**Ou manuellement**:
```bash
cd D:\BOLT\gurugammon-gnubg-api
git add netlify/functions/coach.ts
git commit -m "Add Netlify Function for AI Coach"
git push
```

---

### Étape 3: Configuration Frontend

**Fichier**: `D:\BOLT\BOLT\.env` (ou variables Netlify pour le frontend)

**Ajouter**:
```
VITE_COACH_API_URL=https://botgammon.netlify.app/.netlify/functions/coach
```

**Ou dans Netlify pour le frontend** (`gurugammon-react`):
- Aller sur: https://app.netlify.com/sites/gurugammon-react/configuration/env
- Ajouter: `VITE_COACH_API_URL=https://botgammon.netlify.app/.netlify/functions/coach`

---

## 🔄 Ordre de Priorité

Le coach utilise maintenant cet ordre de priorité:

1. **Netlify Function** (`VITE_COACH_API_URL`)
   - Appelle Ollama depuis le serveur Netlify
   - Variables d'environnement sécurisées
   - **RECOMMANDÉ**

2. **Ollama Direct** (`VITE_OLLAMA_URL`)
   - Fallback si Netlify Function non disponible
   - Appelle Ollama directement depuis le client
   - **GRATUIT**

3. **DeepSeek API** (`VITE_DEEPSEEK_API_KEY`)
   - Fallback si Ollama non disponible
   - Payant mais très économique
   - **Optionnel**

---

## 🧪 Test

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

1. Ouvrir le jeu: https://gurugammon-react.netlify.app/
2. Aller dans une partie
3. Ouvrir le chat
4. Poser une question au coach
5. Vérifier les logs de la console:
   - `[AI Coach] Using Netlify Function (recommended)` ✅

---

## 🔍 Vérification

### Vérifier les Variables Netlify

**Backend** (`botgammon`):
- [ ] `OLLAMA_URL` configurée
- [ ] `OLLAMA_MODEL` configurée
- [ ] `DEEPSEEK_API_KEY` configurée (optionnel)

**Frontend** (`gurugammon-react`):
- [ ] `VITE_COACH_API_URL` configurée

### Vérifier les Logs Netlify

1. Aller sur: https://app.netlify.com/sites/botgammon/functions
2. Cliquer sur `coach`
3. Vérifier les logs:
   - `[Coach] Using Ollama (FREE)` ✅
   - Ou `[Coach] Using DeepSeek API (fallback)` ✅

---

## 🐛 Résolution de Problèmes

### Problème: "Netlify Function not found"

**Solution**:
- Vérifier que `coach.ts` est dans `netlify/functions/`
- Vérifier que Netlify a redéployé
- Vérifier les logs de build Netlify

### Problème: "Ollama API error: 500"

**Solution**:
- C'est le problème de mémoire identifié précédemment
- La fonction Netlify utilisera automatiquement DeepSeek API si configuré
- Ou augmenter les ressources Railway

### Problème: "CORS error"

**Solution**:
- Les headers CORS sont déjà configurés dans `coach.ts`
- Vérifier que `Access-Control-Allow-Origin: *` est présent

---

## 📝 Notes

- **Avantage principal**: Les appels Ollama se font depuis le serveur, pas depuis le client
- **Sécurité**: Les variables d'environnement ne sont pas exposées au client
- **Performance**: Meilleure gestion des erreurs et retry logic
- **Fallback**: Si Ollama échoue (problème mémoire), DeepSeek API prend le relais automatiquement

---

## ✅ Checklist

- [ ] Fonction `coach.ts` créée dans `gurugammon-gnubg-api/netlify/functions/`
- [ ] Variables Netlify configurées (`OLLAMA_URL`, `OLLAMA_MODEL`)
- [ ] `VITE_COACH_API_URL` configurée dans le frontend
- [ ] Netlify redéployé
- [ ] Test de la fonction réussi
- [ ] Test depuis le frontend réussi


