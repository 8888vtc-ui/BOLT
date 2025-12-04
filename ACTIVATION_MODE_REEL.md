# Activation Mode Réel - Configuration Complète

**Date**: 2025-12-03  
**Objectif**: Passer du mode démo au mode réel pour éviter les bugs

---

## ✅ Configuration Effectuée

### Fichier `.env` créé

**Variables configurées**:

```env
# Supabase Configuration (Mode Réel)
VITE_SUPABASE_URL=https://vgmrkdlgjivfdyrpadha.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZnbXJrZGxnaml2ZmR5cnBhZGhhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQyNjAyNjgsImV4cCI6MjA3OTgzNjI2OH0.FIBVCw8NVCesoFKWpPXRwEtQPlMSrCfZWHO8s43s4IQ

# Coach AI Configuration
VITE_COACH_API_URL=https://botgammon.netlify.app/.netlify/functions/coach
VITE_OLLAMA_URL=https://bot-production-b9d6.up.railway.app
VITE_OLLAMA_MODEL=deepseek-coder:latest
VITE_DEEPSEEK_API_KEY=sk-56ff5e77bb064dad93cbadb750fd2c3

# Bot API Configuration
VITE_BOT_API_URL=https://botgammon.netlify.app/.netlify/functions/analyze
```

---

## 🔄 Actions Requises

### 1. Redémarrer le Serveur de Développement

**IMPORTANT**: Le serveur doit être redémarré pour charger les nouvelles variables d'environnement.

```bash
# Arrêter le serveur actuel (Ctrl+C)
# Puis redémarrer:
npm run dev
```

---

## ✅ Vérifications

### Mode Réel Activé

Après redémarrage, vérifier dans la console du navigateur:

**Avant** (Mode Démo):
```
Demo mode: Supabase not configured, skipping auth
```

**Après** (Mode Réel):
```
✅ Supabase connecté
✅ Authentification active
✅ Mode réel activé
```

---

## 🧪 Tests en Mode Réel

### Test 1: Authentification

1. Ouvrir: http://localhost:5173/
2. Vérifier qu'il n'y a plus de message "Demo mode"
3. Essayer de se connecter (si fonctionnalité disponible)

### Test 2: Création de Partie

1. Aller dans le Lobby
2. Créer une nouvelle partie
3. Vérifier que la partie est sauvegardée dans Supabase

### Test 3: Jeu en Ligne

1. Créer une partie avec un autre joueur
2. Vérifier la synchronisation en temps réel
3. Vérifier que les coups sont sauvegardés

### Test 4: Coach AI

1. Ouvrir une partie
2. Aller dans le chat
3. Poser une question au coach
4. Vérifier que le coach répond via Netlify Function

---

## 🐛 Bugs à Vérifier

### Bugs Potentiels en Mode Réel

1. **Erreurs de Permissions Supabase**
   - Vérifier les RLS (Row Level Security) policies
   - Vérifier que les utilisateurs peuvent créer/lire les parties

2. **Erreurs de Connexion**
   - Vérifier que Supabase est accessible
   - Vérifier les credentials

3. **Erreurs de Synchronisation**
   - Vérifier que les coups sont synchronisés
   - Vérifier que les états de jeu sont sauvegardés

4. **Erreurs d'Authentification**
   - Vérifier le flow d'authentification
   - Vérifier les tokens

---

## 📋 Checklist

### Configuration
- [x] Fichier `.env` créé
- [x] Variables Supabase configurées
- [x] Variables Coach AI configurées
- [x] Variables Bot API configurées

### Déploiement
- [ ] Serveur redémarré
- [ ] Mode réel activé (vérifier console)
- [ ] Plus de messages "Demo mode"

### Tests
- [ ] Test authentification
- [ ] Test création partie
- [ ] Test jeu en ligne
- [ ] Test coach AI
- [ ] Vérification bugs corrigés

---

## 🔍 Debugging

### Si le Mode Démo Persiste

1. **Vérifier le fichier `.env`**
   ```bash
   cat .env
   ```

2. **Vérifier que le serveur a été redémarré**
   - Le serveur doit être complètement arrêté puis redémarré

3. **Vérifier les variables dans le code**
   ```javascript
   console.log('VITE_SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL);
   console.log('VITE_SUPABASE_ANON_KEY:', import.meta.env.VITE_SUPABASE_ANON_KEY);
   ```

4. **Vérifier les logs de la console**
   - Plus de messages "Demo mode"
   - Messages de connexion Supabase

---

## ✅ Résultat Attendu

Après activation du mode réel:
- ✅ Plus de mode démo
- ✅ Authentification Supabase active
- ✅ Synchronisation en temps réel
- ✅ Sauvegarde des parties
- ✅ Coach AI fonctionnel
- ✅ Moins de bugs liés au mode démo

---

## 📝 Notes

- Le fichier `.env` ne doit **PAS** être commité dans Git (déjà dans `.gitignore`)
- Les variables sont chargées au démarrage du serveur
- Un redémarrage complet est nécessaire pour appliquer les changements


