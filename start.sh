clear

source .venv/bin/activate

python3 -X pycache_prefix=$(pwd)/__pycache__ $(pwd)'/scripts/core/core.py'

deactivate