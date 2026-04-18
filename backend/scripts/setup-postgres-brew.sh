#!/usr/bin/env bash
set -euo pipefail

DB_NAME="elchub"
PG_FORMULA="postgresql@16"

if command -v brew >/dev/null 2>&1; then
  echo "[1/4] Installing ${PG_FORMULA} if needed..."
  brew list --versions "${PG_FORMULA}" >/dev/null 2>&1 || brew install "${PG_FORMULA}"

  echo "[2/4] Starting PostgreSQL service..."
  brew services start "${PG_FORMULA}" >/dev/null
else
  echo "Homebrew not found. Please install Homebrew first: https://brew.sh"
  exit 1
fi

if ! command -v createdb >/dev/null 2>&1; then
  echo "createdb command not found. Make sure PostgreSQL binaries are in your PATH."
  echo "Example: export PATH=\"$(brew --prefix ${PG_FORMULA})/bin:$PATH\""
  exit 1
fi

echo "[3/4] Creating database '${DB_NAME}' if it does not exist..."
if psql -lqt | cut -d \| -f 1 | grep -qw "${DB_NAME}"; then
  echo "Database '${DB_NAME}' already exists."
else
  createdb "${DB_NAME}"
  echo "Database '${DB_NAME}' created."
fi

echo "[4/4] Done. Next steps:"
echo "- Copy backend/.env.development.example to backend/.env"
echo "- Run: bun run prisma:generate"
echo "- Run: bun run db:migrate"
echo "- Run: bun run db:seed"