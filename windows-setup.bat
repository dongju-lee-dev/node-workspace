MKDIR "save"
MKDIR "save/workspaces"

python -m venv .venv

CALL .venv\Scripts\activate.bat

pip install aiohttp

CALL deactivate