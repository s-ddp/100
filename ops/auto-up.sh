#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")"/.. && pwd)"
SERVICE_NAME="ticketing-compose.service"
SERVICE_PATH="/etc/systemd/system/${SERVICE_NAME}"

# When invoked by the systemd unit, skip attempting to reinstall/restart the same unit.
AUTO_UP_IN_SERVICE="${AUTO_UP_IN_SERVICE:-0}"

start_local_stack() {
  echo "[auto-up] Using local npm start fallback (docker unavailable)." >&2
  bash "${ROOT_DIR}/ops/start-local.sh"
}

start_with_docker_compose() {
  if command -v systemctl >/dev/null 2>&1 && command -v sudo >/dev/null 2>&1 && [[ "$AUTO_UP_IN_SERVICE" != "1" ]]; then
    if ! systemctl list-unit-files | grep -q "^${SERVICE_NAME}\\.service"; then
      echo "[auto-up] Installing systemd service to auto-start the stack via docker compose..."
      "${ROOT_DIR}/ops/systemd/install-autostart.sh"
    else
      echo "[auto-up] Restarting existing ${SERVICE_NAME} to ensure stack is running..."
      sudo systemctl restart "${SERVICE_NAME}"
    fi
    return 0
  fi

  echo "[auto-up] Starting docker compose stack directly..."
  if ( cd "${ROOT_DIR}" && docker compose up -d --build ); then
    return 0
  fi

  echo "[auto-up] docker compose failed; falling back to npm start." >&2
  return 1
}

if command -v docker >/dev/null 2>&1; then
  if start_with_docker_compose; then
    exit 0
  fi
else
  echo "[auto-up] docker is not installed; using npm fallback." >&2
fi

start_local_stack
