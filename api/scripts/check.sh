#!/usr/bin/env bash
# Every quality gate of the API, failing on the first error.
set -euo pipefail
cd "$(dirname "$0")/.."
.venv/bin/ruff check .
.venv/bin/ruff format --check .
.venv/bin/mypy app seeds
.venv/bin/pytest -p no:warnings "$@"
