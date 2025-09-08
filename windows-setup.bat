MKDIR "save"
MKDIR "save/workspaces"

python -m venv .venv

CALL .venv\Scripts\activate.bat

pip install aiohttp
pip install gitpython
pip install toml
pip install PyYAML

CALL deactivate