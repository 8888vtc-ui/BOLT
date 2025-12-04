# Rapport de Test - Coach AI avec Netlify Function

**Date**: 2025-12-03  
**Test**: Coach AI via Netlify Function et fallback Ollama Direct

---

## 📊 Résultats des Tests

### Test 1: Netlify Function

**URL**: `https://botgammon.netlify.app/.netlify/functions/coach`

**Résultats**:
- ❌ **Erreur 404** - Fonction non trouvée
- **Cause**: La fonction `coach.ts` n'est pas encore déployée sur Netlify

**Questions testées**:
1. "Comment jouer un double 1?" → 404
2. "Quelle est la meilleure stratégie d'ouverture?" → 404
3. "Explique-moi les règles du bear off" → 404

**Statut**: ❌ **NON FONCTIONNEL** (fonction non déployée)

---

### Test 2: Ollama Direct (Fallback)

**URL**: `https://bot-production-b9d6.up.railway.app`

**Résultats**:
- ❌ **Erreur 500** - "llama runner process has terminated: signal: killed"
- **Cause**: Problème de mémoire insuffisante (OOM) identifié précédemment

**Question testée**:
1. "Comment jouer un double 1?" → 500

**Statut**: ❌ **NON FONCTIONNEL** (problème mémoire Railway)

---

## 🔍 Analyse

### Problèmes Identifiés

1. **Fonction Netlify Non Déployée**
   - La fonction `coach.ts` existe dans le code
   - Mais elle n'est pas encore déployée sur Netlify
   - Erreur 404 indique que Netlify ne trouve pas la fonction

2. **Ollama Railway - Problème Mémoire**
   - Confirme le problème identifié précédemment
   - Le serveur Ollama nécessite 1.4 GB RAM
   - Railway n'a que ~950 MB disponible
   - Processus tué par OOM Killer

---

## ✅ Actions Requises

### 1. Déployer la Fonction Netlify

**Dans le projet `gurugammon-gnubg-api`**:

```bash
cd D:\BOLT\gurugammon-gnubg-api
git add netlify/functions/coach.ts
git commit -m "Add Netlify Function for AI Coach"
git push
```

**Vérifier**:
- Netlify redéploie automatiquement
- Vérifier les logs: https://app.netlify.com/sites/botgammon/functions
- La fonction `coach` apparaît dans la liste

---

### 2. Configurer les Variables Netlify

**Backend** (`botgammon`):
- Aller sur: https://app.netlify.com/sites/botgammon/configuration/env
- Ajouter:
  ```
  OLLAMA_URL=https://bot-production-b9d6.up.railway.app
  OLLAMA_MODEL=deepseek-coder:latest
  DEEPSEEK_API_KEY=sk-votre_cle (optionnel)
  ```

**Frontend** (`gurugammon-react`):
- Aller sur: https://app.netlify.com/sites/gurugammon-react/configuration/env
- Ajouter:
  ```
  VITE_COACH_API_URL=https://botgammon.netlify.app/.netlify/functions/coach
  ```

---

### 3. Solution Alternative: DeepSeek API

**Si Ollama continue à poser problème**:

1. Obtenir une clé API DeepSeek:
   - https://platform.deepseek.com
   - Créer compte (gratuit)
   - Générer clé API

2. Configurer dans Netlify (`botgammon`):
   ```
   DEEPSEEK_API_KEY=sk-votre_cle_api
   ```

3. La fonction Netlify utilisera automatiquement DeepSeek API si Ollama échoue

---

## 📋 Checklist

### Déploiement
- [ ] Fonction `coach.ts` commitée et pushée
- [ ] Netlify redéployé automatiquement
- [ ] Fonction `coach` visible dans Netlify Functions

### Configuration
- [ ] Variables Netlify backend configurées (`OLLAMA_URL`, `OLLAMA_MODEL`)
- [ ] Variable Netlify frontend configurée (`VITE_COACH_API_URL`)
- [ ] `DEEPSEEK_API_KEY` configurée (optionnel, pour fallback)

### Test
- [ ] Test Netlify Function réussi (200 OK)
- [ ] Test depuis le frontend réussi
- [ ] Coach répond aux questions

---

## 🎯 Prochaines Étapes

1. **Déployer la fonction Netlify** (priorité 1)
2. **Configurer les variables d'environnement** (priorité 2)
3. **Tester à nouveau** après déploiement
4. **Configurer DeepSeek API** si Ollama continue à échouer

---

## 📝 Notes

- La fonction Netlify est prête dans le code
- Il faut juste la déployer sur Netlify
- Une fois déployée, elle utilisera Ollama depuis le serveur
- Si Ollama échoue (mémoire), DeepSeek API prendra le relais automatiquement

---

## 🔄 Retest Après Déploiement

Après avoir déployé et configuré, relancer le test:

```bash
node test-coach-netlify.js
```

**Résultats attendus**:
- ✅ Netlify Function: 200 OK
- ✅ Réponse du coach reçue
- ✅ Temps de réponse < 30 secondes


