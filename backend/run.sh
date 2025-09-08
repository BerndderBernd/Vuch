#!/usr/bin/env bash
set -euo pipefail
python3 -m venv /workspace/.venv || true
source /workspace/.venv/bin/activate
python -m pip install --upgrade pip
pip install -r /workspace/backend/requirements.txt
exec /workspace/.venv/bin/uvicorn app.main:app --app-dir /workspace/backend --host 0.0.0.0 --port 8000 --reload
