# Diagnostic Serveur Ollama - Problème Identifié

**Date**: 2025-12-03  
**URL**: `https://bot-production-b9d6.up.railway.app`

---

## 🔴 Problème Identifié: Mémoire Insuffisante (OOM)

### Erreur Critique dans les Logs

```
time=2025-12-03T15:33:54.921Z level=INFO source=sched.go:470 
msg="Load failed" 
error="llama runner process has terminated: signal: killed"
```

**Le processus Ollama est tué par le système** → C'est un **OOM Killer** (Out of Memory).

---

## 📊 Analyse des Ressources

### Mémoire Requise par le Modèle

D'après les logs :
- **Poids du modèle**: `703.4 MiB`
- **Cache KV**: `768.0 MiB`
- **Total nécessaire**: `1.4 GiB` (~1433 MB)

### Mémoire Disponible sur Railway

D'après les logs :
- **RAM totale**: `953.7 MiB` (~954 MB)
- **RAM libre**: `909.7 MiB` (~910 MB)
- **Swap libre**: `185.3 GiB` (mais Railway ne l'utilise pas efficacement)

### Conclusion

❌ **Le modèle nécessite 1.4 GB mais Railway n'a que ~950 MB de RAM**

Le modèle essaie de charger en mémoire mais le système tue le processus car il n'y a pas assez de RAM disponible.

---

## ✅ Solutions

### Solution 1: Augmenter les Ressources Railway (RECOMMANDÉ)

**Action**:
1. Aller sur Railway Dashboard
2. Ouvrir le service Ollama
3. Aller dans **Settings** → **Resources**
4. Passer à un **plan payant** avec au moins **2 GB de RAM**

**Coût**: ~$5-10/mois pour un plan avec 2GB RAM

**Avantage**: Solution permanente et fiable

---

### Solution 2: Utiliser un Modèle Plus Léger

**Action**: Changer le modèle pour un modèle plus petit qui tient dans 512MB-1GB

**Modèles recommandés** (par ordre de taille) :
1. **`phi:2.7b`** (~1.5GB, quantifié ~500MB) - Très léger
2. **`mistral:7b-instruct-q4_0`** (~4GB, quantifié ~2GB) - Nécessite toujours plus de RAM
3. **`llama2:7b-chat-q4_0`** (~4GB, quantifié ~2GB) - Nécessite toujours plus de RAM

**Problème**: `deepseek-coder` est déjà un modèle relativement petit (1.35B paramètres). Les modèles plus légers peuvent avoir moins de capacités.

**Action dans le code**:
- Modifier `.env` ou variables Railway: `OLLAMA_MODEL=phi:2.7b`
- Ou modifier `VITE_OLLAMA_MODEL` dans le projet

---

### Solution 3: Réduire le Cache KV

**Action**: Configurer Ollama pour utiliser moins de mémoire pour le cache KV

**Variables d'environnement Railway**:
```
OLLAMA_NUM_CTX=2048  # Réduire de 4096 à 2048 (moins de contexte)
OLLAMA_NUM_GPU=0     # Forcer CPU
```

**Problème**: Cela réduira les performances et la qualité des réponses.

---

### Solution 4: Utiliser DeepSeek API (MEILLEURE SOLUTION)

**Action**: Configurer le fallback DeepSeek API qui fonctionne déjà dans le code

**Avantages**:
- ✅ Fonctionne immédiatement
- ✅ Pas de problème de mémoire
- ✅ Coût très faible (~$0.14 pour 1M tokens)
- ✅ Qualité égale ou meilleure
- ✅ Pas de maintenance serveur

**Configuration**:
1. Obtenir une clé API sur https://platform.deepseek.com
2. Ajouter dans `.env`:
   ```
   VITE_DEEPSEEK_API_KEY=sk-votre_cle_api
   ```
3. Redémarrer le serveur de développement

**Le code utilisera automatiquement DeepSeek API si Ollama échoue.**

---

## 🎯 Recommandation

**Solution immédiate**: **Utiliser DeepSeek API** (Solution 4)
- Configuration rapide (5 minutes)
- Fonctionne immédiatement
- Coût très faible
- Pas de problème de mémoire

**Solution à long terme**: **Augmenter les ressources Railway** (Solution 1)
- Si vous voulez garder Ollama local
- Nécessite un plan payant Railway

---

## 📋 Actions Immédiates

### Option A: DeepSeek API (Recommandé)

1. Aller sur https://platform.deepseek.com
2. Créer un compte (gratuit)
3. Générer une clé API
4. Ajouter dans `.env`:
   ```
   VITE_DEEPSEEK_API_KEY=sk-votre_cle
   ```
5. Redémarrer le serveur dev
6. Tester le coach

### Option B: Augmenter Railway

1. Aller sur Railway Dashboard
2. Service Ollama → Settings → Resources
3. Passer à un plan avec 2GB+ RAM
4. Redémarrer le service
5. Tester l'API

---

## 🔍 Vérification

Après correction, vérifier que :
- ✅ `/api/generate` retourne Status 200
- ✅ `/api/chat` retourne Status 200
- ✅ Le coach répond aux questions
- ✅ Pas d'erreur "signal: killed" dans les logs

---

## 📝 Notes Techniques

- Le modèle `deepseek-coder:latest` nécessite **1.4 GB de RAM**
- Railway plan gratuit = **512 MB - 1 GB RAM** (insuffisant)
- Le processus est tué par l'OOM Killer Linux quand la RAM est épuisée
- Le swap n'est pas utilisé efficacement par Railway pour ce cas d'usage


