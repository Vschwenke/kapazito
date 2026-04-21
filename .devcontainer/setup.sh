#!/usr/bin/env bash
# Einmalige Einrichtung nach Codespace-Erstellung.
# - npm dependencies installieren
# - Prisma-Client generieren
# - DB migrieren
# - Demo-Daten seeden
# - .env anlegen mit Defaults (Secrets aus Codespaces-Env uebernehmen)

set -euo pipefail

cd /workspaces/$(basename "$PWD" 2>/dev/null || echo kapazito)
cd "$(git rev-parse --show-toplevel 2>/dev/null || pwd)"

echo ""
echo "============================================"
echo "  Kapazito Codespace-Setup"
echo "============================================"
echo ""

# --- .env erzeugen, falls noch nicht da -----------------------
if [ ! -f .env ]; then
  echo "[.env] Erzeuge aus Defaults + Codespaces-Secrets..."

  # NEXTAUTH_SECRET zufaellig generieren, falls nicht gesetzt
  if [ -z "${NEXTAUTH_SECRET:-}" ]; then
    NEXTAUTH_SECRET=$(openssl rand -base64 32)
    echo "[.env] NEXTAUTH_SECRET auto-generiert"
  fi

  cat > .env <<EOF
# Automatisch erzeugt beim Codespace-Start.
# Aenderungen ueberleben Container-Neustart, aber NICHT Codespace-Rebuild.
DATABASE_URL="${DATABASE_URL:-postgresql://kapazito:kapazito_dev@localhost:5432/kapazito?schema=public}"
NEXTAUTH_URL="${NEXTAUTH_URL:-http://localhost:3000}"
NEXTAUTH_SECRET="${NEXTAUTH_SECRET}"
ANTHROPIC_API_KEY="${ANTHROPIC_API_KEY:-}"
OPENAI_API_KEY="${OPENAI_API_KEY:-}"
LLM_PROVIDER="${LLM_PROVIDER:-anthropic}"
LLM_MODEL="${LLM_MODEL:-claude-3-5-sonnet-20241022}"
RESEND_API_KEY="${RESEND_API_KEY:-}"
MAIL_FROM="${MAIL_FROM:-Kapazito <dev@kapazito.de>}"
STORAGE_PROVIDER="local"
KAPI_APPROVAL_REQUIRED="true"
MULTI_TENANCY_ENFORCED="true"
EOF
fi

# --- Dependencies -----------------------------------------------
echo ""
echo "[npm] install..."
npm install --no-audit --no-fund --prefer-offline

# --- Prisma ----------------------------------------------------
echo ""
echo "[prisma] generate..."
npx prisma generate

echo ""
echo "[prisma] migrate dev (ohne interaktiven Namen)..."
# db push reicht fuer Dev — keine Migrations-Files, nur Schema-Sync
npx prisma db push --accept-data-loss

# --- Seed -------------------------------------------------------
echo ""
echo "[seed] Demo-Daten..."
npm run db:seed || echo "Seed uebersprungen (evtl. schon geseedet)."

echo ""
echo "============================================"
echo "  Setup fertig! Naechste Schritte:"
echo "============================================"
echo ""
echo "  1) ANTHROPIC_API_KEY pruefen:"
echo "     grep ANTHROPIC_API_KEY .env"
echo ""
echo "     Falls leer, ins GitHub-Profil:"
echo "     https://github.com/settings/codespaces"
echo "     -> New secret -> Name: ANTHROPIC_API_KEY"
echo "     -> Repo-Access: Vschwenke/kapazito"
echo ""
echo "  2) App starten:"
echo "     npm run dev"
echo ""
echo "  3) Preview oeffnen:"
echo "     VS Code zeigt unten 'PORTS' — auf den Port-3000-Link klicken."
echo ""
echo "  Login:  admin@kapazito.de / Kapazito2026! / Slug: demo"
echo ""
