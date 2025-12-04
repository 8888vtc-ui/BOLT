#!/bin/bash

# ============================================
# SCRIPT DE VÉRIFICATION PRÉ-DÉPLOIEMENT
# ============================================
# Vérifie que tout est prêt pour le déploiement

echo "🔍 Vérification pré-déploiement GuruGammon..."
echo ""

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

ERRORS=0
WARNINGS=0

# Fonction pour vérifier
check() {
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ $1${NC}"
    else
        echo -e "${RED}❌ $1${NC}"
        ERRORS=$((ERRORS + 1))
    fi
}

warn() {
    echo -e "${YELLOW}⚠️  $1${NC}"
    WARNINGS=$((WARNINGS + 1))
}

# 1. Vérifier Node.js
echo "1. Vérification Node.js..."
node --version > /dev/null 2>&1
check "Node.js installé"

# 2. Vérifier npm
echo "2. Vérification npm..."
npm --version > /dev/null 2>&1
check "npm installé"

# 3. Vérifier les dépendances
echo "3. Vérification des dépendances..."
if [ -d "node_modules" ]; then
    echo -e "${GREEN}✅ node_modules existe${NC}"
else
    echo -e "${YELLOW}⚠️  node_modules manquant - exécutez: npm install${NC}"
    WARNINGS=$((WARNINGS + 1))
fi

# 4. Vérifier .env
echo "4. Vérification .env..."
if [ -f ".env" ]; then
    echo -e "${GREEN}✅ Fichier .env existe${NC}"
    
    # Vérifier les variables
    if grep -q "VITE_SUPABASE_URL" .env && ! grep -q "votre-projet" .env; then
        echo -e "${GREEN}✅ VITE_SUPABASE_URL configuré${NC}"
    else
        warn "VITE_SUPABASE_URL non configuré ou valeur par défaut"
    fi
    
    if grep -q "VITE_SUPABASE_ANON_KEY" .env && ! grep -q "votre_cle" .env; then
        echo -e "${GREEN}✅ VITE_SUPABASE_ANON_KEY configuré${NC}"
    else
        warn "VITE_SUPABASE_ANON_KEY non configuré ou valeur par défaut"
    fi
    
    if grep -q "VITE_BOT_API_URL" .env; then
        echo -e "${GREEN}✅ VITE_BOT_API_URL configuré${NC}"
    else
        warn "VITE_BOT_API_URL non configuré"
    fi
else
    warn "Fichier .env manquant - copiez .env.example vers .env"
fi

# 5. Vérifier netlify.toml
echo "5. Vérification netlify.toml..."
if [ -f "netlify.toml" ]; then
    echo -e "${GREEN}✅ netlify.toml existe${NC}"
    
    if grep -q "build" netlify.toml && grep -q "publish" netlify.toml; then
        echo -e "${GREEN}✅ Configuration Netlify correcte${NC}"
    else
        warn "Configuration Netlify incomplète"
    fi
else
    warn "netlify.toml manquant"
fi

# 6. Vérifier le build
echo "6. Test du build..."
npm run build > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Build réussi${NC}"
    
    if [ -d "dist" ]; then
        echo -e "${GREEN}✅ Dossier dist/ créé${NC}"
    else
        warn "Dossier dist/ manquant après build"
    fi
else
    warn "Build échoué - vérifiez les erreurs"
fi

# 7. Vérifier les types TypeScript
echo "7. Vérification TypeScript..."
npm run typecheck > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Pas d'erreurs TypeScript${NC}"
else
    warn "Erreurs TypeScript détectées"
fi

# 8. Vérifier Git
echo "8. Vérification Git..."
if [ -d ".git" ]; then
    echo -e "${GREEN}✅ Repository Git initialisé${NC}"
    
    # Vérifier .gitignore
    if grep -q ".env" .gitignore; then
        echo -e "${GREEN}✅ .env dans .gitignore${NC}"
    else
        warn ".env pas dans .gitignore"
    fi
else
    warn "Repository Git non initialisé"
fi

# Résumé
echo ""
echo "=========================================="
echo "📊 RÉSUMÉ"
echo "=========================================="
echo -e "${GREEN}✅ Succès: $((8 - ERRORS - WARNINGS))${NC}"
if [ $WARNINGS -gt 0 ]; then
    echo -e "${YELLOW}⚠️  Avertissements: $WARNINGS${NC}"
fi
if [ $ERRORS -gt 0 ]; then
    echo -e "${RED}❌ Erreurs: $ERRORS${NC}"
fi
echo ""

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}🎉 Tout est prêt pour le déploiement !${NC}"
    exit 0
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}⚠️  Prêt avec quelques avertissements${NC}"
    exit 0
else
    echo -e "${RED}❌ Des erreurs doivent être corrigées avant le déploiement${NC}"
    exit 1
fi




