CALL .venv\Scripts\activate.bat

python -X pycache_prefix=__pycache__ scripts/main.py

CALL deactivate