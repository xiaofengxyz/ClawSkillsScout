#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
LOG_DIR="${ROOT_DIR}/logs"

mkdir -p "${LOG_DIR}"
cd "${ROOT_DIR}"

echo "[deploy] installing dependencies"
npm install

echo "[deploy] rebuilding catalog and static site"
npm run build

echo "[deploy] build complete at $(date -Iseconds)" | tee -a "${LOG_DIR}/deploy.log"
