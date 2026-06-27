#!/usr/bin/env bash
set -euo pipefail

# Simple rsync deploy script. Requires SSH access to target host.
# Usage:
# SSH_USER=you SSH_HOST=host.example.com REMOTE_PATH=/var/www/zanyaziz.com/zozzo ./deploy.sh

if [ -z "${SSH_USER:-}" ]; then
  echo "ERROR: SSH_USER not set"
  exit 1
fi
if [ -z "${SSH_HOST:-}" ]; then
  echo "ERROR: SSH_HOST not set"
  exit 1
fi
if [ -z "${REMOTE_PATH:-}" ]; then
  echo "ERROR: REMOTE_PATH not set"
  exit 1
fi

LOCAL_DIR=$(pwd)
echo "Deploying $LOCAL_DIR to ${SSH_USER}@${SSH_HOST}:${REMOTE_PATH}"

rsync -avz --delete --exclude='.git' --exclude='node_modules' --exclude='*.log' \
  --exclude='deploy.sh' ./ ${SSH_USER}@${SSH_HOST}:${REMOTE_PATH}

echo "Deploy complete."
