#!/usr/bin/env bash
# Publish Shop by Meals to a NEW GitHub repo + NEW Vercel project.
# Does NOT touch the AI Shopping Lists (List) repository or its Vercel project.
set -euo pipefail
cd "$(dirname "$0")/.."

REPO_NAME="shop-by-meals"
LOG="/Users/jac/Projects/shop-by-meals/.publish-log.txt"
exec > >(tee -a "$LOG") 2>&1

echo "=== $(date) Shop by Meals publish ==="

if ! gh auth status; then
  echo "ERROR: gh not authenticated. Run: gh auth login"
  exit 1
fi

OWNER="$(gh api user --jq .login)"
echo "GitHub owner: $OWNER"

# Safety: never push to List
if git remote get-url origin 2>/dev/null | grep -qiE 'List\.git|/List$'; then
  echo "ERROR: origin points at List — refusing to continue"
  exit 1
fi

if gh repo view "$OWNER/$REPO_NAME" >/dev/null 2>&1; then
  echo "Repo already exists: https://github.com/$OWNER/$REPO_NAME"
else
  echo "Creating private repo $OWNER/$REPO_NAME ..."
  gh repo create "$REPO_NAME" --private --description "Waitrose Shop by Meals prototype"
fi

git remote remove origin 2>/dev/null || true
git remote add origin "https://github.com/$OWNER/$REPO_NAME.git"

# Confirm remote is NOT List
ORIGIN_URL="$(git remote get-url origin)"
echo "origin=$ORIGIN_URL"
if echo "$ORIGIN_URL" | grep -qiE 'List\.git|/List$'; then
  echo "ERROR: origin resolved to List"
  exit 1
fi

echo "Pushing main (baseline) first..."
git push -u origin main

echo "Pushing shop-by-meals-lvp..."
git push -u origin shop-by-meals-lvp

echo "GITHUB_URL=https://github.com/$OWNER/$REPO_NAME"

echo "=== Vercel ==="
npx --yes vercel whoami

# Link / create project (non-interactive where possible)
# Prefer production root directory .
if [[ ! -f .vercel/project.json ]]; then
  npx --yes vercel link --yes --project "$REPO_NAME" || true
fi

# Env vars from local .env (never print values)
if [[ -f .env ]]; then
  # shellcheck disable=SC1091
  set -a
  source .env
  set +a
fi

add_env() {
  local key="$1"
  local val="${!key-}"
  if [[ -z "$val" ]]; then
    echo "WARN: $key empty — add manually in Vercel dashboard"
    return 0
  fi
  # Remove existing then add for production + preview
  for envname in production preview development; do
    echo "$val" | npx --yes vercel env add "$key" "$envname" --force >/dev/null 2>&1 \
      || echo "$val" | npx --yes vercel env add "$key" "$envname" >/dev/null 2>&1 \
      || echo "WARN: could not set $key for $envname (may already exist)"
  done
  echo "Configured $key"
}

add_env VITE_SUPABASE_URL
add_env VITE_SUPABASE_ANON_KEY

echo "Deploying production..."
DEPLOY_OUT="$(npx --yes vercel --prod --yes 2>&1 | tee /dev/stderr)"
echo "$DEPLOY_OUT" | tee -a "$LOG"
PROD_URL="$(echo "$DEPLOY_OUT" | grep -Eo 'https://[^ ]+\.vercel\.app' | tail -1 || true)"
echo "VERCEL_URL=${PROD_URL:-unknown}"

# Verify original List untouched
LIST="/Users/jac/Downloads/Waitrose/Shopping Lists/AI Shopping List"
echo "=== Original List status ==="
git -C "$LIST" status -sb
git -C "$LIST" remote -v
git -C "$LIST" log -1 --oneline

echo "=== PUBLISH COMPLETE ==="
echo "GITHUB_URL=https://github.com/$OWNER/$REPO_NAME"
echo "VERCEL_URL=${PROD_URL:-check vercel dashboard}"
