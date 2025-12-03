# 🔧 Configuration DeepSeek API pour AI Coach

## 📋 Vue d'ensemble

L'AI Coach utilise l'API DeepSeek pour fournir des conseils stratégiques en temps réel. Cette fonctionnalité est **optionnelle** - le jeu fonctionne sans elle, mais l'AI Coach ne sera pas disponible.

## 🚀 Configuration Rapide

### 1. Obtenir une clé API DeepSeek

1. Visitez [https://platform.deepseek.com/](https://platform.deepseek.com/)
2. Créez un compte ou connectez-vous
3. Allez dans **API Keys** / **Clés API**
4. Créez une nouvelle clé API
5. **Copiez la clé** (elle ne sera affichée qu'une seule fois)

### 2. Configuration Locale (Développement)

Créez un fichier `.env.local` à la racine du projet :

```bash
VITE_DEEPSEEK_API_KEY=sk-votre-cle-api-ici
```

**⚠️ Important :** Le fichier `.env.local` est dans `.gitignore` et ne sera pas commité.

### 3. Configuration Netlify (Production)

#### Option A : Via l'interface Netlify

1. Allez sur [https://app.netlify.com/](https://app.netlify.com/)
2. Sélectionnez votre site **gurugammon-react**
3. Allez dans **Site settings** → **Environment variables**
4. Cliquez sur **Add variable**
5. Ajoutez :
   - **Key:** `VITE_DEEPSEEK_API_KEY`
   - **Value:** `sk-votre-cle-api-ici`
6. Cliquez sur **Save**
7. **Redéployez** votre site (Build & deploy → Trigger deploy → Deploy site)

#### Option B : Via Netlify CLI

```bash
netlify env:set VITE_DEEPSEEK_API_KEY "sk-votre-cle-api-ici"
netlify deploy --prod
```

### 4. Vérification

Après le déploiement, testez l'AI Coach dans le jeu :

1. Lancez une partie
2. Cliquez sur le bouton **"Ask Coach"** ou **"💡 Coach"**
3. Posez une question (ex: "What's the best move here?")
4. Vous devriez recevoir une réponse de l'AI Coach

## 💰 Coûts DeepSeek

DeepSeek propose des tarifs très compétitifs :
- **Modèle DeepSeek Chat:** ~$0.14 par 1M tokens d'entrée, ~$0.28 par 1M tokens de sortie
- **Gratuit jusqu'à un certain quota** pour les nouveaux utilisateurs
- Consultez [https://platform.deepseek.com/pricing](https://platform.deepseek.com/pricing) pour les détails

## 🔒 Sécurité

- ✅ La clé API est stockée comme variable d'environnement (jamais dans le code)
- ✅ Les requêtes sont faites côté serveur (via Netlify Functions si nécessaire)
- ✅ La clé n'est jamais exposée au client

## 🐛 Dépannage

### "AI Coach is not configured"

**Cause:** La variable `VITE_DEEPSEEK_API_KEY` n'est pas définie.

**Solution:**
1. Vérifiez que la variable est bien configurée sur Netlify
2. Redéployez le site après avoir ajouté la variable
3. Vérifiez les logs de build Netlify pour les erreurs

### "Error: Failed to get response from AI coach"

**Causes possibles:**
- Clé API invalide ou expirée
- Quota API dépassé
- Problème réseau

**Solution:**
1. Vérifiez votre clé API sur [platform.deepseek.com](https://platform.deepseek.com/)
2. Vérifiez votre quota/usage
3. Testez la clé avec curl :
   ```bash
   curl https://api.deepseek.com/v1/chat/completions \
     -H "Authorization: Bearer YOUR_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{"model":"deepseek-chat","messages":[{"role":"user","content":"Hello"}]}'
   ```

## 📚 Documentation

- [DeepSeek API Documentation](https://platform.deepseek.com/api-docs/)
- [Netlify Environment Variables](https://docs.netlify.com/environment-variables/overview/)

