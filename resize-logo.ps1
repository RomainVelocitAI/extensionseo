# Créer le dossier images s'il n'existe pas
$imagesDir = "images"
if (-not (Test-Path $imagesDir)) {
    New-Item -ItemType Directory -Path $imagesDir | Out-Null
}

# Charger l'image d'origine
Add-Type -AssemblyName System.Drawing
$logoPath = "logo.png"
$original = [System.Drawing.Image]::FromFile($logoPath)

# Tailles requises pour les icônes Chrome
$sizes = @(
    @{size=16; name="icon16.png"},
    @{size=32; name="icon32.png"},
    @{size=48; name="icon48.png"},
    @{size=128; name="icon128.png"}
)

# Redimensionner et sauvegarder chaque taille
foreach ($item in $sizes) {
    $size = $item.size
    $outputPath = Join-Path $imagesDir $item.name
    
    # Créer une nouvelle image avec la taille cible
    $bitmap = New-Object System.Drawing.Bitmap($size, $size)
    $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
    
    # Configuration pour un redimensionnement de haute qualité
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
    
    # Dessiner l'image redimensionnée
    $graphics.DrawImage($original, 0, 0, $size, $size)
    
    # Sauvegarder en PNG avec une qualité maximale
    $bitmap.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)
    
    Write-Host "Créé : $outputPath ($($bitmap.Width)x$($bitmap.Height))"
    
    # Libérer les ressources
    $graphics.Dispose()
    $bitmap.Dispose()
}

# Libérer l'image d'origine
$original.Dispose()

Write-Host "Toutes les icônes ont été générées dans le dossier 'images'"
