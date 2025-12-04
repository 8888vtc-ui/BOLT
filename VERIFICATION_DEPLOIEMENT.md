# 🔍 VÉRIFICATION DU DÉPLOIEMENT

## 📋 Checklist de Vérification

### 1. Frontend (BOLT) - Netlify

**URL attendue :** `https://gurugammon-react.netlify.app` (ou votre nom Netlify)

**Vérifications :**
- [ ] Site accessible publiquement
- [ ] Page d'accueil s'affiche
- [ ] Pas d'erreurs 404
- [ ] Pas d'erreurs dans la console (F12)

**Variables d'environnement Netlify :**
- [ ] `VITE_SUPABASE_URL` configurée
- [ ] `VITE_SUPABASE_ANON_KEY` configurée
- [ ] `VITE_BOT_API_URL` configurée

**Comment vérifier :**
1. Aller sur https://app.netlify.com
2. Sélectionner votre site
3. Site settings → Environment variables
4. Vérifier que les 3 variables sont présentes

---

### 2. Backend API (BOT) - Netlify Functions

**URL attendue :** `https://botgammon.netlify.app/.netlify/functions/analyze`

**Vérifications :**
- [ ] API accessible
- [ ] Endpoint répond correctement
- [ ] Pas d'erreurs 500

**Variables d'environnement Netlify :**
- [ ] `ANTHROPIC_API_KEY` configurée
- [ ] `OPENAI_API_KEY` configurée
- [ ] `DEEPSEEK_API_KEY` configurée

**Test de l'API :**
```bash
curl -X POST https://botgammon.netlify.app/.netlify/functions/analyze \
  -H "Content-Type: application/json" \
  -d '{"dice":[3,1],"boardState":{"points":[...]},"player":2}'
```

---

### 3. Supabase

**Vérifications :**
- [ ] Projet Supabase actif
- [ ] Base de données créée
- [ ] Tables créées (users, games, etc.)
- [ ] Migrations exécutées

**Authentification :**
- [ ] Google OAuth activé
- [ ] Anonymous Sign-In activé
- [ ] Redirect URLs configurées

**Comment vérifier :**
1. Aller sur https://supabase.com/dashboard
2. Sélectionner votre projet
3. Table Editor → Vérifier les tables
4. Authentication → Providers → Vérifier Google et Anonymous

---

### 4. Configuration Google OAuth

**Vérifications :**
- [ ] OAuth Client créé dans Google Cloud
- [ ] Redirect URIs configurées :
  - `https://votre-projet.supabase.co/auth/v1/callback`
  - `https://gurugammon-react.netlify.app/dashboard`
  - `http://localhost:5173/dashboard` (pour dev)

**Comment vérifier :**
1. Aller sur https://console.cloud.google.com
2. APIs & Services → Credentials
3. Vérifier votre OAuth Client ID
4. Vérifier les Authorized redirect URIs

---

## 🧪 Tests Fonctionnels

### Test 1 : Accès au Site
```
1. Ouvrir https://gurugammon-react.netlify.app
2. Vérifier que la page s'affiche
3. Ouvrir la console (F12)
4. Vérifier qu'il n'y a pas d'erreurs critiques
```

### Test 2 : Authentification Google
```
1. Cliquer sur "Continue with Google"
2. Se connecter avec Google
3. Vérifier la redirection vers dashboard
4. Vérifier que le nom utilisateur s'affiche
```

### Test 3 : Mode Invité
```
1. Se déconnecter
2. Cliquer sur "Play as Guest"
3. Vérifier l'accès au dashboard
4. Vérifier le nom "Guest_XXXXX"
```

### Test 4 : Jeu contre l'IA
```
1. Cliquer sur "Jouer contre l'IA"
2. Vérifier que le plateau s'affiche
3. Lancer les dés
4. Vérifier que le bot joue automatiquement
5. Vérifier les logs dans DebugOverlay
```

### Test 5 : API Bot
```
1. Ouvrir la console (F12)
2. Aller dans l'onglet Network
3. Jouer un coup
4. Vérifier les appels vers botgammon.netlify.app
5. Vérifier qu'il n'y a pas d'erreurs 404/500
```

---

## 🐛 Problèmes Courants

### Problème : Site ne s'affiche pas

**Solutions :**
1. Vérifier que le build a réussi sur Netlify
2. Vérifier les logs de déploiement
3. Vérifier les variables d'environnement
4. Vérifier que `dist/` contient les fichiers

### Problème : OAuth ne fonctionne pas

**Solutions :**
1. Vérifier les Redirect URIs dans Google Console
2. Vérifier la config Supabase
3. Vérifier les variables d'environnement
4. Vérifier les logs du navigateur

### Problème : API Bot ne répond pas

**Solutions :**
1. Vérifier que l'API est déployée
2. Vérifier les variables d'environnement de l'API
3. Vérifier les logs Netlify Functions
4. Tester l'endpoint directement

### Problème : Erreurs CORS

**Solutions :**
1. Vérifier que les URLs sont correctes
2. Vérifier la config Netlify
3. Vérifier les headers CORS

---

## 📊 État Actuel

**Frontend :**
- URL : _______________________
- Statut : ⬜ OK  ⬜ Erreur
- Dernier déploiement : _______________________

**Backend API :**
- URL : _______________________
- Statut : ⬜ OK  ⬜ Erreur
- Dernier déploiement : _______________________

**Supabase :**
- Projet : _______________________
- Statut : ⬜ OK  ⬜ Erreur
- Tables créées : ⬜ Oui  ⬜ Non

**Google OAuth :**
- Statut : ⬜ Configuré  ⬜ Non configuré

---

## ✅ Checklist Finale

- [ ] Frontend déployé et accessible
- [ ] Backend API déployé et accessible
- [ ] Supabase configuré
- [ ] Google OAuth fonctionne
- [ ] Mode invité fonctionne
- [ ] Jeu contre l'IA fonctionne
- [ ] Pas d'erreurs critiques
- [ ] Tests fonctionnels passent

---

**Date de vérification :** _______________________
**Vérifié par :** _______________________




