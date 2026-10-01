#!/usr/bin/env bash
# Sync VITE_SUPABASE_* from local .env into Vercel without printing secret values.
# Usage (from repo root):
#   bash scripts/sync-vercel-supabase-env.sh
# Optional:
#   PROJECT=shop-single-meal bash scripts/sync-vercel-supabase-env.sh

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

ENV_FILE="${ENV_FILE:-.env}"
PROJECT="${PROJECT:-shop-single-meal}"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "Missing $ENV_FILE (expected VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY)." >&2
  exit 1
fi

# Load only the two keys without echoing values.
# shellcheck disable=SC1090
set -a
# Parse without sourcing arbitrary shell from .env
while IFS= read -r line || [[ -n "$line" ]]; do
  case "$line" in
    ''|\#*) continue ;;
  esac
  key="${line%%=*}"
  val="${line#*=}"
  case "$key" in
    VITE_SUPABASE_URL|VITE_SUPABASE_ANON_KEY)
      export "$key=$val"
      ;;
  esac
done < "$ENV_FILE"
set +a

if [[ -z "${VITE_SUPABASE_URL:-}" || -z "${VITE_SUPABASE_ANON_KEY:-}" ]]; then
  echo "Both VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must be set in $ENV_FILE." >&2
  exit 1
fi

echo "Linking Vercel project: $PROJECT (values will not be printed)"
npx --yes vercel@latest link --yes --project "$PROJECT" >/dev/null

upsert() {
  local name="$1"
  local value="$2"
  local env="$3"
  # Remove existing var for this environment if present (ignore failures).
  npx --yes vercel@latest env rm "$name" "$env" --yes >/dev/null 2>&1 || true
  # Pipe value so it never appears in argv process listings as clearly.
  printf '%s' "$value" | npx --yes vercel@latest env add "$name" "$env" >/dev/null
  echo "Upserted $name → $env (value hidden)"
}

for env in production preview development; do
  upsert VITE_SUPABASE_URL "$VITE_SUPABASE_URL" "$env"
  upsert VITE_SUPABASE_ANON_KEY "$VITE_SUPABASE_ANON_KEY" "$env"
done

echo "Done. Redeploy production so Vite can bake in the new env:"
echo "  npx vercel@latest --prod --yes"
