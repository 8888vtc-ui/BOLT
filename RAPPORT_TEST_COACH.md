# Rapport de Test - Coach AI dans le Chat

**Date**: 2025-01-02  
**Objectif**: Tester le coach AI qui analyse les parties dans le chat

---

## 🔍 Analyse du Code

### Fichiers Concernés
- `src/components/game/ChatBox.tsx` - Interface du chat avec coach
- `src/lib/deepseekService.ts` - Service du coach AI

### API Utilisée

#### Priorité 1: Ollama (GRATUIT) ✅
- **URL par défaut**: `https://bot-production-b9d6.up.railway.app`
- **Modèle**: `deepseek-coder`
- **Configuration**: `VITE_OLLAMA_URL` (optionnel)
- **Fonction**: `askOllamaCoach()`
- **Endpoint**: `/api/generate`
- **Timeout**: 30 secondes

#### Priorité 2: DeepSeek API (Payant - Fallback)
- **URL**: `https://api.deepseek.com/v1/chat/completions`
- **Configuration**: `VITE_DEEPSEEK_API_KEY` (requis si utilisé)
- **Fonction**: `askDeepSeekAPICoach()`
- **Modèle**: `deepseek-chat`
- **Timeout**: 30 secondes

### Logique de Sélection

```typescript
// 1. Vérifier si Ollama est disponible (timeout 5s)
const ollamaAvailable = await isOllamaAvailable();

// 2. Si Ollama disponible → Utiliser Ollama (GRATUIT)
if (ollamaAvailable) {
    return await askOllamaCoach(...);
}

// 3. Sinon → Fallback vers DeepSeek API (si configuré)
if (DEEPSEEK_API_KEY) {
    return await askDeepSeekAPICoach(...);
}

// 4. Sinon → Message d'erreur
return 'AI Coach is not configured...';
```

---

## 🧪 Tests à Effectuer

### Test 1: Disponibilité Ollama
- [ ] Vérifier si l'URL Ollama par défaut répond
- [ ] Vérifier le timeout (5s)
- [ ] Vérifier la réponse de `/api/tags`

### Test 2: Fonctionnalité du Coach
- [ ] Ouvrir le chat dans le jeu
- [ ] Envoyer une question au coach
- [ ] Vérifier quelle API est utilisée (Ollama ou DeepSeek)
- [ ] Vérifier la réponse du coach
- [ ] Vérifier le contexte du jeu (board, dice, etc.)

### Test 3: Gestion des Erreurs
- [ ] Tester avec Ollama indisponible
- [ ] Tester sans clé DeepSeek API
- [ ] Vérifier les messages d'erreur

---

## 📊 Résultats

### Configuration Actuelle
- **OLLAMA_URL**: `https://bot-production-b9d6.up.railway.app` (par défaut)
- **OLLAMA_MODEL**: `deepseek-coder` (par défaut)
- **DEEPSEEK_API_KEY**: Non configuré (probablement)

### Test Ollama Disponibilité ✅
- **Statut**: ✅ TESTÉ
- **URL**: `https://bot-production-b9d6.up.railway.app/api/tags`
- **Résultat**: Status 200 ✅
- **Conclusion**: Le serveur Ollama est disponible

### Test Génération Ollama ❌
- **Statut**: ❌ ÉCHEC
- **URL**: `https://bot-production-b9d6.up.railway.app/api/generate`
- **Résultat**: Erreur 500 (Erreur interne du serveur)
- **Modèle disponible**: `deepseek-coder:latest` ✅
- **Test format simple**: Échoue aussi (erreur 500)
- **Conclusion**: Le serveur Ollama a un problème avec l'endpoint `/api/generate`
- **Cause probable**: Problème de configuration du serveur Ollama sur Railway

### Test Coach Fonctionnel ⏳
- **Statut**: ⏳ Non testé directement dans l'interface
- **Interface**: ChatBox dans GameRoom (sidebar droite desktop)
- **Question test**: "Quel est le meilleur coup ?"
- **Note**: Nécessite test dans l'interface pour vérifier le fallback

---

## 🔍 Observations

### Points Positifs
1. ✅ Utilise Ollama GRATUIT en priorité
2. ✅ Fallback vers DeepSeek API si Ollama indisponible
3. ✅ Détection automatique de la langue (FR/ES/EN)
4. ✅ Contexte du jeu inclus dans la requête
5. ✅ Gestion des erreurs avec messages clairs

### Points à Vérifier
- ✅ Disponibilité de l'URL Ollama par défaut (Status 200)
- ⚠️ Fonctionnement du chat dans l'interface (non testé directement)
- ❌ Génération Ollama (erreur 500)
- ⚠️ Qualité des réponses du coach (nécessite test avec fallback)

---

## 📝 Prochaines Étapes

1. ✅ Tester la disponibilité d'Ollama (FAIT - Status 200)
2. ❌ Corriger l'erreur 500 de l'endpoint /api/generate
3. ⏳ Ouvrir le chat dans le jeu
4. ⏳ Envoyer une question au coach
5. ⏳ Vérifier quelle API est utilisée (Ollama ou DeepSeek fallback)
6. ⏳ Vérifier la qualité de la réponse

## 🐛 Bug Identifié

### Bug: Ollama /api/generate retourne erreur 500
- **Fichier**: `src/lib/deepseekService.ts`
- **Problème**: Le serveur Ollama répond (200) mais la génération échoue (500)
- **Impact**: Le coach ne peut pas générer de réponses via Ollama
- **Solution possible**: 
  1. Vérifier si le modèle `deepseek-coder` est disponible sur le serveur
  2. Utiliser un autre modèle Ollama
  3. Configurer le fallback DeepSeek API

