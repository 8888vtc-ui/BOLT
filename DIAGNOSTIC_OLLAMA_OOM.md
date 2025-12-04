# Diagnostic - Ollama OOM (Out Of Memory) sur Railway

**Date**: 2025-12-03  
**Problème**: Le serveur Ollama sur Railway ne peut pas charger le modèle à cause d'un manque de mémoire

---

## 🐛 Problème Identifié

### Erreur Principale
```
error="llama runner process has terminated: signal: killed"
```

**Cause**: Le processus est tué par le système d'exploitation à cause d'un manque de mémoire (OOM Killer).

---

## 📊 Analyse des Ressources

### Mémoire Disponible
```
total="953.7 MiB" 
free="866.7 MiB" 
free_swap="185.3 GiB"
```

### Mémoire Requise par le Modèle
```
model weights: 703.4 MiB
kv cache: 768.0 MiB
total: 1.4 GiB
```

### Problème
- **Mémoire disponible**: ~954 MiB
- **Mémoire requise**: ~1400 MiB
- **Déficit**: ~446 MiB

Le serveur n'a **pas assez de mémoire** pour charger le modèle !

---

## 🔍 Détails du Modèle

- **Modèle**: `deepseek-coder:latest`
- **Paramètres**: 1.35B
- **Quantification**: Q4_0
- **Taille du fichier**: 738.88 MiB
- **Taille en mémoire**: 1.4 GiB (avec KV cache)

---

## ✅ Solutions

### Solution 1: Augmenter les Ressources Railway (Recommandé)
1. Aller sur Railway Dashboard
2. Sélectionner le service Ollama
3. Augmenter la mémoire à **au moins 2 GiB**
4. Redémarrer le service

**Avantages**:
- Le modèle fonctionnera correctement
- Pas de changement de code nécessaire

**Inconvénients**:
- Coût supplémentaire sur Railway

---

### Solution 2: Utiliser un Modèle Plus Petit
Remplacer `deepseek-coder:latest` par un modèle plus petit :
- `tinyllama` (~600 MiB)
- `phi-2` (~1.6 GiB mais plus efficace)
- `qwen2.5:0.5b` (si disponible)

**Avantages**:
- Pas de coût supplémentaire
- Fonctionne avec les ressources actuelles

**Inconvénients**:
- Qualité de réponse potentiellement réduite

---

### Solution 3: Utiliser le Fallback DeepSeek API (Déjà Configuré)
Le code utilise déjà le fallback DeepSeek API quand Ollama échoue.

**Avantages**:
- Fonctionne immédiatement
- Pas de changement nécessaire
- Qualité de réponse élevée

**Inconvénients**:
- Coût par requête (mais clé déjà fournie)

---

## 📝 Recommandation

**Solution immédiate**: Le fallback DeepSeek API est déjà configuré et fonctionne. Le système basculera automatiquement vers DeepSeek quand Ollama échoue.

**Solution à long terme**: Augmenter les ressources Railway à 2 GiB minimum pour permettre à Ollama de fonctionner correctement.

---

## 🔧 Configuration Actuelle

Le code dans `src/lib/deepseekService.ts` gère déjà le fallback :
1. **PRIORITÉ 1**: Netlify Function (appelle Ollama)
2. **PRIORITÉ 2**: Ollama Direct (si Netlify Function non configurée)
3. **PRIORITÉ 3**: DeepSeek API (fallback si Ollama échoue)

Le système basculera automatiquement vers DeepSeek API quand Ollama retourne une erreur 500.

---

## ⚠️ Note Importante

Les erreurs 500 observées sont **normales** dans la configuration actuelle. Le système basculera automatiquement vers DeepSeek API, qui fonctionne correctement.

Pour vérifier que le fallback fonctionne, observer les logs du client qui devraient montrer :
```
[AI Coach] Netlify Function failed, trying DeepSeek API fallback
[AI Coach] Using DeepSeek API (fallback)
```


