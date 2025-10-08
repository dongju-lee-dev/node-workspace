import file
import toml
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
    """read setting file"""

    global setting

    setting = toml.loads(file.read_file(SETTING_FILE_PATH))


def write():
    """write setting file"""

    global setting

    file.write_file(SETTING_FILE_PATH, toml.dumps(setting))


async def get_handle(request: web.Request):
    """
    Returns the setting value that is the value of key.
    If the key value is _all, all configuration data is returned.
    If the key value is _all_key, the key value of all settings are returned.
    If the key value is _all_value, the values of all settings are returned.
    """

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
    """
    It takes a key argument and creates a configuration space corresponding to the key value. You can initialize the space by adding a value.
    """

    global setting

    try:
        data = await request.json()

    except Exception as e:
        return web.Response(status=400, text=str(e))

    if "key" not in data:
        return web.Response(status=400, text="net key")

    if "value" in data:
        setting[data["key"]] = data["value"]
    else:
        setting[data["key"]] = None

    return web.Response(status=200)


async def put_handle(request: web.Request):
    """
    Receive key and value values and modify the settings.
    """

    global setting

    try:
        data = await request.json()

    except Exception as e:
        return web.Response(status=400, text=str(e))

    if "key" not in data:
        return web.Response(status=400, text="net key")

    if "value" not in data:
        return web.Response(status=400, text="net value")

    setting[data.get("key")] = data.get("value")

    return web.Response(status=200)


async def patch_handle(request: web.Request):
    """
    Receive key and value values and modify the settings.
    """

    global setting

    try:
        data = await request.json()

    except Exception as e:
        return web.Response(status=400, text=str(e))

    if "key" not in data:
        return web.Response(status=400, text="net key")

    if "value" not in data:
        return web.Response(status=400, text="net value")

    setting[data.get("key")] = data.get("value")

    return web.Response(status=200)


async def delete_handle(request: web.Request):
    """
    Delete the key value setting.
    """

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


def existe(key):
    global setting

    return key in setting


def get(key):
    global setting

    return setting[key]


def set(key, value):
    global setting

    setting[key] = value
