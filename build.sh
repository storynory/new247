#!/usr/bin/env bash

set -e

echo "=== Philosophy247 build starting ==="

cd /var/www/247

echo "→ Fetching latest code"
git fetch origin
git pull origin main

echo "→ Installing dependencies"
npm ci

echo "→ Running image processing"
npm run images

echo "→ Building site"
npm run build

echo "→ Reloading nginx"
sudo systemctl reload nginx

echo "=== Build complete ==="

