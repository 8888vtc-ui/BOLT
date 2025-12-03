# 🚀 GUIDE RAPIDE - CORRECTION SÉCURITÉ SUPABASE

**URL Projet**: `https://nhhxgnmjsmpyyfmngoyf.supabase.co`  
**Project Ref**: `nhhxgnmjsmpyyfmngoyf`

---

## ⚡ MÉTHODE RAPIDE (2 minutes)

### 1. Ouvrir le SQL Editor
👉 **Lien direct**: https://supabase.com/dashboard/project/nhhxgnmjsmpyyfmngoyf/sql/new

### 2. Copier le script
Le script complet est dans: `FIX_SECURITY_RLS.sql`

### 3. Coller et exécuter
- Coller le contenu dans l'éditeur
- Cliquer sur **Run** (ou `Ctrl+Enter`)

### 4. Vérifier
- ✅ Les 43 problèmes de sécurité doivent disparaître
- ✅ Les 8 problèmes de performance doivent s'améliorer

---

## 📋 RÉSUMÉ DU SCRIPT

Le script `FIX_SECURITY_RLS.sql` va:

1. **Activer RLS** sur toutes les tables publiques
2. **Créer les politiques RLS** pour chaque table
3. **Créer les index** pour améliorer les performances

**Tables corrigées**:
- `analysis_quotas`
- `websocket_connections`
- `game_analyses`
- `user_analytics`
- `tournament_participants`
- `tournaments`
- `users`
- `games`
- `game_moves`
- `rooms`
- `messages`
- `room_participants`
- `tournament_matches`

---

## ✅ CHECKLIST POST-EXÉCUTION

- [ ] Script exécuté sans erreurs
- [ ] Dashboard Supabase ne montre plus de problèmes de sécurité
- [ ] Les requêtes sont plus rapides
- [ ] L'application fonctionne toujours correctement

---

**Temps estimé**: 2 minutes  
**Difficulté**: ⭐ Facile

