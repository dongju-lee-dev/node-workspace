import json
import subprocess
import sys
import importlib
import aiohttp.web as web
import git
from scripts import file
from scripts.node import NodeData
from scripts.tool import ToolBase

PACKAGE_PATH = "packages"

node: dict[str, dict[str, NodeData]]  # node[node_group_name][node_name]
tool: dict[str, ToolBase]  # tool[index]


def init():
    """package init"""

    if not file.existe_directory(PACKAGE_PATH):
        print("??? where packages folder ???")

    global node
    global tool

    node = {}
    tool = {}

    for package_name in file.list_directory(PACKAGE_PATH):
        start = json.loads(file.read_file(f"{PACKAGE_PATH}/{package_name}/start.json"))

        for buff in start["node"]:
            set_node(
                buff["group"],
                buff["name"],
                file.read_file(f"{PACKAGE_PATH}/{package_name}/{buff['code']}"),
                file.read_file(f"{PACKAGE_PATH}/{package_name}/{buff['desgin']}"),
            )
            
        for buff in start["tool"]:
            set_tool(package_name, buff["name"], buff["path"], buff["class_name"])

    return [
        web.get("/packages", package_handle), 
        web.get("/packages/node", node_handle),
        web.get("/packages/tool", tool_handle),
    ]


def reset():
    """package reset"""

    global node
    global tool

    node = {}
    tool = {}

    for package_name in file.list_directory(PACKAGE_PATH):
        start = json.loads(file.read_file(f"{PACKAGE_PATH}/{package_name}/start.json"))

        for buff in start["Node"]:
            set_node(
                buff["group"],
                buff["name"],
                file.read_file(f"{PACKAGE_PATH}/{package_name}/{buff['code']}"),
                file.read_file(f"{PACKAGE_PATH}/{package_name}/{buff['desgin']}"),
            )
            
        for buff in start["Tool"]:
            set_tool(package_name, buff["name"], buff["path"], buff["class_name"])


def package_handle(request: web.Request):
    """
    package manipulation

    Adding packages is done via git clone and is only available for public use.
    """

    command = request.query.get("command")

    if command == "list":
        return package_list()
    elif command == "add":
        return package_add(request.query.get("url"))
    elif command == "remove":
        return package_remove(request.query.get("name"))
    else:
        return web.Response(text=f"error : {command} is not a valid command.")


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

    return web.Response(text=text)


def package_add(url:str):
    path = f"{PACKAGE_PATH}/__temp__"

    if file.existe_directory(path):
        file.delete_directory(path)

    try:
        file.create_directory(path)

        git.Repo.clone_from(url, file.get_absolute_path(path))

        setup = json.loads(file.read_file(f"{path}/setup.json"))

        for package_name in setup["package"]:
            subprocess.run(
                [sys.executable, "-m", "pip", "install", package_name],
                capture_output=True,
                text=True,
                check=True,
            )

        file.rename_directory(path, f"{PACKAGE_PATH}/{setup['name']}")
        file.delete_directory(path)

        reset()

        return web.Response(text="reset")
    
    except Exception as e:
        return web.Response(text=str(e))


def package_remove(name:str):
    file.delete_directory(f"{PACKAGE_PATH}/{name}")

    reset()

    return web.Response(text="reset")


def node_handle(request: web.Request):
    """
    all_node_key has the format node_group:node_name,node_name/...
    node_code returns the code of the node.
    node_code returns the desgin of the node.
    """

    command = request.query.get("command")

    if command == "all_node_key":
        return all_node_key()
    elif command == "node_code":
        name = request.query.get("name").split(".")
        return web.Response(text=str(get_node(name[0], name[1]).code))

    elif command == "node_design":
        name = request.query.get("name").split(".")
        return web.Response(text=str(get_node(name[0], name[1]).design))

    else:
        return web.Response(text=f"error : {command} is not a valid command.")


def all_node_key():
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

    return web.Response(text=text)


def get_node_group(node_group_name: str):
    """Returns lits[NodeData]"""

    global node

    return node.get(node_group_name)


def get_node(node_group_name: str, node_name: str):
    """Return NodeData"""
    
    global node

    buff = node.get(node_group_name)
    if buff != None:
        return buff[node_name]

    return None


def set_node(node_group_name: str, node_name: str, node_code: str, node_desgin: str):
    """Node group name and node name node code, design value are required."""

    global node

    if node.get(node_group_name) == None:
        node[node_group_name] = {node_name:NodeData(node_code, node_desgin)}
    else:
        node[node_group_name][node_name] = NodeData(node_code, node_desgin)


async def tool_handle(request: web.Request):
    """
    list returns the names of all tools you currently have. use command=list
    When loading tools from the web, use command=load.
    When unloading tools from the web, use command=unload.
    """

    command = request.query.get("command")
    
    if command == "list":
        return tool_list()
    elif command == "load":
        return tool[request.query.get("name")].load(request)
    elif command == "unload":
        return tool[request.query.get("name")].unload(request)
    elif command == "work":
        return tool[request.query.get("name")].work(request)
    else:
        return web.Response(text=f"error : {command} is not a valid command.")


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
                
    return web.Response(text=text)


def get_tool(tool_name:str):
    """Return ToolBase"""


    global tool
    
    return tool[tool_name]


def set_tool(package_name:str, tool_name:str, tool_path:str, tool_class_name:str):
    """The function to add a tool requires the name of the package tool class, the tool name, and the location of the tool file."""

    global tool
    
    tool[tool_name] = getattr(importlib.import_module(tool_name, file.get_absolute_path(f"{PACKAGE_PATH}/{package_name}/{tool_path}")), tool_class_name)()