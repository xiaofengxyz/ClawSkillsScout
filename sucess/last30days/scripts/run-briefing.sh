#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PYTHON="${LAST30DAYS_PYTHON:-python3}"

cd "$ROOT"
exec "$PYTHON" "$ROOT/scripts/briefing.py" "$@"
