# 📊 ÉTAT NETLIFY - RAPPORT DÉTAILLÉ

## 🔑 Token Netlify Configuré

Pour vérifier l'état de vos sites Netlify, utilisez :

```bash
# Avec variable d'environnement
NETLIFY_TOKEN=votre_token npm run check-netlify

# Ou directement
npm run check-netlify votre_token
```

---

## 📋 Informations Récupérées

Le script vérifie pour chaque site :

1. **Informations de base**
   - Nom du site
   - URL publique
   - ID du site
   - État actuel
   - Dernière mise à jour

2. **Derniers déploiements** (5 derniers)
   - État (ready, error, building, etc.)
   - Date de création
   - Commit/Branch

3. **Variables d'environnement**
   - Liste de toutes les variables
   - Valeurs (masquées pour sécurité)

---

## 🔒 Sécurité

⚠️ **IMPORTANT :** Le token Netlify est sensible !

- Ne commitez JAMAIS le token dans Git
- Ne partagez pas le token publiquement
- Utilisez des variables d'environnement pour le stocker
- Régénérez le token si compromis

**Pour créer/régénérer un token :**
1. Aller sur https://app.netlify.com/user/applications
2. Créer un nouveau token ou régénérer un existant
3. Copier le token (commence par `nfp_`)

---

## 📝 Notes

Le token fourni a été utilisé pour vérifier l'état des sites.
Les résultats sont affichés dans la console lors de l'exécution du script.




