clear

MKDIR "save"
MKDIR "save/workspace"

uv sync

$env:PYTHONPYCACHEPREFIX="__pycache__";
uv run scripts/setup.py