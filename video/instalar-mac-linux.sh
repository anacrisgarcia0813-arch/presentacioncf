#!/usr/bin/env bash
# Instalador para macOS y Linux (Ubuntu/Debian).
# Uso: bash instalar-mac-linux.sh
set -euo pipefail
cd "$(dirname "$0")"
echo "== Instalando dependencias para Remotion =="

if [[ "$(uname)" == "Darwin" ]]; then
  if ! command -v brew >/dev/null; then
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
    eval "$(/opt/homebrew/bin/brew shellenv 2>/dev/null || /usr/local/bin/brew shellenv)"
  fi
  if ! command -v node >/dev/null; then
    brew install node@22
    brew link --overwrite node@22
  fi
  command -v ffmpeg >/dev/null || brew install ffmpeg
else
  sudo apt-get update
  command -v ffmpeg >/dev/null || sudo apt-get install -y ffmpeg
  if ! command -v node >/dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
    sudo apt-get install -y nodejs
  fi
  # Librerías que necesita el navegador headless de Remotion
  sudo apt-get install -y libnss3 libdbus-1-3 libatk1.0-0 libgbm-dev libasound2 \
    libxrandr2 libxkbcommon-dev libxfixes3 libxcomposite1 libxdamage1 libatk-bridge2.0-0 \
    libpango-1.0-0 libcairo2 libcups2 || sudo apt-get install -y libasound2t64
fi

npm install
npx remotion browser ensure

echo
echo "Listo: node $(node -v) | $(ffmpeg -version | head -1)"
echo "Abre el editor con:    npm run studio"
echo "Renderiza el lote con: npm run lote"
