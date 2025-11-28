# 🚀 Guide de Déploiement Netlify - GuruGammon

## 📋 Étapes à Suivre UNE PAR UNE

### ✅ ÉTAPE 1: Configurer Supabase Database

1. Va sur https://supabase.com/dashboard
2. Sélectionne ton projet
3. Clique sur **SQL Editor** dans le menu de gauche
4. Copie le contenu du fichier `supabase_migration.sql`
5. Colle-le dans l'éditeur SQL
6. Clique sur **Run** pour exécuter la migration
7. Vérifie que la table `users` a été créée (onglet **Table Editor**)

**✨ Résultat:** Ta base de données est prête avec la table users et les politiques de sécurité RLS

---

### ✅ ÉTAPE 2: Activer Google OAuth dans Supabase

1. Dans ton projet Supabase, va dans **Authentication** → **Providers**
2. Trouve **Google** dans la liste
3. Active Google OAuth (toggle ON)
4. Tu vas avoir besoin de:
   - **Google Client ID**
   - **Google Client Secret**

#### Obtenir les credentials Google:

1. Va sur https://console.cloud.google.com
2. Crée un nouveau projet (ou sélectionne un existant)
3. Va dans **APIs & Services** → **Credentials**
4. Clique **Create Credentials** → **OAuth 2.0 Client ID**
5. Type: **Web application**
6. Nom: `GuruGammon`
7. **Authorized redirect URIs**, ajoute:
   ```
   https://vgmrkdlgjivfdyrpadha.supabase.co/auth/v1/callback
   ```
8. Copie le **Client ID** et **Client Secret**
9. Retourne dans Supabase et colle-les dans la config Google
10. Dans Supabase, ajoute aussi ces **Redirect URLs**:
    ```
    https://gurugammon-react.netlify.app/dashboard
    http://localhost:5173/dashboard
    ```
11. Sauvegarde

**✨ Résultat:** Google OAuth est maintenant configuré

---

### ✅ ÉTAPE 3: Activer Anonymous Sign-In (Mode Guest)

1. Toujours dans **Authentication** → **Providers**
2. Trouve **Anonymous Sign-In**
3. Active-le (toggle ON)
4. Sauvegarde

**✨ Résultat:** Le mode invité fonctionnera maintenant

---

### ✅ ÉTAPE 4: Déployer sur Netlify

#### Option A: Via GitHub (Recommandé)

1. **Push ton code sur GitHub:**
   ```bash
   git add .
   git commit -m "Setup Supabase auth"
   git push origin main
   ```

2. **Connecter à Netlify:**
   - Va sur https://app.netlify.com
   - Clique **Add new site** → **Import an existing project**
   - Choisis **GitHub**
   - Sélectionne ton repo `gurugammon-antigravity` (ou le nom de ton repo)
   - **Build settings:**
     - Build command: `npm run build`
     - Publish directory: `dist`
   - Clique **Deploy site**

3. **Configurer les variables d'environnement:**
   - Une fois le site créé, va dans **Site settings** → **Environment variables**
   - Ajoute ces 2 variables:
     ```
     VITE_SUPABASE_URL = https://vgmrkdlgjivfdyrpadha.supabase.co
     VITE_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZnbXJrZGxnaml2ZmR5cnBhZGhhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQyNjAyNjgsImV4cCI6MjA3OTgzNjI2OH0.FIBVCw8NVCesoFKWpPXRwEtQPlMSrCfZWHO8s43s4IQ
     ```
   - Sauvegarde

4. **Redéployer:**
   - Va dans **Deploys**
   - Clique **Trigger deploy** → **Deploy site**

#### Option B: Via Netlify CLI (Alternative)

```bash
# Installer Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Initialiser
netlify init

# Déployer
netlify deploy --prod
```

**✨ Résultat:** Ton site est maintenant live sur Netlify!

---

### ✅ ÉTAPE 5: Configurer le Domaine Netlify

1. Une fois déployé, Netlify te donne une URL comme: `https://random-name-123.netlify.app`
2. **Changer pour gurugammon-react:**
   - Va dans **Site settings** → **Domain management**
   - Clique **Options** → **Edit site name**
   - Change en: `gurugammon-react`
   - Sauvegarde
3. Ton site sera maintenant: `https://gurugammon-react.netlify.app`

**✨ Résultat:** Ton URL est propre et correspond au nom du projet

---

### ✅ ÉTAPE 6: Mettre à Jour Google OAuth avec la vraie URL

1. Retourne sur https://console.cloud.google.com
2. Va dans **APIs & Services** → **Credentials**
3. Clique sur ton OAuth Client
4. Dans **Authorized redirect URIs**, ajoute:
   ```
   https://vgmrkdlgjivfdyrpadha.supabase.co/auth/v1/callback
   ```
5. Dans Supabase, vérifie que la **Redirect URL** est bien:
   ```
   https://gurugammon-react.netlify.app/dashboard
   ```
6. Sauvegarde tout

**✨ Résultat:** Google OAuth fonctionnera maintenant avec ton site live

---

### ✅ ÉTAPE 7: Tester l'Application

1. **Ouvre:** https://gurugammon-react.netlify.app

2. **Teste Google Login:**
   - Clique "Continue with Google"
   - Connecte-toi avec ton compte Google
   - Tu dois être redirigé vers le dashboard
   - Le dashboard doit afficher ton nom et email

3. **Teste Guest Mode:**
   - Si connecté, logout d'abord
   - Clique "Play as Guest"
   - Tu dois voir le dashboard avec un nom "Guest_XXXXX"

4. **Teste Logout:**
   - Clique "Logout"
   - Tu dois revenir sur la page de login

**✨ Résultat:** Tout fonctionne! 🎉

---

## 🐛 Dépannage

### Problème: "Invalid client" lors de Google Login

**Solution:**
- Vérifie que l'URL de callback dans Google Console est exactement:
  ```
  https://vgmrkdlgjivfdyrpadha.supabase.co/auth/v1/callback
  ```
- Vérifie que le Client ID et Secret dans Supabase sont corrects

### Problème: Guest mode ne fonctionne pas

**Solution:**
- Vérifie que "Anonymous Sign-In" est activé dans Supabase
- Ouvre la console du navigateur (F12) et vérifie les erreurs
- Vérifie que la table `users` existe dans Supabase

### Problème: "User not found" sur le dashboard

**Solution:**
- La première fois qu'un utilisateur Google se connecte, tu dois créer son profil
- Va dans Supabase → SQL Editor et exécute:
  ```sql
  -- Pour créer un profil automatiquement après Google OAuth
  CREATE OR REPLACE FUNCTION public.handle_new_user()
  RETURNS trigger AS $$
  BEGIN
    INSERT INTO public.users (id, username, email, avatar, role)
    VALUES (
      new.id,
      COALESCE(new.raw_user_meta_data->>'full_name', new.email),
      new.email,
      new.raw_user_meta_data->>'avatar_url',
      'user'
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN new;
  END;
  $$ LANGUAGE plpgsql SECURITY DEFINER;

  CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
  ```

### Problème: Variables d'environnement non reconnues

**Solution:**
- Vérifie qu'elles commencent par `VITE_`
- Redéploie le site après avoir ajouté les variables
- Vide le cache du navigateur (Ctrl+Shift+R)

---

## 📊 Vérifications Finales

- ✅ Table `users` créée dans Supabase
- ✅ RLS activé avec les bonnes policies
- ✅ Google OAuth configuré
- ✅ Anonymous Sign-In activé
- ✅ Site déployé sur Netlify
- ✅ Variables d'environnement configurées
- ✅ URL de callback Google correcte
- ✅ Tests de login/logout fonctionnels

---

## 🎉 C'est Fini!

Ton application GuruGammon est maintenant:
- ✅ Live sur https://gurugammon-react.netlify.app
- ✅ Connectée à Supabase
- ✅ Avec Google OAuth fonctionnel
- ✅ Avec mode invité fonctionnel
- ✅ Design noir et or magnifique
- ✅ 100% responsive

**Profite de ton application! 🎲**
