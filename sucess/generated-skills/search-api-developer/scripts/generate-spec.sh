#!/usr/bin/env bash
set -euo pipefail

python3 "${SKILL_ROOT}/scripts/hit_factory.py" "$@" --format=json
