#!/usr/bin/env bash
set -euo pipefail

APP_DIR="/opt/client-bureau"
REPO_URL="https://github.com/dff280/ClientBureau.git"

if [ ! -d "$APP_DIR/.git" ]; then
  mkdir -p /opt
  git clone "$REPO_URL" "$APP_DIR"
fi

cd "$APP_DIR"
git pull --ff-only

if [ ! -f .env.production ]; then
  cp .env.production.example .env.production
  echo "Created $APP_DIR/.env.production. Fill in Supabase, Stripe, and NEXT_SERVER_ACTIONS_ENCRYPTION_KEY before rerunning."
  exit 1
fi

docker compose up -d --build
docker compose ps
