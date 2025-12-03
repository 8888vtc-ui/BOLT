# 🗄️ GUIDE COMPLET - SETUP SUPABASE

Ce guide vous explique comment configurer complètement votre base de données Supabase pour GuruGammon.

---

## 📋 PRÉREQUIS

1. **Compte Supabase** : Créez un compte sur [supabase.com](https://supabase.com)
2. **Projet Supabase** : Créez un nouveau projet
3. **URL et Clé API** : Récupérez vos identifiants dans Settings > API

---

## 🚀 ÉTAPES D'INSTALLATION

### Étape 1 : Ouvrir le SQL Editor

1. Connectez-vous à votre projet Supabase
2. Allez dans **SQL Editor** (menu de gauche)
3. Cliquez sur **New Query**

### Étape 2 : Exécuter le fichier SQL

1. Ouvrez le fichier `SUPABASE_COMPLETE_SETUP.sql`
2. **Copiez TOUT le contenu** du fichier
3. **Collez-le** dans le SQL Editor de Supabase
4. Cliquez sur **Run** (ou `Ctrl+Enter`)

✅ **Résultat attendu** : Toutes les tables sont créées avec succès

---

## 📊 TABLES CRÉÉES

Le fichier SQL crée les tables suivantes :

| Table | Description |
|-------|-------------|
| `profiles` | Profils utilisateurs (username, avatar, etc.) |
| `rooms` | Salles de jeu |
| `room_participants` | Participants aux salles |
| `games` | Parties de backgammon |
| `messages` | Messages de chat |
| `tournaments` | Tournois |
| `tournament_participants` | Participants aux tournois |
| `tournament_matches` | Matchs de tournois |
| `leaderboards` | Classements |
| `analyses` | Analyses IA des positions |
| `game_analytics` | Statistiques de jeu |
| `notifications` | Notifications utilisateurs |

---

## 🔐 PERMISSIONS (RLS)

### ✅ Permissions OUVERTES (pour éviter erreur 42501)

Les tables suivantes ont des permissions **ouvertes** pour `authenticated` ET `anon` :
- ✅ `rooms` - Lecture, écriture, mise à jour
- ✅ `room_participants` - Lecture, insertion, suppression
- ✅ `games` - Lecture, écriture, mise à jour
- ✅ `messages` - Lecture, insertion

**Pourquoi ?** Pour éviter l'erreur `permission denied for schema public` (code 42501) qui bloquait l'application.

### 🔒 Permissions RESTRICTIVES

Les autres tables ont des permissions plus restrictives :
- `profiles` - Lecture publique, écriture/mise à jour par le propriétaire
- `tournaments` - Lecture publique, création/mise à jour par le créateur
- `notifications` - Lecture/mise à jour uniquement par le propriétaire
- `game_analytics` - Lecture uniquement par le propriétaire

---

## 🔧 TRIGGERS AUTOMATIQUES

### 1. Création automatique de profil

Quand un utilisateur s'inscrit (Google OAuth, Email, etc.), un profil est **automatiquement créé** dans la table `profiles`.

**Fonction** : `handle_new_user()`

### 2. Mise à jour automatique de `updated_at`

Les colonnes `updated_at` sont **automatiquement mises à jour** lors des modifications :
- `profiles.updated_at`
- `rooms.updated_at`
- `games.updated_at`
- `tournaments.updated_at`

**Fonction** : `update_updated_at_column()`

---

## 🔍 VÉRIFICATION

### Vérifier que les tables sont créées

```sql
-- Lister toutes les tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;
```

### Vérifier les politiques RLS

```sql
-- Voir toutes les politiques
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

### Vérifier les triggers

```sql
-- Voir tous les triggers
SELECT trigger_name, event_object_table, action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'public';
```

---

## 🐛 DÉPANNAGE

### Erreur : "permission denied for schema public"

**Solution** : Le fichier SQL inclut déjà des permissions ouvertes. Si l'erreur persiste :

1. Vérifiez que vous avez exécuté **TOUT** le fichier SQL
2. Vérifiez que les politiques RLS sont bien créées :
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'rooms';
   ```

### Erreur : "relation already exists"

**Solution** : Les tables existent déjà. Vous pouvez :
- Soit supprimer les tables existantes et réexécuter le script
- Soit utiliser `CREATE TABLE IF NOT EXISTS` (déjà inclus dans le script)

### Erreur : "function already exists"

**Solution** : Les fonctions existent déjà. Le script utilise `CREATE OR REPLACE FUNCTION`, donc c'est normal.

---

## 📝 VARIABLES D'ENVIRONNEMENT

Après avoir exécuté le SQL, configurez ces variables dans votre projet :

```env
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=votre-cle-anon
```

**Où les trouver ?**
1. Supabase Dashboard > Settings > API
2. **Project URL** → `VITE_SUPABASE_URL`
3. **anon public** key → `VITE_SUPABASE_ANON_KEY`

---

## ✅ CHECKLIST FINALE

- [ ] Fichier SQL exécuté avec succès
- [ ] Toutes les tables créées (vérification avec `SELECT table_name`)
- [ ] Variables d'environnement configurées
- [ ] Test de connexion depuis l'application
- [ ] Test de création d'une room
- [ ] Test de création d'une partie

---

## 🎯 PROCHAINES ÉTAPES

1. **Configurer l'authentification** :
   - Activer Google OAuth dans Supabase Dashboard > Authentication > Providers
   - Configurer les URLs de redirection

2. **Activer Realtime** (optionnel) :
   - Supabase Dashboard > Database > Replication
   - Activer la réplication pour `rooms`, `games`, `messages`

3. **Configurer le Storage** (si besoin d'images) :
   - Supabase Dashboard > Storage
   - Créer un bucket `avatars` pour les avatars utilisateurs

---

## 📚 RESSOURCES

- [Documentation Supabase](https://supabase.com/docs)
- [Guide RLS (Row Level Security)](https://supabase.com/docs/guides/auth/row-level-security)
- [Guide Realtime](https://supabase.com/docs/guides/realtime)

---

## 🆘 SUPPORT

Si vous rencontrez des problèmes :
1. Vérifiez les logs dans Supabase Dashboard > Logs
2. Vérifiez la console JavaScript de l'application (console visible en bas à droite)
3. Vérifiez que toutes les migrations ont été exécutées

---

**✅ Une fois le setup terminé, votre application devrait fonctionner sans erreur 42501 !**



