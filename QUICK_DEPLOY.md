# ⚡ DÉPLOIEMENT RAPIDE - GUIDE EXPRESS

## 🎯 Pour les Pressés (15 minutes)

### 1. Préparer les Variables

Créez un fichier `.env` :
```env
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=votre_cle_ici
VITE_BOT_API_URL=https://botgammon.netlify.app/.netlify/functions/analyze
```

### 2. Tester Localement

```bash
npm install
npm run build
npm run preview
```

### 3. Déployer sur Netlify

1. **Connecter GitHub** : https://app.netlify.com → Add new site → Import from GitHub
2. **Sélectionner** : `8888vtc-ui/BOLT`
3. **Build settings** :
   - Build command: `npm run build`
   - Publish directory: `dist`
4. **Variables d'environnement** (Site settings → Environment variables) :
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_BOT_API_URL`
5. **Deploy !**

### 4. Vérifier

Ouvrez votre site Netlify et testez :
- [ ] Page d'accueil s'affiche
- [ ] Connexion Google fonctionne
- [ ] Mode invité fonctionne
- [ ] Jeu fonctionne

**C'est tout ! 🎉**

---

## 📚 Guide Complet

Pour plus de détails, voir : `DEPLOYMENT_GUIDE.md`

