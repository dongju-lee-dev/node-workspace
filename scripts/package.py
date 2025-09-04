import configparser
import subprocess
import sys
import git
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
        web.get("/packages", package_handle),
        web.get("/packages/node", node_handle),
        web.get("/packages/tool", tool_handle),
        web.get("/packages/assets/{tail:.*}", asset_handle),
    ]


def package_handle(request: web.Request):
    """
    package manipulation

    Adding packages is done via git clone and is only available for public use.
    """

    command = request.query.get("command")
    result = ""

    if command == "list":
        result = package_list()
    elif command == "add":
        result = package_add(request.query.get("url"))
    elif command == "remove":
        result = package_remove(request.query.get("name"))
    else:
        result = f"error : {command} is not a valid command."

    return web.Response(text=result)


def package_list():
    list = file.list_directory(PACKAGE_PATH)
    list_len = len(list)
    text = ""

    for name in list:
        list_len -= 1
        if list_len != 0:
            text += f"{name},"
        else:
            text += f"{name}"

    return text


def package_add(url: str):
    path = f"{PACKAGE_PATH}/__temp__"

    if file.existe_directory(path):
        file.delete_directory(path)

    try:
        file.create_directory(path)

        git.Repo.clone_from(url, file.get_absolute_path(path))

        config = configparser.ConfigParser()
        config.read(f"{path}/config.ini", encoding="utf-8")

        for package_name in config["packages"].split(","):
            subprocess.run(
                [sys.executable, "-m", "pip", "install", package_name],
                capture_output=True,
                text=True,
                check=True,
            )

        file.rename_directory(path, f"{PACKAGE_PATH}/{config['name']}")
        file.delete_directory(path)

        return "reset"

    except Exception as e:
        return str(e)


def package_remove(name: str):
    file.delete_directory(f"{PACKAGE_PATH}/{name}")

    return "reset"


def node_handle(request: web.Request):
    """
    all_node_key has the format node_group:node_name,node_name/...
    node_code returns the code of the node.
    node_code returns the desgin of the node.
    """

    command = request.query.get("command")
    result = ""

    if command == "list":
        result = node_list()
    else:
        result = f"error : {command} is not a valid command."

    return web.Response(text=result)


def node_list():
    global node

    text = ""
    n_g_number = len(node)

    for key in node:
        text += f"{key}."
        n_l_number = len(node[key])

        for key_key in node[key]:
            n_l_number -= 1
            if n_l_number != 0:
                text += f"{key_key},"
            else:
                text += f"{key_key}"

        n_g_number -= 1
        if n_g_number != 0:
            text += "/"

    return text


def get_node(node_group_name: str, node_name: str):
    """Return NodeData"""

    global node

    buff = node.get(node_group_name)
    if buff != None:
        return buff[node_name]

    return None


async def tool_handle(request: web.Request):
    """
    list returns the names of all tools you currently have. use command=list
    When loading tools from the web, use command=load. use name=(tool name).
    When unloading tools from the web, use command=unload. use name=(tool name).
    """

    command = request.query.get("command")
    result = ""

    if command == "list":
        result = tool_list()
    elif command == "load":
        return tool[request.query.get("name")].load(request)
    elif command == "unload":
        return tool[request.query.get("name")].unload(request)
    elif command == "work":
        return tool[request.query.get("name")].work(request)
    else:
        result = f"error : {command} is not a valid command."

    return web.Response(text=result)


def tool_list():
    global tool

    text = ""
    number = len(tool)

    for name in tool:
        number -= 1
        if number != 0:
            text += f"{name},"
        else:
            text += f"{name}"

    return text


def get_tool(tool_name: str):
    """Return ToolBase"""

    global tool

    return tool[tool_name]


def asset_handle(request: web.Request):
    return web.FileResponse(f"packages/{request.path[16:]}")
