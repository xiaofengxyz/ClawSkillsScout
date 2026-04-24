#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
LOG_DIR="${ROOT_DIR}/logs"
DIST_DIR="${ROOT_DIR}/dist"
BUILD_COMMAND="${BUILD_COMMAND:-npm run build}"
DEPLOY_WEB_ROOT="${DEPLOY_WEB_ROOT:-}"

resolve_web_root() {
  if [[ -n "${DEPLOY_WEB_ROOT}" ]]; then
    printf '%s\n' "${DEPLOY_WEB_ROOT}"
    return 0
  fi

  local candidates=(
    "/var/www/flyingeye.cn/ClawSkillsScout"
    "/var/www/html/ClawSkillsScout"
    "/usr/share/nginx/html/ClawSkillsScout"
  )

  local candidate
  for candidate in "${candidates[@]}"; do
    if [[ -d "${candidate}" || -d "$(dirname "${candidate}")" ]]; then
      printf '%s\n' "${candidate}"
      return 0
    fi
  done

  return 1
}

mkdir -p "${LOG_DIR}"
cd "${ROOT_DIR}"

echo "[deploy] installing dependencies"
npm install

echo "[deploy] rebuilding catalog and static site"
eval "${BUILD_COMMAND}"

if [[ ! -d "${DIST_DIR}" ]]; then
  echo "[deploy] expected build output missing: ${DIST_DIR}" >&2
  exit 1
fi

WEB_ROOT="$(resolve_web_root || true)"
if [[ -z "${WEB_ROOT}" ]]; then
  cat >&2 <<'EOF'
[deploy] unable to resolve a publish directory for dist/.
[deploy] Set DEPLOY_WEB_ROOT to the web server's ClawSkillsScout directory and rerun.
EOF
  exit 1
fi

echo "[deploy] publishing dist/ to ${WEB_ROOT}"
mkdir -p "${WEB_ROOT}"
rsync -a --delete "${DIST_DIR}/" "${WEB_ROOT}/"

echo "[deploy] build and publish complete at $(date -Iseconds)" | tee -a "${LOG_DIR}/deploy.log"
