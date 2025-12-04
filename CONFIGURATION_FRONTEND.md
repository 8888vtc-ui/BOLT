# 🔧 CONFIGURATION FRONTEND NETLIFY

## 📋 Informations

- **Site ID Frontend :** `bc6d4fdf-8750-41d0-a3a6-4e6b7c7e8bdb`
- **Site ID API :** `d0da12e4-83d8-42e7-9a1c-163d37e8d37d`
- **URL Frontend :** `https://gurugammon-react.netlify.app`
- **URL API :** `https://botgammon.netlify.app/.netlify/functions/analyze`

---

## ✅ Configuration Requise

### Variables d'environnement à configurer dans Netlify

**Dans Netlify → Site Settings → Environment variables :**

1. **VITE_BOT_API_URL** (optionnel)
   - Valeur : `https://botgammon.netlify.app/.netlify/functions/analyze`
   - Si non configurée, le code utilise cette valeur par défaut

2. **VITE_SUPABASE_URL** (requis)
   - Valeur : Votre URL Supabase

3. **VITE_SUPABASE_ANON_KEY** (requis)
   - Valeur : Votre clé anonyme Supabase

---

## 🔍 Vérification

### 1. Vérifier que le site est déployé

Allez sur : https://gurugammon-react.netlify.app

### 2. Vérifier les variables d'environnement

Dans Netlify :
- Allez sur votre site frontend
- Settings → Environment variables
- Vérifiez que les variables sont configurées

### 3. Vérifier le routing

Le `netlify.toml` doit avoir :
```toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

Cela permet au routing React de fonctionner correctement.

---

## 🐛 Problème "Page not found"

Si vous voyez "Page not found" :

1. **Vérifiez le `netlify.toml`** - Il doit avoir la redirection `/*` → `/index.html`
2. **Vérifiez le build** - Le build doit générer un `dist/index.html`
3. **Redéployez** - Faites un nouveau déploiement

---

## 🚀 Action Immédiate

**Dans Netlify :**

1. Allez sur : https://app.netlify.com/sites/gurugammon-react/configuration/general
2. Vérifiez les variables d'environnement
3. Vérifiez que le `netlify.toml` est présent
4. Redéployez si nécessaire

---

**Dites-moi ce que vous voyez dans Netlify !**




