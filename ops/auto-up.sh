#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")"/.. && pwd)"
SERVICE_NAME="ticketing-compose.service"
SERVICE_PATH="/etc/systemd/system/${SERVICE_NAME}"

if ! command -v docker >/dev/null 2>&1; then
  echo "[auto-up] docker is not installed; skipping automatic stack start." >&2
  exit 0
fi

# If systemd is available, ensure the service is installed/enabled so containers
# come up after every reboot without any manual commands.
if command -v systemctl >/dev/null 2>&1 && command -v sudo >/dev/null 2>&1; then
  if ! systemctl list-unit-files | grep -q "^${SERVICE_NAME}\\.service"; then
    echo "[auto-up] Installing systemd service to auto-start docker compose stack..."
    "${ROOT_DIR}/ops/systemd/install-autostart.sh"
  else
    echo "[auto-up] Restarting existing ${SERVICE_NAME} to ensure stack is running..."
    sudo systemctl restart "${SERVICE_NAME}"
  fi
  exit 0
fi

# Fallback: start the stack directly for environments without systemd (e.g. Codespaces)
# so the API and web frontend are running as soon as the container starts.
( cd "${ROOT_DIR}" && docker compose up -d --build )
