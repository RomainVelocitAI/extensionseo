# Script pour supprimer les déclarations de variables en double dans popup.js

# Chemin du fichier source
$filePath = "d:\Api\Test\CascadeProjects\windsurf-project\seo-quickscore\popup\popup.js"

# Lire le contenu du fichier
$content = Get-Content -Path $filePath -Raw

# Définir le motif à rechercher (la deuxième occurrence des déclarations)
$pattern = '(?s)let isContentScriptReady = false;\r?\nlet pendingAnalysis = false;\r?\n'

# Remplacer la deuxième occurrence par une chaîne vide
$newContent = $content -replace [regex]::Escape("let isContentScriptReady = false;`r`nlet pendingAnalysis = false;`r`n"), '', 1

# Écrire le contenu modifié dans un nouveau fichier
$newFilePath = "d:\Api\Test\CascadeProjects\windsurf-project\seo-quickscore\popup\popup-fixed.js"
$newContent | Set-Content -Path $newFilePath -Force

Write-Host "Fichier corrigé enregistré sous: $newFilePath"
