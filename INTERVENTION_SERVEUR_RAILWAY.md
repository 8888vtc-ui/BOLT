# Intervention Serveur Ollama sur Railway

**URL du Serveur**: `https://bot-production-b9d6.up.railway.app`  
**Problème**: Erreur 500 sur `/api/generate` et `/api/chat`

---

## 🎯 Actions Immédiates à Effectuer

### 1. Accéder à Railway Dashboard

1. Aller sur https://railway.app
2. Se connecter avec votre compte
3. Trouver le projet contenant le service Ollama
4. Ouvrir le service Ollama

---

### 2. Consulter les Logs (PRIORITÉ 1)

**Dans Railway Dashboard**:
1. Cliquer sur le service Ollama
2. Aller dans l'onglet **"Logs"** ou **"Deployments"**
3. Consulter les logs récents
4. Chercher les erreurs autour de l'heure actuelle

**Ce qu'il faut chercher**:
- `Error 500`
- `Out of memory` ou `OOM`
- `Model not found`
- `Failed to load model`
- `Timeout`

**Action**: Copier les messages d'erreur pour diagnostic

---

### 3. Redémarrer le Serveur (Solution Rapide)

**Dans Railway Dashboard**:
1. Ouvrir le service Ollama
2. Cliquer sur **"Settings"** ou **"..."** (menu)
3. Sélectionner **"Restart"** ou **"Redeploy"**
4. Attendre 1-2 minutes
5. Tester l'API à nouveau

**Via Railway CLI** (si installé):
```bash
railway login
railway link  # Lier au projet
railway restart
```

---

### 4. Vérifier les Variables d'Environnement

**Dans Railway Dashboard**:
1. Ouvrir le service Ollama
2. Aller dans **"Variables"**
3. Vérifier:
   - `OLLAMA_MODEL=deepseek-coder:latest` ✅
   - `OLLAMA_HOST` (si présent)
   - `OLLAMA_PORT` (si présent)
   - Variables de mémoire/ressources

**Si manquant**: Ajouter `OLLAMA_MODEL=deepseek-coder:latest`

---

### 5. Vérifier les Ressources

**Dans Railway Dashboard**:
1. Ouvrir le service Ollama
2. Aller dans **"Settings"** → **"Resources"**
3. Vérifier:
   - **RAM disponible**: Le modèle `deepseek-coder` nécessite ~2-4GB
   - **Plan Railway**: Plan gratuit = 512MB (insuffisant pour ce modèle)

**Si RAM insuffisante**:
- Option 1: Passer à un plan payant Railway (recommandé)
- Option 2: Utiliser un modèle plus léger (voir ci-dessous)

---

### 6. Tester Après Redémarrage

**Test rapide avec PowerShell**:

```powershell
# Test /api/generate
$body = @{
    model = "deepseek-coder:latest"
    prompt = "Hello"
    stream = $false
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest -Uri "https://bot-production-b9d6.up.railway.app/api/generate" `
        -Method POST -Body $body -ContentType "application/json" -TimeoutSec 30
    Write-Host "✅ Succès! Status: $($response.StatusCode)"
    $data = $response.Content | ConvertFrom-Json
    Write-Host "Réponse: $($data.response)"
} catch {
    Write-Host "❌ Erreur: $($_.Exception.Message)"
}
```

---

## 🔧 Solutions Selon le Problème

### Problème: Mémoire Insuffisante (OOM)

**Symptômes dans les logs**:
- `Out of memory`
- `OOM`
- `Killed`

**Solutions**:
1. **Augmenter les ressources Railway** (plan payant)
2. **Utiliser un modèle plus léger**:
   - `mistral:7b` (~4GB)
   - `llama2:7b` (~4GB)
   - `phi:2.7b` (~2GB)
3. **Modifier le code** pour utiliser un modèle plus léger

---

### Problème: Modèle Non Chargé

**Symptômes dans les logs**:
- `Model not found`
- `Failed to load model`

**Solutions**:
1. **Vérifier que le modèle est téléchargé**:
   ```bash
   # Via Railway CLI ou terminal du service
   ollama list
   ```
2. **Télécharger le modèle**:
   ```bash
   ollama pull deepseek-coder:latest
   ```
3. **Vérifier la variable d'environnement** `OLLAMA_MODEL`

---

### Problème: Timeout

**Symptômes**:
- Requêtes qui prennent > 30 secondes
- Erreur timeout

**Solutions**:
1. **Augmenter le timeout** dans le code (déjà à 30s)
2. **Réduire `num_predict`** dans les options Ollama
3. **Utiliser un modèle plus rapide**

---

### Problème: Configuration Incorrecte

**Symptômes**:
- Erreurs de configuration dans les logs
- Variables d'environnement manquantes

**Solutions**:
1. Vérifier toutes les variables d'environnement
2. Vérifier le Dockerfile/configuration Railway
3. Redéployer le service

---

## 🚀 Solution Alternative: DeepSeek API (Recommandé)

Si le serveur Ollama continue à poser problème, utilisez le fallback DeepSeek API :

### Étapes

1. **Obtenir une Clé API DeepSeek**
   - Aller sur https://platform.deepseek.com
   - Créer un compte (gratuit)
   - Aller dans "API Keys"
   - Créer une nouvelle clé

2. **Configurer dans le Projet Local**
   - Créer/modifier `.env` à la racine de `D:\BOLT\BOLT`
   - Ajouter:
     ```
     VITE_DEEPSEEK_API_KEY=sk-votre_cle_api_ici
     ```
   - Redémarrer le serveur de développement (`npm run dev`)

3. **Test**
   - Le coach utilisera automatiquement DeepSeek API si Ollama échoue
   - Fonctionne immédiatement
   - Coût: ~$0.14 pour 1M tokens (très économique)

---

## 📋 Checklist Complète

### Diagnostic
- [ ] Consulter les logs Railway
- [ ] Identifier le type d'erreur (OOM, timeout, modèle, etc.)
- [ ] Vérifier les variables d'environnement
- [ ] Vérifier les ressources (RAM, CPU)

### Actions Correctives
- [ ] Redémarrer le serveur Ollama
- [ ] Vérifier que le modèle est chargé
- [ ] Augmenter les ressources si nécessaire
- [ ] Tester l'API après corrections

### Alternative
- [ ] Si échec → Configurer DeepSeek API fallback
- [ ] Tester le coach avec DeepSeek API
- [ ] Documenter la solution

---

## 🆘 Commandes Utiles Railway

### Via Railway CLI

```bash
# Installer Railway CLI
npm i -g @railway/cli

# Se connecter
railway login

# Lier au projet
railway link

# Voir les logs en temps réel
railway logs

# Redémarrer le service
railway restart

# Voir les variables d'environnement
railway variables

# Ouvrir un shell dans le service
railway shell
```

### Via Railway Dashboard

1. **Logs**: Service → Onglet "Logs"
2. **Variables**: Service → Onglet "Variables"
3. **Settings**: Service → Onglet "Settings"
4. **Restart**: Service → Menu "..." → "Restart"

---

## ✅ Résultat Attendu

Après intervention réussie:
- ✅ `/api/generate` retourne Status 200
- ✅ `/api/chat` retourne Status 200
- ✅ Le coach répond aux questions
- ✅ Les réponses sont en français

---

## 📞 Support

Si le problème persiste:
1. Consulter la documentation Railway: https://docs.railway.app
2. Consulter la documentation Ollama: https://ollama.ai/docs
3. Vérifier les issues GitHub Railway/Ollama
4. Utiliser le fallback DeepSeek API en attendant


