# Instalador para Windows 10/11.
# Uso: clic derecho sobre este archivo > "Ejecutar con PowerShell"
# (o en PowerShell: powershell -ExecutionPolicy Bypass -File .\instalar-windows.ps1)

$ErrorActionPreference = "Stop"
Write-Host "== Instalando dependencias para Remotion ==" -ForegroundColor Cyan

if (-not (Get-Command winget -ErrorAction SilentlyContinue)) {
  Write-Host "Falta 'winget'. Instala 'App Installer' desde Microsoft Store y vuelve a ejecutar." -ForegroundColor Red
  exit 1
}

function Instalar($id, $comando) {
  if (Get-Command $comando -ErrorAction SilentlyContinue) {
    Write-Host "OK  $comando ya está instalado"
  } else {
    Write-Host "... instalando $id"
    winget install --id $id -e --accept-source-agreements --accept-package-agreements
  }
}

Instalar "OpenJS.NodeJS.LTS" "node"
Instalar "Gyan.FFmpeg" "ffmpeg"
Instalar "Git.Git" "git"

# Recargar el PATH para usar lo recién instalado sin reiniciar la terminal
$env:Path = [Environment]::GetEnvironmentVariable("Path", "Machine") + ";" + [Environment]::GetEnvironmentVariable("Path", "User")

Set-Location $PSScriptRoot
Write-Host "... instalando paquetes del proyecto (npm install)"
npm install
Write-Host "... descargando el navegador que usa Remotion para renderizar"
npx remotion browser ensure

Write-Host ""
Write-Host "Listo. Versiones:" -ForegroundColor Green
node -v
ffmpeg -version | Select-Object -First 1
Write-Host ""
Write-Host "Abre el editor con:   npm run studio"
Write-Host "Renderiza el lote con: npm run lote"
