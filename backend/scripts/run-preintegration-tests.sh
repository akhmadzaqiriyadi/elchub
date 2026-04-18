#!/usr/bin/env bash
set -euo pipefail

TEST_PATH="${1:-tests/pre-integration}"

if [[ -f .env ]] && grep -q '^DATABASE_URL=' .env; then
  DATABASE_URL_FROM_ENV="$(grep '^DATABASE_URL=' .env | head -n1 | cut -d '=' -f2-)"
else
  DATABASE_URL_FROM_ENV=""
fi

DEFAULT_DATABASE_URL="postgresql://${USER:-postgres}@localhost:5432/elchub?schema=public"
export DATABASE_URL="${DATABASE_URL_FROM_ENV:-$DEFAULT_DATABASE_URL}"

echo "[preintegration] using DATABASE_URL=${DATABASE_URL}"
echo "[preintegration] syncing schema..."
bun run db:push >/dev/null

echo "[preintegration] seeding baseline data..."
bun run db:seed >/dev/null

echo "[preintegration] running tests at ${TEST_PATH}..."
bun test "${TEST_PATH}"