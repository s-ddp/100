#!/usr/bin/env bash
set -euo pipefail

SERVICE_NAME="ticketing-compose.service"
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")"/../.. && pwd)"
SERVICE_SRC="$ROOT_DIR/ops/systemd/$SERVICE_NAME"
SERVICE_DST="/etc/systemd/system/$SERVICE_NAME"

if ! command -v sudo >/dev/null 2>&1; then
  echo "sudo is required to install the systemd unit" >&2
  exit 1
fi

if [[ ! -f "$SERVICE_SRC" ]]; then
  echo "service template missing: $SERVICE_SRC" >&2
  exit 1
fi

tmpfile=$(mktemp)
trap 'rm -f "$tmpfile"' EXIT
sed "s|__PROJECT_ROOT__|$ROOT_DIR|g" "$SERVICE_SRC" > "$tmpfile"

sudo cp "$tmpfile" "$SERVICE_DST"
sudo systemctl daemon-reload
sudo systemctl enable "$SERVICE_NAME"
sudo systemctl restart "$SERVICE_NAME"

echo "Systemd service installed and started. Stack will start automatically on boot."
