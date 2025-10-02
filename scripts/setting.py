"""
Provides a settings function

If you add settings to a package and then delete the package and reinstall the package,
the settings will remain unless you directly delete the settings information.
"""

import file
import toml
import json
from aiohttp import web

SETTING_FILE_PATH = "/settings/setting.toml"

setting: dict


def init():
    return [
        web.get("/setting", get_handle),
        web.post("/setting", post_handle),
        web.put("/setting", put_handle),
        web.patch("/setting", patch_handle),
        web.delete("/setting", delete_handle),
    ]


def read():
    global setting

    setting = toml.loads(file.read_file(SETTING_FILE_PATH))


def write():
    global setting

    file.write_file(SETTING_FILE_PATH, toml.dumps(setting))


async def get_handle(request: web.Request):
    global setting

    key = request.query.get("key")

    if key == "_all":
        return web.json_response(setting)
    elif key == "_all_key":
        return web.json_response(list(setting.keys()))
    elif key == "_all_value":
        return web.json_response(list(setting.values()))
    else:
        return web.json_response(setting[key])


async def post_handle(request: web.Request):
    global setting

    try:
        data = await request.json()

    except Exception as e:
        return web.Response(status=400, text=str(e))

    if "key" not in data:
        return web.Response(status=400, text="net key")

    if "value" in data:
        setting[data["key"]] = json.loads(data["value"])
    else:
        setting[data["key"]] = None

    return web.Response(status=200)


async def put_handle(request: web.Request):
    global setting

    try:
        data = await request.json()

    except Exception as e:
        return web.Response(status=400, text=str(e))

    if "key" not in data:
        return web.Response(status=400, text="net key")

    if "value" not in data:
        return web.Response(status=400, text="net value")

    setting[data.get("key")] = json.loads(data.get("value"))

    return web.Response(status=200)


async def patch_handle(request: web.Request):
    global setting

    try:
        data = await request.json()

    except Exception as e:
        return web.Response(status=400, text=str(e))

    if "key" not in data:
        return web.Response(status=400, text="net key")

    if "value" not in data:
        return web.Response(status=400, text="net value")

    setting[data.get("key")] = json.loads(data.get("value"))

    return web.Response(status=200)


async def delete_handle(request: web.Request):
    global setting

    key = request.query.get("key")

    if key in setting:
        del setting[key]
        return web.Response(status=200)

    else:
        return web.Response(status=400, text="Key value is invalid")


def create(key):
    global setting

    setting[key] = None


def delete(key):
    global setting

    del setting[key]


def get(key):
    global setting

    return setting[key]


def set(key, value):
    global setting

    setting[key] = value
