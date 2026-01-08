#!/usr/bin/env bash

set -e

echo "=== Philosophy247 build starting ==="

cd /var/www/247

git fetch origin
git pull origin main

npm ci
npm run images
npm run build

echo "→ Testing nginx config"
sudo /usr/sbin/nginx -t

echo "→ Reloading nginx"
sudo systemctl reload nginx

echo "=== Build complete ==="

