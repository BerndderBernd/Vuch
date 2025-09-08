#!/usr/bin/env bash
set -euo pipefail
cd /workspace/frontend
npm install
exec npm run dev -- --host --port 5173
