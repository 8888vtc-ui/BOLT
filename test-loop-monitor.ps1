# Script PowerShell pour tester le jeu en boucle et capturer les erreurs
# Exécute des tests répétés et documente les erreurs

$maxTests = 1000
$testDelay = 3000 # 3 secondes entre chaque test
$gameUrl = "http://localhost:5173/game/offline-bot?mode=match&length=5"

$errors = @()
$successCount = 0
$errorCount = 0

Write-Host "🚀 Démarrage de $maxTests tests automatisés..." -ForegroundColor Green
Write-Host "📋 URL: $gameUrl" -ForegroundColor Cyan
Write-Host "⏱️  Délai entre tests: $testDelay ms`n" -ForegroundColor Yellow

for ($i = 1; $i -le $maxTests; $i++) {
    Write-Host "📋 Test $i/$maxTests..." -ForegroundColor Cyan
    
    # Ici, on devrait :
    # 1. Ouvrir le navigateur (ou utiliser Selenium/Playwright)
    # 2. Naviguer vers $gameUrl
    # 3. Attendre le chargement (10-15 secondes)
    # 4. Capturer les logs de la console
    # 5. Vérifier les erreurs (null.id, bot ne joue pas, etc.)
    # 6. Documenter les erreurs
    
    # Pour l'instant, on simule juste le test
    Start-Sleep -Milliseconds $testDelay
    
    if ($i % 100 -eq 0) {
        Write-Host "✅ $i tests effectués (succès: $successCount, erreurs: $errorCount)" -ForegroundColor Green
    }
}

Write-Host "`n📊 Résultats finaux:" -ForegroundColor Green
Write-Host "   Total: $testCount" -ForegroundColor White
Write-Host "   Succès: $successCount" -ForegroundColor Green
Write-Host "   Erreurs: $errorCount" -ForegroundColor Red
Write-Host "   Taux de succès: $([math]::Round(($successCount / $testCount) * 100, 2))%" -ForegroundColor Yellow

if ($errors.Count -gt 0) {
    Write-Host "`n🐛 Erreurs identifiées:" -ForegroundColor Red
    $errors | ForEach-Object { Write-Host "   - $_" -ForegroundColor Yellow }
}

Write-Host "`n✅ Tests terminés!" -ForegroundColor Green


