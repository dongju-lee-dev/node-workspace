import json
import subprocess
import sys
import git
import toml
import inspect
import importlib
from aiohttp import web
from scripts import file
from scripts.node import NodeData
from scripts.tool import ToolBase

PACKAGE_PATH = "packages"

node: dict[str, dict[str, NodeData]]  # node[node_group_name][node_name]
tool: dict[str, ToolBase]  # tool[tool_name]


def init():
    """package init"""

    if not file.existe_directory(PACKAGE_PATH):
        print("??? where packages folder ???")

    global node
    global tool

    node = {}
    tool = {}

    for package_name in file.list_directory(PACKAGE_PATH):

        if file.existe_directory(f"{PACKAGE_PATH}/{package_name}/nodes"):
            for path in file.list_directory(f"{PACKAGE_PATH}/{package_name}/nodes"):
                module = importlib.import_module(
                    f"{PACKAGE_PATH}.{package_name}.nodes.{path[:-3]}"
                )

                for name, member in inspect.getmembers(module):
                    if inspect.isfunction(member):
                        var_name = f"{member.__name__}_META".upper()

                        if hasattr(module, var_name):
                            meta = getattr(module, var_name)

                            if meta["node_group"] not in node:
                                node[meta["node_group"]] = {}

                            node[meta["node_group"]][meta["node_name"]] = NodeData(
                                member, meta
                            )

        if file.existe_directory(f"{PACKAGE_PATH}/{package_name}/tools"):
            for path in file.list_directory(f"{PACKAGE_PATH}/{package_name}/tools"):
                module = importlib.import_module(
                    f"{PACKAGE_PATH}.{package_name}.tools.{path[:-3]}"
                )

                for name, member in inspect.getmembers(module):
                    if inspect.isclass(member):
                        var_name = f"{member.__name__}_META".upper()

                        if hasattr(module, var_name):
                            meta = getattr(module, var_name)
                            tool[meta["tool_name"]] = member(meta)

    return [
        web.get("/packages", package_get_handle),
        web.post("/packages", package_post_handle),
        web.delete("/packages", package_delete_handle),
        web.get("/packages/node", node_get_handle),
        web.get("/packages/tool", tool_get_handle),
        web.post("/packages/tool", tool_post_handle),
        web.get("/packages/assets/{tail:.*}", asset_handle),
    ]


async def package_get_handle(request: web.Request):
    return web.json_response(file.list_directory(PACKAGE_PATH))


async def package_post_handle(request: web.Request):
    path = f"{PACKAGE_PATH}/__temp__"

    try:
        data = await request.json()

        if file.existe_directory(path):
            file.delete_directory(path)

        file.create_directory(path)

        git.Repo.clone_from(data["url"], file.get_absolute_path(path))

        config = toml.loads(file.read_file(f"{path}/config.toml"))

        package_name = config["name"]
        
        if config["packages"] != "":
            for package_name in config["packages"].split(","):
                subprocess.run(
                    [sys.executable, "-m", "uv", "pip", "install", package_name],
                    capture_output=True,
                    text=True,
                    check=True,
                )

        file.rename_directory(path, f"{PACKAGE_PATH}/{package_name}")

        if file.existe_directory(f"{PACKAGE_PATH}/{package_name}/nodes"):
            for path in file.list_directory(f"{PACKAGE_PATH}/{package_name}/nodes"):
                module = importlib.import_module(
                    f"{PACKAGE_PATH}.{package_name}.nodes.{path[:-3]}"
                )

                for name, member in inspect.getmembers(module):
                    if inspect.isfunction(member):
                        var_name = f"{member.__name__}_META".upper()

                        if hasattr(module, var_name):
                            meta = getattr(module, var_name)

                            if meta["node_group"] not in node:
                                node[meta["node_group"]] = {}

                            node[meta["node_group"]][meta["node_name"]] = NodeData(
                                member, meta
                            )

        if file.existe_directory(f"{PACKAGE_PATH}/{package_name}/tools"):
            for path in file.list_directory(f"{PACKAGE_PATH}/{package_name}/tools"):
                module = importlib.import_module(
                    f"{PACKAGE_PATH}.{package_name}.tools.{path[:-3]}"
                )

                for name, member in inspect.getmembers(module):
                    if inspect.isclass(member):
                        var_name = f"{member.__name__}_META".upper()

                        if hasattr(module, var_name):
                            meta = getattr(module, var_name)
                            tool[meta["tool_name"]] = member(meta)

        return web.Response(status=200)

    except Exception as e:
        return web.Response(status=400, text=str(e))


async def package_delete_handle(request: web.Request):
    try:
        name = request.query.get("name")

        file.delete_directory(f"{PACKAGE_PATH}/{name}")

        return web.Response(status=200)

    except Exception as e:
        return web.Response(status=400, text=str(e))


async def node_get_handle(request: web.Request):
    global node

    try:
        group = request.query.get("group")
        name = request.query.get("name")

        if group == "_all_key":
            buff = {}

            for k in node.keys():
                buff[k] = list(node[k].keys())

            return web.json_response(buff)

        else:
            return web.json_response(get_node(group, name).meta)

    except Exception as e:
        return web.Response(status=200, text=str(e))


def get_node(node_group: str, node_name: str):
    """Return NodeData"""

    global node

    buff = node.get(node_group)
    if buff != None:
        return buff[node_name]

    return None


async def tool_get_handle(request: web.Request):
    global tool

    try:
        key = request.query.get("key")

        if key == "_all_key":
            return web.json_response(list(tool.keys()))

        else:
            return web.Response(status=200, text="???")

    except Exception as e:
        return web.Response(status=400, text=str(e))


async def tool_post_handle(request: web.Request):
    global tool

    try:
        data = await request.json()

        command = data["command"]
        key = data["key"]

        if command == "load":
            return tool[key].load(request)
        elif command == "unload":
            return tool[key].unload(request)
        elif command == "work":
            return tool[key].work(request)
        else:
            return web.Response(status=400, text="The work value is incorrect.")

    except Exception as e:
        return web.Response(status=400, text=str(e))


def get_tool(tool_name: str):
    """Return ToolBase"""

    global tool

    return tool[tool_name]


def asset_handle(request: web.Request):
    return web.FileResponse(f"packages/{request.path[16:]}")
