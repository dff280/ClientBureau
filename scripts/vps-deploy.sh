#!/usr/bin/env bash
set -euo pipefail

REPO_URL="https://github.com/dff280/ClientBureau.git"
BRANCH="${BRANCH:-main}"
COMPOSE_PROJECT_NAME="${COMPOSE_PROJECT_NAME:-client-bureau}"
CANONICAL_APP_DIR="/opt/client-bureau"
LEGACY_APP_DIR="/opt/ClientBureau"
LEGACY_COMPOSE_PROJECT_NAME="${LEGACY_COMPOSE_PROJECT_NAME:-clientbureau}"

if [ -z "${APP_DIR:-}" ]; then
  if [ -d "$CANONICAL_APP_DIR/.git" ]; then
    APP_DIR="$CANONICAL_APP_DIR"
  elif [ -d "$LEGACY_APP_DIR/.git" ]; then
    APP_DIR="$LEGACY_APP_DIR"
    echo "Warning: using legacy app directory $LEGACY_APP_DIR. Prefer $CANONICAL_APP_DIR for production deploys."
  else
    APP_DIR="$CANONICAL_APP_DIR"
  fi
fi

upsert_env() {
  local key="$1"
  local value="$2"

  if grep -q "^${key}=" .env.production; then
    sed -i "s|^${key}=.*|${key}=${value}|" .env.production
  else
    printf "\n%s=%s\n" "$key" "$value" >> .env.production
  fi
}

compose_project_container_ids() {
  local project_name="$1"

  docker ps -aq --filter "label=com.docker.compose.project=${project_name}" || true
}

stop_legacy_compose_project_if_needed() {
  if [ "$APP_DIR" = "$LEGACY_APP_DIR" ] || [ "$COMPOSE_PROJECT_NAME" = "$LEGACY_COMPOSE_PROJECT_NAME" ]; then
    return 0
  fi

  local legacy_container_ids
  legacy_container_ids="$(compose_project_container_ids "$LEGACY_COMPOSE_PROJECT_NAME")"

  if [ -z "$legacy_container_ids" ]; then
    return 0
  fi

  echo ""
  echo "Stopping legacy Compose project ${LEGACY_COMPOSE_PROJECT_NAME} before canonical deploy."
  echo "This prevents duplicate Caddy/app containers from competing for ports 80 and 443."

  if [ -f "$LEGACY_APP_DIR/docker-compose.yml" ]; then
    docker compose -p "$LEGACY_COMPOSE_PROJECT_NAME" -f "$LEGACY_APP_DIR/docker-compose.yml" down --remove-orphans || true
  else
    # Fall back to removing containers by Compose label if the old checkout was deleted first.
    # shellcheck disable=SC2086
    docker rm -f $legacy_container_ids || true
  fi
}

if [ ! -d "$APP_DIR/.git" ]; then
  mkdir -p /opt
  git clone "$REPO_URL" "$APP_DIR"
fi

cd "$APP_DIR"
git fetch origin
git checkout "$BRANCH"
git pull --ff-only origin "$BRANCH"

if [ ! -f .env.production ]; then
  cp .env.production.example .env.production
  echo "Created $APP_DIR/.env.production. Fill in Supabase, Stripe, and NEXT_SERVER_ACTIONS_ENCRYPTION_KEY before rerunning."
  exit 1
fi

RELEASE_COMMIT="$(git rev-parse HEAD)"
RELEASE_VERSION="$(awk -F'"' '/"version":/ { print $4; exit }' package.json)"
RELEASE_DATE="$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
SITE_URL="$(grep -E '^NEXT_PUBLIC_SITE_URL=' .env.production | cut -d= -f2- | tr -d '\r')"
SITE_URL="${SITE_URL:-https://clientbureau.com}"

upsert_env "GIT_COMMIT_SHA" "$RELEASE_COMMIT"
upsert_env "GIT_BRANCH" "$BRANCH"
upsert_env "RELEASE_DATE" "$RELEASE_DATE"

stop_legacy_compose_project_if_needed

docker compose -p "$COMPOSE_PROJECT_NAME" up -d --build
docker compose -p "$COMPOSE_PROJECT_NAME" up -d --force-recreate --no-deps caddy
docker compose -p "$COMPOSE_PROJECT_NAME" ps

if [ "${CLEANUP_LEGACY_COMPOSE:-0}" = "1" ] && [ "$APP_DIR" != "$LEGACY_APP_DIR" ] && [ "$COMPOSE_PROJECT_NAME" != "$LEGACY_COMPOSE_PROJECT_NAME" ] && [ -d "$LEGACY_APP_DIR" ]; then
  echo ""
  echo "Cleaning up legacy checkout at ${LEGACY_APP_DIR}."
  docker compose -p "$LEGACY_COMPOSE_PROJECT_NAME" -f "$LEGACY_APP_DIR/docker-compose.yml" down --remove-orphans || true
  rm -rf "$LEGACY_APP_DIR"
elif [ -d "$LEGACY_APP_DIR/.git" ] && [ "$APP_DIR" != "$LEGACY_APP_DIR" ]; then
  echo ""
  echo "Legacy checkout detected at ${LEGACY_APP_DIR}."
  echo "The deploy helper automatically stops any old legacy Compose containers before starting the canonical stack."
  echo "After confirming production is healthy, remove the old checkout with:"
  echo "  CLEANUP_LEGACY_COMPOSE=1 bash scripts/vps-deploy.sh"
fi

docker image prune -f

echo ""
echo "Deployed Client Bureau ${RELEASE_VERSION} @ ${RELEASE_COMMIT}"
echo "Site: ${SITE_URL}"
echo ""
echo "Version endpoint:"
curl -fsS "${SITE_URL%/}/api/version" || true
echo ""
echo ""
echo "Health endpoint:"
curl -fsS "${SITE_URL%/}/api/health" || true
echo ""
echo ""
echo "Verify from your local machine:"
echo "  \$env:LIVE_BASE_URL=\"${SITE_URL%/}\""
echo "  \$env:EXPECTED_APP_VERSION=\"${RELEASE_VERSION}\""
echo "  \$env:EXPECTED_GIT_COMMIT=\"${RELEASE_COMMIT}\""
echo "  npm run verify:live"
echo "  Remove-Item Env:LIVE_BASE_URL"
echo "  Remove-Item Env:EXPECTED_APP_VERSION"
echo "  Remove-Item Env:EXPECTED_GIT_COMMIT"
