#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")"/.. && pwd)"
LOG_DIR="${ROOT_DIR}/ops/logs"
API_PID_FILE="${LOG_DIR}/api.pid"
WEB_PID_FILE="${LOG_DIR}/web.pid"

mkdir -p "${LOG_DIR}"

ensure_node() {
  if command -v npm >/dev/null 2>&1 && command -v node >/dev/null 2>&1; then
    return
  fi

  local node_version="20.18.0"
  local arch="$(uname -m)"
  local platform="linux-x64"
  case "$arch" in
    x86_64|amd64) platform="linux-x64" ;;
    aarch64|arm64) platform="linux-arm64" ;;
    *)
      echo "[start-local] Unsupported architecture: $arch" >&2
      exit 1
      ;;
  esac

  local install_dir="${HOME}/.local/nodejs"
  local target_dir="${install_dir}/node-v${node_version}-${platform}"
  local tarball="node-v${node_version}-${platform}.tar.xz"
  local cache_dir="${ROOT_DIR}/ops/cache"
  local local_tar="${cache_dir}/${tarball}"

  mkdir -p "$install_dir" "$cache_dir"

  download_node() {
    local dest="$1"
    shift
    for url in "$@"; do
      echo "[start-local] Trying Node.js download from $url" >&2
      if command -v curl >/dev/null 2>&1 && curl -fSL "$url" -o "$dest"; then
        echo "[start-local] Downloaded Node.js tarball from $url" >&2
        return 0
      fi
    done
    return 1
  }

  if [[ ! -x "${target_dir}/bin/node" ]]; then
    local tmp_tar="/tmp/${tarball}"

    if [[ -f "$local_tar" ]]; then
      echo "[start-local] Using cached Node.js tarball at ${local_tar}" >&2
      cp "$local_tar" "$tmp_tar"
    else
      echo "[start-local] npm/node not found; attempting portable Node.js ${node_version} (${platform}) download..." >&2
      if ! download_node "$tmp_tar" \
        "${NODE_MIRROR_PRIMARY:-https://nodejs.org/dist/v${node_version}/${tarball}}" \
        "${NODE_MIRROR_FALLBACK:-https://unofficial-builds.nodejs.org/download/release/v${node_version}/${tarball}}"; then
        echo "[start-local] Failed to download Node.js (proxy/offline?). Place ${tarball} in ${cache_dir} and rerun." >&2
        return 1
      fi
      cp "$tmp_tar" "$local_tar" || true
    fi

    mkdir -p "$target_dir"
    tar -xJf "$tmp_tar" -C "$install_dir"
    rm -f "$tmp_tar"
  fi

  ln -sfn "$target_dir" "${install_dir}/current"
  export PATH="${install_dir}/current/bin:${PATH}"
  echo "[start-local] Using Node.js from ${install_dir}/current (version $(node -v))"
}

ensure_deps() {
  if [[ ! -d "${ROOT_DIR}/services/api/node_modules" || ! -d "${ROOT_DIR}/services/web/node_modules" ]]; then
    echo "[start-local] Installing workspace dependencies..."
    ( cd "${ROOT_DIR}" && npm install --workspaces --include-workspace-root=false )
  fi
}

build_apps() {
  echo "[start-local] Building API..."
  ( cd "${ROOT_DIR}" && npm run build --workspace services/api )
  echo "[start-local] Building web..."
  ( cd "${ROOT_DIR}" && npm run build --workspace services/web )
}

start_service() {
  local name="$1"
  local cmd="$2"
  local pid_file="$3"
  local log_file="$LOG_DIR/${name}.log"

  if [[ -f "$pid_file" ]] && kill -0 "$(cat "$pid_file")" >/dev/null 2>&1; then
    echo "[start-local] $name already running (pid $(cat "$pid_file"))"
    return 0
  fi

  echo "[start-local] Starting $name..."
  nohup bash -lc "$cmd" >> "$log_file" 2>&1 &
  echo $! > "$pid_file"
}

ensure_node
ensure_deps
build_apps
start_service "api" "npm run start --workspace services/api" "$API_PID_FILE"
start_service "web" "npm run start --workspace services/web" "$WEB_PID_FILE"

echo "[start-local] API log: $LOG_DIR/api.log"
echo "[start-local] Web log: $LOG_DIR/web.log"
