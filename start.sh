#!/bin/bash
# ArchDraw Intel — local launcher
# Run once to set up, then again any time to start the server.

set -e
cd "$(dirname "$0")"

echo ""
echo "  ArchDraw Intel — local setup"
echo "  ─────────────────────────────"

# ── Node check ───────────────────────────────────────────────────────────────
if ! command -v node &>/dev/null; then
  echo ""
  echo "  Node.js is not installed."
  echo "  Download it at: https://nodejs.org  (LTS version)"
  echo ""
  exit 1
fi

NODE_VER=$(node -e "process.stdout.write(process.versions.node)")
echo "  Node.js $NODE_VER  ✓"

# ── .env setup ───────────────────────────────────────────────────────────────
if [ ! -f .env ]; then
  echo ""
  echo "  First run: creating .env from .env.example"
  cp .env.example .env

  echo ""
  echo "  Paste your Anthropic API key below."
  echo "  Get one at: https://console.anthropic.com/settings/keys"
  echo ""
  read -p "  ANTHROPIC_KEY: " AKEY

  if [ -n "$AKEY" ]; then
    # Replace the placeholder line
    if [[ "$OSTYPE" == "darwin"* ]]; then
      sed -i '' "s|ANTHROPIC_KEY=sk-ant-api03-your-key-here|ANTHROPIC_KEY=$AKEY|" .env
    else
      sed -i "s|ANTHROPIC_KEY=sk-ant-api03-your-key-here|ANTHROPIC_KEY=$AKEY|" .env
    fi
    echo "  Key saved to .env  ✓"
  else
    echo "  No key entered — you can paste it in the app UI instead."
  fi
fi

# ── Launch ───────────────────────────────────────────────────────────────────
echo ""
echo "  Starting server..."
echo ""
node server.js
