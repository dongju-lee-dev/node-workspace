"""
It was created to run in setup and install the pip package of the package.

When you use it when you move a package locally to PACKAGE_PATH, it automatically installs the package's pip package.
"""

import os
import subprocess
import sys
import toml

sys.path.append(os.getcwd())

from scripts import file
from scripts import package

for package_name in file.list_directory(package.PACKAGE_PATH):
    config = toml.loads(
        file.read_file(f"{package.PACKAGE_PATH}/{package_name}/config.toml")
    )

    if config["packages"] == "":
        continue

    for package_name in config["packages"].split(","):
        subprocess.run(
            [sys.executable, "-m", "uv", "pip", "install", package_name],
            capture_output=True,
            text=True,
            check=True,
        )
