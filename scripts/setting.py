"""
Provides a settings function

If you add settings to a package and then delete the package and reinstall the package,
the settings will remain unless you directly delete the settings information.
"""

import toml
from aiohttp import web

_setting: dict


def init():
    return [
        web.get("/setting", handle),
    ]


def handle(request: web.Request):
    command = request.query.get("command")
    text = ""

    if command == "get":
        text = str(get(request.query.get("key")))
    elif command == "set":
        set(request.query.get("key"), request.query.get("value"))
    elif command == "add":
        add(request.query.get("key"), request.query.get("value"))
    elif command == "remove":
        remove(request.query.get("key"))
    elif command == "existe":
        existe(request.query.get("key"))
    else:
        text = f"error : {command} is not a valid command."

    return web.Response(text=text)


def read():
    """setting file read"""

    global _setting

    _setting = toml.load("settings/setting.toml")


def write():
    """setting file write"""

    global _setting

    toml.dump(_setting, open("settings/setting.toml", "w"))


def get(key: str):
    """Get setting value"""

    global _setting

    return _setting.get(key)


def set(key: str, value: any):
    """Set setting value"""

    global _setting

    _setting[key] = value


def add(key: str, data: any):
    """Add settings"""

    global _setting

    _setting[key] = data


def remove(key: str):
    """Remove settings"""

    global _setting

    del _setting[key]


def existe(key: str):
    """Check settngs"""

    return key in _setting
