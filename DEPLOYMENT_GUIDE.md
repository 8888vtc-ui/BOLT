# 🚀 GUIDE DE DÉPLOIEMENT COMPLET - GURUGAMMON V1

## 📋 Vue d'Ensemble

Ce guide vous accompagne étape par étape pour déployer GuruGammon sur Netlify.

**Temps estimé :** 1h30  
**Difficulté :** Débutant à Intermédiaire

---

## ✅ PRÉREQUIS

- [ ] Compte GitHub (repos : `8888vtc-ui/BOLT` et `8888vtc-ui/BOT`)
- [ ] Compte Netlify (gratuit)
- [ ] Compte Supabase (gratuit)
- [ ] Compte Google Cloud (pour OAuth)
- [ ] Node.js 18+ installé localement

---

## 📦 PHASE 1 : PRÉPARATION LOCALE (15 min)

### Étape 1.1 : Cloner et Vérifier

```bash
# 1. Cloner le repo frontend (si pas déjà fait)
git clone https://github.com/8888vtc-ui/BOLT.git
cd BOLT

# 2. Installer les dépendances
npm install

# 3. Vérifier que tout fonctionne
npm run dev
```

**✅ Validation :** Le serveur démarre sur http://localhost:5173

### Étape 1.2 : Créer le fichier .env

```bash
# Copier le fichier exemple
cp .env.example .env

# Éditer .env avec vos valeurs (voir Phase 2 pour obtenir les clés)
# Pour l'instant, laissez les valeurs par défaut
```

---

## 🔐 PHASE 2 : CONFIGURATION SUPABASE (20 min)

### Étape 2.1 : Créer/Configurer le Projet Supabase

1. **Aller sur** https://supabase.com/dashboard
2. **Créer un nouveau projet** (ou utiliser un existant)
   - Nom : `gurugammon`
   - Mot de passe : (notez-le bien !)
   - Région : Choisissez la plus proche

### Étape 2.2 : Exécuter les Migrations

1. Dans Supabase, aller dans **SQL Editor**
2. Ouvrir le fichier : `supabase/migrations/20251128101602_add_complete_gurugammon_schema.sql`
3. Copier tout le contenu
4. Coller dans l'éditeur SQL de Supabase
5. Cliquer sur **Run**

**Répéter pour tous les fichiers de migration dans l'ordre :**
- `20251128101602_add_complete_gurugammon_schema.sql`
- `20251129_consolidated_fix.sql`
- `20251129_tournament_stats.sql`
- (et tous les autres dans l'ordre chronologique)

### Étape 2.3 : Récupérer les Clés API

1. Dans Supabase, aller dans **Settings** → **API**
2. **Copier ces valeurs :**
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public key** → `VITE_SUPABASE_ANON_KEY`

3. **Mettre à jour votre .env :**
```env
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=votre_cle_anon_ici
```

### Étape 2.4 : Configurer Google OAuth

1. **Dans Supabase :** Authentication → Providers → Google
2. **Activer Google** (toggle ON)

3. **Obtenir les credentials Google :**
   - Aller sur https://console.cloud.google.com
   - Créer un projet (ou utiliser un existant)
   - APIs & Services → Credentials → Create Credentials → OAuth 2.0 Client ID
   - Type : **Web application**
   - **Authorized redirect URIs :**
     ```
     https://votre-projet.supabase.co/auth/v1/callback
     ```

4. **Copier Client ID et Secret** dans Supabase

5. **Dans Supabase, ajouter aussi ces Redirect URLs :**
   ```
   http://localhost:5173/dashboard
   https://votre-site.netlify.app/dashboard
   ```

### Étape 2.5 : Activer Anonymous Sign-In

1. Dans Supabase : **Authentication** → **Providers**
2. Trouver **Anonymous Sign-In**
3. **Activer** (toggle ON)
4. Sauvegarder

**✅ Validation :** 
- [ ] Migrations exécutées sans erreur
- [ ] Clés API copiées dans .env
- [ ] Google OAuth configuré
- [ ] Anonymous Sign-In activé

---

## 🤖 PHASE 3 : DÉPLOIEMENT API BOT (30 min)

### Étape 3.1 : Préparer le Backend

```bash
# Aller dans le repo backend
cd ../gurugammon-gnubg-api  # ou BOT selon votre structure

# Installer les dépendances
npm install

# Vérifier la structure
ls netlify/functions/
```

### Étape 3.2 : Déployer sur Netlify

1. **Aller sur** https://app.netlify.com
2. **Add new site** → **Import an existing project**
3. **Connecter GitHub** → Sélectionner `8888vtc-ui/BOT`
4. **Configuration de build :**
   ```
   Base directory: (laisser vide)
   Build command: npm run build
   Publish directory: (laisser vide - c'est une API)
   ```
5. **Variables d'environnement** (Site settings → Environment variables) :
   ```
   ANTHROPIC_API_KEY = votre_cle_anthropic
   OPENAI_API_KEY = votre_cle_openai
   DEEPSEEK_API_KEY = votre_cle_deepseek
   ```
   > **Note :** Obtenez ces clés depuis les services respectifs

6. **Déployer** → Cliquer sur **Deploy site**

### Étape 3.3 : Vérifier l'API

Une fois déployé, notez l'URL : `https://botgammon.netlify.app` (ou votre nom)

**Tester l'API :**
```bash
curl -X POST https://botgammon.netlify.app/.netlify/functions/analyze \
  -H "Content-Type: application/json" \
  -d '{"dice":[3,1],"boardState":{"points":[...]},"player":2}'
```

**✅ Validation :**
- [ ] API déployée sur Netlify
- [ ] Variables d'environnement configurées
- [ ] Endpoint répond correctement

---

## 🎨 PHASE 4 : DÉPLOIEMENT FRONTEND (25 min)

### Étape 4.1 : Mettre à jour .env avec l'URL de l'API

Dans votre fichier `.env` du frontend :
```env
VITE_BOT_API_URL=https://botgammon.netlify.app/.netlify/functions/analyze
```

### Étape 4.2 : Tester le Build Local

```bash
cd BOLT

# Build de production
npm run build

# Vérifier que dist/ est créé
ls dist/

# Tester en local
npm run preview
```

**✅ Validation :**
- [ ] Build réussit sans erreur
- [ ] Dossier `dist/` créé
- [ ] Preview fonctionne

### Étape 4.3 : Déployer sur Netlify

1. **Aller sur** https://app.netlify.com
2. **Add new site** → **Import an existing project**
3. **Connecter GitHub** → Sélectionner `8888vtc-ui/BOLT`
4. **Configuration de build :**
   ```
   Base directory: (laisser vide)
   Build command: npm run build
   Publish directory: dist
   ```
5. **Variables d'environnement** (Site settings → Environment variables) :
   ```
   VITE_SUPABASE_URL = https://votre-projet.supabase.co
   VITE_SUPABASE_ANON_KEY = votre_cle_anon
   VITE_BOT_API_URL = https://botgammon.netlify.app/.netlify/functions/analyze
   ```
6. **Déployer** → Cliquer sur **Deploy site**

### Étape 4.4 : Configurer le Nom du Site

1. Dans Netlify : **Site settings** → **Domain management**
2. **Change site name** → `gurugammon-react` (ou votre choix)
3. Votre site sera : `https://gurugammon-react.netlify.app`

**✅ Validation :**
- [ ] Frontend déployé
- [ ] Variables d'environnement configurées
- [ ] Site accessible

---

## 🔗 PHASE 5 : CONFIGURATION FINALE (15 min)

### Étape 5.1 : Mettre à Jour les Redirect URLs

1. **Dans Google Cloud Console :**
   - APIs & Services → Credentials
   - Votre OAuth Client ID
   - **Authorized redirect URIs**, ajouter :
     ```
     https://votre-projet.supabase.co/auth/v1/callback
     https://gurugammon-react.netlify.app/dashboard
     http://localhost:5173/dashboard
     ```

2. **Dans Supabase :**
   - Authentication → URL Configuration
   - **Redirect URLs**, ajouter :
     ```
     https://gurugammon-react.netlify.app/dashboard
     http://localhost:5173/dashboard
     ```

### Étape 5.2 : Vérifier netlify.toml

Le fichier `netlify.toml` est déjà configuré correctement :
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

**✅ Validation :**
- [ ] Redirect URLs mises à jour
- [ ] netlify.toml correct

---

## 🧪 PHASE 6 : TESTS (20 min)

### Checklist de Tests

#### Test 1 : Accès au Site
- [ ] Ouvrir https://gurugammon-react.netlify.app
- [ ] Page d'accueil s'affiche
- [ ] Pas d'erreurs dans la console (F12)

#### Test 2 : Authentification Google
- [ ] Cliquer sur "Continue with Google"
- [ ] Redirection vers Google
- [ ] Connexion réussie
- [ ] Redirection vers dashboard
- [ ] Nom utilisateur affiché

#### Test 3 : Mode Invité
- [ ] Se déconnecter
- [ ] Cliquer sur "Play as Guest"
- [ ] Dashboard accessible
- [ ] Nom "Guest_XXXXX" affiché

#### Test 4 : Jeu
- [ ] Cliquer sur "Jouer contre l'IA"
- [ ] Plateau s'affiche
- [ ] Lancer les dés fonctionne
- [ ] Bot joue automatiquement
- [ ] Coups valides

#### Test 5 : API Bot
- [ ] Ouvrir la console (F12)
- [ ] Vérifier les appels API vers BotGammon
- [ ] Pas d'erreurs 404 ou 500
- [ ] Bot répond correctement

**✅ Validation :**
- [ ] Tous les tests passent
- [ ] Pas d'erreurs critiques

---

## 📝 PHASE 7 : WORKFLOW GIT (10 min)

### Configuration Git pour Déploiement Automatique

Netlify déploie automatiquement depuis la branche `main` à chaque push.

```bash
# 1. Vérifier que vous êtes sur main
git checkout main
git pull origin main

# 2. Créer une branche pour vos modifications
git checkout -b feature/deploy-config

# 3. Faire vos modifications
# ... modifier les fichiers ...

# 4. Commit
git add .
git commit -m "feat: configuration déploiement"

# 5. Push
git push origin feature/deploy-config

# 6. Créer une Pull Request sur GitHub
# 7. Merger dans main après review
git checkout main
git merge feature/deploy-config
git push origin main

# 8. Netlify déploiera automatiquement !
```

---

## 🐛 DÉPANNAGE

### Problème : Build échoue sur Netlify

**Solutions :**
1. Vérifier les logs Netlify (Deploys → Votre déploiement → View logs)
2. Vérifier que toutes les dépendances sont dans `package.json`
3. Vérifier les variables d'environnement
4. Tester le build local : `npm run build`

### Problème : API ne répond pas

**Solutions :**
1. Vérifier que les fonctions Netlify sont déployées
2. Vérifier les logs Netlify Functions
3. Vérifier les variables d'environnement de l'API
4. Tester l'endpoint directement avec curl

### Problème : OAuth ne fonctionne pas

**Solutions :**
1. Vérifier les redirect URIs dans Google Console
2. Vérifier la config Supabase
3. Vérifier les variables d'environnement
4. Vérifier les logs du navigateur (F12)

### Problème : Variables d'environnement non reconnues

**Solutions :**
1. Vérifier qu'elles commencent par `VITE_`
2. Redéployer après avoir ajouté les variables
3. Vider le cache du navigateur (Ctrl+Shift+R)

---

## ✅ CHECKLIST FINALE

Avant de considérer le déploiement terminé :

- [ ] Backend API déployé sur Netlify
- [ ] Frontend déployé sur Netlify
- [ ] Variables d'environnement configurées (Frontend + Backend)
- [ ] Supabase configuré (DB + Auth)
- [ ] Google OAuth configuré
- [ ] Anonymous Sign-In activé
- [ ] Redirect URLs correctes
- [ ] Tests fonctionnels passent
- [ ] Pas d'erreurs dans les logs
- [ ] Site accessible publiquement

---

## 🎉 FÉLICITATIONS !

Votre application GuruGammon est maintenant déployée et accessible publiquement !

**URLs finales :**
- Frontend : `https://gurugammon-react.netlify.app`
- Backend API : `https://botgammon.netlify.app`
- Supabase : `https://votre-projet.supabase.co`

**Prochaines étapes :**
- Ajouter un domaine personnalisé (optionnel)
- Configurer les analytics
- Mettre en place le monitoring
- Optimiser les performances

---

## 📚 RESSOURCES

- **Netlify Docs :** https://docs.netlify.com
- **Supabase Docs :** https://supabase.com/docs
- **Google OAuth :** https://developers.google.com/identity/protocols/oauth2
- **GitHub Repos :**
  - Frontend : https://github.com/8888vtc-ui/BOLT
  - Backend : https://github.com/8888vtc-ui/BOT

---

**Besoin d'aide ?** Ouvrez un issue sur GitHub ou consultez les logs Netlify.

