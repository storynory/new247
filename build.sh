#!/usr/bin/env bash
set -euo pipefail

# -----------------------------
# Config (explicit, no PATH reliance)
# -----------------------------
BASE="/var/www/247"

NODE="/home/bertie/.nvm/versions/node/v24.11.0/bin/node"
NPM="/home/bertie/.nvm/versions/node/v24.11.0/bin/npm"

NGINX="/usr/sbin/nginx"
SYSTEMCTL="/bin/systemctl"

# -----------------------------
# Logging helper
# -----------------------------
log() {
  printf '[%s] %s\n' "$(date -Iseconds)" "$*"
}

log "=== [philosophy247] Build start ==="
log "Using node: $($NODE -v)"
log "Using npm:  $($NPM -v)"

cd "$BASE"

# -----------------------------
# Sync repo
# -----------------------------
log "--- Updating repository ---"
git fetch origin main
git reset --hard origin/main

# -----------------------------
# Dependencies
# -----------------------------
log "--- Installing dependencies (npm ci) ---"
"$NPM" ci

# -----------------------------
# Images
# -----------------------------
log "--- Processing images ---"
"$NODE" scripts/process-images.mjs

# -----------------------------
# Build
# -----------------------------
log "--- Building site ---"
"$NPM" run build

# -----------------------------
# Nginx reload (deploy-safe)
# -----------------------------
log "--- Reloading nginx ---"
sudo /usr/local/sbin/reload-nginx-safe.sh

log "=== [philosophy247] Build complete ==="

