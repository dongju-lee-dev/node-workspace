import json
import aiohttp.web as web
from scripts import file
from scripts import setting

WORKSPACE_PATH = "save/workspace"

path: str
code: str
space: list


def init():
    if not file.existe_directory(WORKSPACE_PATH):
        file.create_directory(WORKSPACE_PATH)

    if not setting.existe("externalSaveWorkspacePath"):
        setting.add("externalSaveWorkspacePath", [])

    if not setting.existe("lastOpenWorkspaceName"):
        setting.set("lastOpenWorkspaceName", "")

    return [
        web.get("/workspace/save", save_handle),
        web.get("/workspace/data/get", get_handle),
        web.post("/workspace/data/post", post_handle),
    ]


def save_handle(request: web.Request):
    """
    A handle that manages storage.
    Give a command with command.

    The list command returns the names of all tasks in the workspace.
    The new command creates a new workspace.
    The delete command deletes a workspace.
    The load command loads code and space files in the workspace.
    The unload command discards data from code and space variables.
    The save command saves code and spatial data.
    The rename command changes the name of a workspace.
    """

    command = request.query.get("command")

    if command == "list":
        return web.Response(text=list_to_str())
    elif command == "new":
        return web.Response(text=new(request.query.get("name")))
    elif command == "delete":
        return web.Response(text=delete(request.query.get("name")))
    elif command == "load":
        return web.Response(text=load(request.query.get("name")))
    elif command == "unload":
        return web.Response(text=unload())
    elif command == "save":
        return web.Response(text=save())
    elif command == "rename":
        return web.Response(
            text=rename(request.query.get("old_name"), request.query.get("new_name"))
        )
    elif command == "lastOpen":
        return web.Response(text=setting.get("lastOpenWorkspaceName"))
    else:
        return web.Response(text=f"error : {command} is not a valid command.")


def list_to_str():
    list = file.list_directory(WORKSPACE_PATH)
    list_len = len(list)
    buff = ""

    for value in list:
        list_len -= 1
        if list_len != 0:
            buff += f"{value},"
        else:
            buff += f"{value}"

    # 외부 저장 주소 기능 추가 해야함
    
    return buff


def new(name: str):
    global path

    path = f"{WORKSPACE_PATH}/{name}"

    if file.existe_directory(path):
        path = None
        return "error : There is already a workspace with the same name"

    file.create_directory(path)
    file.create_file(f"{path}/code.py")
    file.create_file(f"{path}/space.json")

    return ""


def delete(name: str):
    path = f"{WORKSPACE_PATH}/{name}"

    if file.existe_directory(path):
        file.delete_directory(f"{WORKSPACE_PATH}/{name}")
        return ""
    
    else:
        return "error"


def load(name: str):
    global path
    global code
    global space

    try:
        path = f"{WORKSPACE_PATH}/{name}"
        code = file.read_file(f"{path}/code.py")
        space = json.loads(file.read_file(f"{path}/space.json"))

        return ""

    except Exception as e:
        path = None
        code = None
        space = None

        return str(e)


def unload():
    global path
    global code
    global space

    path = None
    code = None
    space = None

    return ""


def save():
    global path
    global code
    global space

    try:
        file.write_file(f"{path}/code.py", code)
        file.write_file(f"{path}/space.json", json.dumps(space))
        return ""

    except Exception as e:
        return str(e)


def rename(old_name: str, new_name: str):
    return file.rename_directory(
        f"{WORKSPACE_PATH}/{old_name}", f"{WORKSPACE_PATH}/{new_name}"
    )


def get_handle(request: web.Request):
    """Sends the appropriate value according to the command."""

    command = request.query.get("command")
    
    if command == "code":
        return web.Response(text=code if code != None else "")
    elif command == "space":
        return web.Response(text=space if space != None else "")
    else:
        return web.Response(text=f"error : {command} is not a valid command.")


def post_handle(request: web.Request):
    """미완성 : 아마 작업에서의 정보를 수신할때 사용 할 것 같다"""

    return web.Response()
