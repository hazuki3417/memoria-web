#!/usr/bin/env bash
set -euo pipefail

# Run VRT only within the same pinned Playwright OS/browser environment.
# Do not silently generate baselines with an incompatible Node/Playwright.
command -v docker >/dev/null 2>&1 || { echo "Docker is required." >&2; exit 1; }
case "${1:-}" in
  compare) task="test:visual" ;;
  update) task="test:visual:update" ;;
  *)
    echo "Usage: bash scripts/test-visual-docker.sh {compare|update}" >&2
    exit 2
    ;;
esac

project_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
image="${MEMORIA_VRT_IMAGE:-mcr.microsoft.com/playwright:v1.62.1-noble}"
echo "VRT image: ${image}"
echo "VRT task: ${task}"
docker run --rm --init --ipc=host \
  --user "$(id -u):$(id -g)" \
  --volume "${project_dir}:/workspace" \
  --workdir /workspace \
  --env HOME=/tmp \
  --env CI=1 \
  "${image}" \
  bash -euc '
    node -e '\''const major = Number(process.versions.node.split(".")[0]); if (major !== 24) { console.error("VRT requires Node.js 24; image provides " + process.version); process.exit(1) }'\''
    node -e '\''const lock = require("./package-lock.json"); const version = lock.packages["node_modules/playwright"].version; if (version !== "1.62.1") { console.error("Expected Playwright 1.62.1, found " + version); process.exit(1) }'\''
    npm ci
    npm run "$1"
  ' bash "${task}"
