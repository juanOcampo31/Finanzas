<#
.SYNOPSIS
  Sube la version del service worker (sw.js) y el texto de respaldo (index.html)
  en un solo paso, para que el deploy siempre genere un sw.js distinto al anterior.

.DESCRIPTION
  El navegador solo detecta un service worker "nuevo" si el archivo sw.js cambia
  byte a byte. Si otro archivo (app.js, style.css, index.html) cambia pero sw.js
  no, la app sigue funcionando con contenido nuevo (por el stale-while-revalidate)
  pero el numero de version mostrado en pantalla queda desactualizado, porque viene
  del service worker activo (el viejo). Corre este script ANTES de cada commit/push
  para no depender de acordarse de editar el numero a mano en dos archivos.

.EXAMPLE
  .\bump-version.ps1
  Incrementa el ultimo decimal (1.4 -> 1.5) automaticamente.

.EXAMPLE
  .\bump-version.ps1 -Version 2.0
  Fija la version explicitamente.
#>
param(
  [string]$Version
)

$root = $PSScriptRoot
$swPath = Join-Path $root 'sw.js'
$indexPath = Join-Path $root 'index.html'

$swContent = Get-Content -Raw -Encoding UTF8 $swPath
$match = [regex]::Match($swContent, "const CACHE_VERSION = '([\d.]+)';")
if (-not $match.Success) {
  Write-Error "No se encontro 'const CACHE_VERSION' en sw.js"
  exit 1
}
$currentVersion = $match.Groups[1].Value

if (-not $Version) {
  $parts = $currentVersion.Split('.')
  $lastIndex = $parts.Length - 1
  $parts[$lastIndex] = ([int]$parts[$lastIndex] + 1).ToString()
  $Version = [string]::Join('.', $parts)
}

if ($Version -eq $currentVersion) {
  Write-Error "La version nueva ($Version) es igual a la actual ($currentVersion). El service worker no se actualizaria."
  exit 1
}

$swContent = $swContent -replace "const CACHE_VERSION = '[\d.]+';", "const CACHE_VERSION = '$Version';"
Set-Content -Path $swPath -Value $swContent -Encoding UTF8 -NoNewline

$indexContent = Get-Content -Raw -Encoding UTF8 $indexPath
$indexContent = $indexContent -replace 'V [\d.]+ &bull; Powered by Felipe Ocampo', "V $Version &bull; Powered by Felipe Ocampo"
# manifest.json y el ícono de iOS (apple-touch-icon) no pasan por el service worker cuando el
# propio sistema operativo revisa si hay un ícono nuevo (Android/iOS los piden directo por red) —
# sin un ?v= que cambie en cada release, GitHub Pages/el navegador podría seguirlos sirviendo
# cacheados aunque el PNG ya se haya reemplazado, bloqueando esa revisión desde el día uno.
$indexContent = $indexContent -replace 'href="manifest\.json(\?v=[\d.]+)?"', "href=`"manifest.json?v=$Version`""
$indexContent = $indexContent -replace 'href="apple-touch-icon\.png(\?v=[\d.]+)?"', "href=`"apple-touch-icon.png?v=$Version`""
Set-Content -Path $indexPath -Value $indexContent -Encoding UTF8 -NoNewline

$manifestPath = Join-Path $root 'manifest.json'
$manifestContent = Get-Content -Raw -Encoding UTF8 $manifestPath
$manifestContent = $manifestContent -replace '"icon-192\.png(\?v=[\d.]+)?"', "`"icon-192.png?v=$Version`""
$manifestContent = $manifestContent -replace '"icon-512\.png(\?v=[\d.]+)?"', "`"icon-512.png?v=$Version`""
Set-Content -Path $manifestPath -Value $manifestContent -Encoding UTF8 -NoNewline

Write-Host "Version actualizada: $currentVersion -> $Version (sw.js + index.html + manifest.json)" -ForegroundColor Green
Write-Host "Ahora haz commit y push de los cambios." -ForegroundColor Yellow
