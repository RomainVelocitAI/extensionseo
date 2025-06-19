Add-Type -AssemblyName System.Drawing

$imagePath = "logo.png"
$image = [System.Drawing.Image]::FromFile($imagePath)

Write-Host "Dimensions: $($image.Width)x$($image.Height)"
Write-Host "Format: $($image.RawFormat)"
Write-Host "Pixel Format: $($image.PixelFormat)"

$image.Dispose()
