# 🎲 GuruGammon - Frontend React

> Application de backgammon avec design noir & or, authentification Supabase, et déploiement Netlify

## 🚀 Démarrage Rapide

**LE CODE EST PRÊT!** Il te suffit de suivre les instructions étape par étape.

### 📖 Lis ces fichiers dans l'ordre:

1. **`INSTRUCTIONS_FINALES.md`** ← **COMMENCE ICI!**
   - Guide pas-à-pas complet (30 min)
   - Configuration Supabase
   - Configuration Google OAuth
   - Déploiement Netlify

2. **`CHANGES_SUMMARY.md`**
   - Résumé de ce qui a changé
   - Migration Render → Supabase
   - Nouvelles fonctionnalités

3. **`NETLIFY_DEPLOY_GUIDE.md`**
   - Guide détaillé de déploiement
   - Dépannage complet
   - Astuces et conseils

## 🎨 Design

- **Fond:** Noir pur (#000000)
- **Accents:** Or pur (#FFD700)
- **Style:** Moderne, élégant, premium
- **Responsive:** Mobile-first

## ⚡ Fonctionnalités

- ✅ **Google OAuth** via Supabase
- ✅ **Mode Invité** (anonymous auth)
- ✅ **Dashboard** avec profil utilisateur
- ✅ **Sécurité RLS** sur toutes les données
- ✅ **Session auto-gérée** par Supabase

## 🛠️ Stack Technique

- **Frontend:** React 18 + TypeScript + Vite
- **Styling:** Tailwind CSS
- **Backend:** Supabase (Auth + Database)
- **Icons:** Lucide React
- **Routing:** React Router
- **Déploiement:** Netlify

## 📁 Structure

```
src/
├── lib/
│   ├── supabase.ts    # Client Supabase
│   └── api.ts         # API wrapper
├── hooks/
│   └── useAuth.ts     # Hook d'authentification
├── pages/
│   ├── Login.tsx      # Page de connexion
│   └── Dashboard.tsx  # Dashboard utilisateur
└── App.tsx            # Routes principales
```

## 🔧 Installation Locale

```bash
# Installer les dépendances
npm install

# Créer .env avec tes variables Supabase
cp .env.example .env

# Lancer en dev
npm run dev

# Build de production
npm run build
```

## 📦 Variables d'Environnement

```bash
VITE_SUPABASE_URL=https://vgmrkdlgjivfdyrpadha.supabase.co
VITE_SUPABASE_ANON_KEY=ton_anon_key_ici
```

## 🎯 Prochaines Étapes

Après avoir déployé, tu peux ajouter:
- Plateau de backgammon interactif
- Matchmaking en temps réel
- Système de tournois
- Leaderboards
- Chat en direct
- Statistiques de jeu

## 📝 License

MIT

## 🤝 Support

Besoin d'aide? Ouvre un issue sur GitHub.

---

**🚀 COMMENCE PAR `INSTRUCTIONS_FINALES.md` MAINTENANT!**
