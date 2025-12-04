# Guide d'Intervention - Serveur Ollama (Erreur 500)

**Date**: 2025-01-02  
**Problème**: Le serveur Ollama retourne une erreur 500 sur `/api/generate` et `/api/chat`

---

## 🔍 Diagnostic Initial

### État Actuel
- ✅ Serveur Ollama accessible (Status 200 sur `/api/tags`)
- ✅ Modèle `deepseek-coder:latest` disponible
- ❌ `/api/generate` retourne erreur 500
- ❌ `/api/chat` retourne erreur 500

### URL du Serveur
- **URL**: `https://bot-production-b9d6.up.railway.app`
- **Plateforme**: Railway
- **Modèle**: `deepseek-coder:latest`

---

## 📋 Étapes d'Intervention

### Étape 1: Vérifier les Logs Railway

1. **Accéder à Railway Dashboard**
   - Aller sur https://railway.app
   - Se connecter avec votre compte
   - Trouver le projet contenant le serveur Ollama

2. **Consulter les Logs**
   - Ouvrir le service Ollama
   - Cliquer sur "Logs" ou "View Logs"
   - Chercher les erreurs récentes (erreur 500)
   - Noter les messages d'erreur détaillés

3. **Vérifier les Erreurs Communes**
   - Erreurs de mémoire (OOM - Out of Memory)
   - Erreurs de modèle non chargé
   - Erreurs de configuration
   - Erreurs de timeout

---

### Étape 2: Vérifier la Configuration du Modèle

#### Option A: Via Railway CLI

```bash
# Installer Railway CLI si nécessaire
npm i -g @railway/cli

# Se connecter
railway login

# Vérifier les variables d'environnement
railway variables

# Vérifier les logs en temps réel
railway logs
```

#### Option B: Via Railway Dashboard

1. Ouvrir le service Ollama
2. Aller dans "Variables"
3. Vérifier:
   - `OLLAMA_MODEL` (devrait être `deepseek-coder:latest`)
   - `OLLAMA_HOST` (si configuré)
   - `OLLAMA_PORT` (si configuré)
   - Variables de mémoire/ressources

---

### Étape 3: Redémarrer le Serveur

#### Via Railway Dashboard

1. Ouvrir le service Ollama
2. Cliquer sur "Restart" ou "Redeploy"
3. Attendre le redémarrage (1-2 minutes)
4. Tester à nouveau l'API

#### Via Railway CLI

```bash
railway restart
```

---

### Étape 4: Vérifier les Ressources

#### Problèmes Courants

1. **Mémoire Insuffisante**
   - Le modèle `deepseek-coder` nécessite ~2-4GB de RAM
   - Vérifier la configuration Railway (plan gratuit = 512MB, peut être insuffisant)

2. **Timeout**
   - Les requêtes peuvent prendre plus de 30 secondes
   - Vérifier les timeouts Railway

3. **Modèle Non Chargé**
   - Le modèle peut ne pas être chargé au démarrage
   - Vérifier les logs de démarrage

---

### Étape 5: Tester l'API Directement

#### Test avec curl

```bash
# Test /api/tags
curl https://bot-production-b9d6.up.railway.app/api/tags

# Test /api/generate (format simple)
curl -X POST https://bot-production-b9d6.up.railway.app/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "model": "deepseek-coder:latest",
    "prompt": "Hello",
    "stream": false
  }'

# Test /api/chat
curl -X POST https://bot-production-b9d6.up.railway.app/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "model": "deepseek-coder:latest",
    "messages": [
      {"role": "user", "content": "Hello"}
    ],
    "stream": false
  }'
```

#### Test avec PowerShell

```powershell
# Test /api/generate
$body = @{
    model = "deepseek-coder:latest"
    prompt = "Hello"
    stream = $false
} | ConvertTo-Json

Invoke-WebRequest -Uri "https://bot-production-b9d6.up.railway.app/api/generate" `
  -Method POST -Body $body -ContentType "application/json"
```

---

### Étape 6: Solutions Possibles

#### Solution 1: Redémarrer le Serveur
- **Action**: Redémarrer le service Ollama sur Railway
- **Impact**: Peut résoudre les problèmes de mémoire ou de modèle non chargé

#### Solution 2: Augmenter les Ressources
- **Action**: Passer à un plan Railway avec plus de RAM
- **Impact**: Résout les problèmes de mémoire insuffisante
- **Coût**: Plan payant Railway

#### Solution 3: Changer de Modèle
- **Action**: Utiliser un modèle plus léger (llama2, mistral, etc.)
- **Impact**: Réduit l'utilisation mémoire
- **Code**: Modifier `VITE_OLLAMA_MODEL` dans `.env`

#### Solution 4: Vérifier la Configuration Ollama
- **Action**: Vérifier que Ollama est correctement configuré sur Railway
- **Impact**: Peut révéler des problèmes de configuration

#### Solution 5: Utiliser le Fallback DeepSeek API
- **Action**: Configurer `VITE_DEEPSEEK_API_KEY` dans `.env`
- **Impact**: Le coach utilisera DeepSeek API au lieu d'Ollama
- **Coût**: Payant (mais très économique)

---

## 🔧 Configuration Alternative: DeepSeek API (Fallback)

Si le serveur Ollama ne peut pas être corrigé rapidement, vous pouvez utiliser le fallback DeepSeek API :

### Étapes

1. **Obtenir une Clé API DeepSeek**
   - Aller sur https://platform.deepseek.com
   - Créer un compte
   - Générer une clé API

2. **Configurer dans le Projet**
   - Créer/modifier `.env` à la racine du projet
   - Ajouter: `VITE_DEEPSEEK_API_KEY=votre_cle_api`
   - Redémarrer le serveur de développement

3. **Test**
   - Le coach utilisera automatiquement DeepSeek API si Ollama échoue
   - Les messages seront en français automatiquement

---

## 📊 Checklist d'Intervention

- [ ] Consulter les logs Railway
- [ ] Vérifier les variables d'environnement
- [ ] Vérifier les ressources (RAM, CPU)
- [ ] Redémarrer le serveur Ollama
- [ ] Tester `/api/generate` après redémarrage
- [ ] Tester `/api/chat` après redémarrage
- [ ] Si échec → Configurer DeepSeek API fallback
- [ ] Documenter la solution trouvée

---

## 🆘 En Cas d'Échec

Si aucune solution ne fonctionne :

1. **Utiliser DeepSeek API** (recommandé)
   - Configuration rapide
   - Fonctionne immédiatement
   - Coût très faible (~$0.14 pour 1M tokens)

2. **Déployer un Nouveau Serveur Ollama**
   - Créer un nouveau service Railway
   - Installer Ollama
   - Télécharger le modèle
   - Mettre à jour `VITE_OLLAMA_URL`

3. **Utiliser un Service Ollama Externe**
   - Services comme Hugging Face Spaces
   - Services Ollama hébergés

---

## 📝 Notes

- Le problème semble être côté serveur Railway, pas côté code
- Le code a été amélioré pour gérer les erreurs et essayer plusieurs formats
- Le fallback DeepSeek API est prêt à être utilisé si nécessaire

---

## ✅ Résultat Attendu

Après intervention, le coach devrait :
- ✅ Répondre aux questions des utilisateurs
- ✅ Analyser les positions de jeu
- ✅ Fournir des conseils stratégiques
- ✅ Fonctionner en français automatiquement


