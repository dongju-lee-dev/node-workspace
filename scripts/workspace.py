import struct
import time
from aiohttp import web
import yaml
import json
from scripts import file
from scripts import package
from scripts import setting
from scripts.node import NodeData
from dataclasses import dataclass

WORKSPACE_PATH = "save/workspace"


class NodePortAddress:
    id: int
    port: int

    def __init__(self):
        self.id = None
        self.port = None

    def __eq__(self, other):
        if isinstance(other, NodePortAddress):
            return self.id == other.id and self.port == other.port
        return False


@dataclass
class Node:
    data: NodeData
    input: list[NodePortAddress]
    output: list[list[NodePortAddress]]
    output_buff: list[any]
    position_x: float
    position_y: float
    content: str


node: dict[int, Node] = {}
memory: dict[str, any] = {}


def init():
    if not file.existe_directory(WORKSPACE_PATH):
        file.create_directory(WORKSPACE_PATH)

    if not setting.existe("externalSaveWorkspacePath"):
        setting.add("externalSaveWorkspacePath", [])

    if not setting.existe("lastOpenWorkspaceName"):
        setting.set("lastOpenWorkspaceName", "")

    return [
        web.get("/workspace", workspace_handle),
        web.get("/workspace/editor", editor_handle),
        web.get("/workspace/runtime", runtime_handle),
    ]


async def workspace_handle(request: web.Request):
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
    result = ""

    if command == "list":
        result = workspace_list_to_str()
    elif command == "new":
        result = workspace_new(request.query.get("name"))
    elif command == "delete":
        result = workspace_delete(request.query.get("name"))
    elif command == "load":
        result = workspace_load(request.query.get("name"))
    elif command == "unload":
        result = workspace_unload()
    elif command == "save":
        result = workspace_save(request.query.get("name"))
    elif command == "rename":
        result = workspace_rename(
            request.query.get("old_name"), request.query.get("new_name")
        )
    elif command == "lastOpen":
        result = setting.get("lastOpenWorkspaceName")
    else:
        result = f"error : {command} is not a valid command."

    return web.Response(text=result)


def workspace_list_to_str():
    return ",".join(file.list_directory(WORKSPACE_PATH))


def workspace_new(name: str):
    path = f"{WORKSPACE_PATH}/{name}"

    if file.existe_directory(path):
        path = None
        return "error : There is already a workspace with the same name"

    file.create_directory(path)
    file.create_file(f"{path}/space.nww")
    file.write_file(f"{path}/space.nww", yaml.dump(node, sort_keys=False))

    return ""


def workspace_delete(name: str):
    path = f"{WORKSPACE_PATH}/{name}"

    try:
        file.delete_all_directory(path)
        return ""

    except Exception as e:
        return str(e)


def workspace_load(name: str):
    try:
        global node
        global memory

        node = yaml.safe_load(file.read_file(f"{WORKSPACE_PATH}/{name}/space.nww"))
        memory.clear()

        return json.dumps(node)

    except Exception as e:
        return str(e)


def workspace_unload():
    try:
        global node
        global memory

        node.clear()
        memory.clear()

        return ""

    except Exception as e:
        return str(e)


def workspace_save(name: str):
    try:
        global node

        file.write_file(
            f"{WORKSPACE_PATH}/{name}/space.nww", yaml.dump(node, sort_keys=False)
        )

        return ""

    except Exception as e:
        return str(e)


def workspace_rename(old_name: str, new_name: str):
    return file.rename_directory(
        f"{WORKSPACE_PATH}/{old_name}", f"{WORKSPACE_PATH}/{new_name}"
    )


async def editor_handle(request: web.Request):
    command = request.query.get("command")
    result = ""

    if command == "create":
        result = editor_create(
            request.query.get("node_group"),
            request.query.get("node_name"),
            request.query.get("position_x"),
            request.query.get("position_y"),
        )
    elif command == "delete":
        result = editor_delete(
            request.query.get("id"),
        )
    elif command == "movement":
        result = editor_movement(
            request.query.get("id"),
            request.query.get("position_x"),
            request.query.get("position_y"),
        )
    elif command == "content":
        result = editor_content(
            request.query.get("id"),
            request.query.get("content"),
        )
    elif command == "link":
        result = editor_link(
            request.query.get("id_o"),
            request.query.get("port_o"),
            request.query.get("id_i"),
            request.query.get("port_i"),
        )
    elif command == "unlink":
        result = editor_unlink(
            request.query.get("id_o"),
            request.query.get("port_o"),
            request.query.get("id_i"),
            request.query.get("port_i"),
        )
    else:
        result = f"error : {command} is not a valid command."

    return web.Response(text=result)


def editor_create(node_group, node_name, position_x, position_y):
    global node

    try:
        id = 0

        for i in node.keys():
            if id != i:
                break

            id += 1

        n_b = package.get_node(node_group, node_name)
        i_b = [NodePortAddress() for _ in range(len(n_b.meta["input"]))]
        o_b = [[] for _ in range(len(n_b.meta["output"]))]
        o_b_b = [None for _ in range(len(n_b.meta["output"]))]

        node[id] = Node(
            n_b,
            i_b,
            o_b,
            o_b_b,
            float(position_x),
            float(position_y),
            "",
        )

        return f"status=success&id={id}"

    except Exception as e:
        return f"status=error&message={str(e)}"


def editor_delete(id):
    global node

    id = int(id)

    for ipa in node[id].input:
        if ipa.id == None:
            break

        for opa in node[ipa.id].output[ipa.port]:
            if opa.id == ipa.id:
                node[ipa.id].output[ipa.port].remove(opa)
                break

    for opal in node[id].output:
        for opa in opal:
            node[opa.id].input[opa.port].id = None
            node[opa.id].input[opa.port].port = None

    del node[id]

    return "status=success"


def editor_movement(id, position_x, position_y):
    try:
        id = int(id)

        node[id].position_x = float(position_x)
        node[id].position_y = float(position_y)

        return "status=success"

    except Exception as e:
        return f"status=error&message={str(e)}"


def editor_content(id, content):
    global node

    try:
        id = int(id)

        node[id].content = content

        return "status=success"

    except Exception as e:
        return f"status=error&message={str(e)}"


def editor_link(id_o, port_o, id_i, port_i):
    global node

    try:
        id_o = int(id_o)
        port_o = int(port_o)
        id_i = int(id_i)
        port_i = int(port_i)

        pa = NodePortAddress()
        pa.id = id_i
        pa.port = port_i

        node[id_o].output[port_o].append(pa)

        node[id_i].input[port_i].id = id_o
        node[id_i].input[port_i].port = port_o

        return "status=success"

    except Exception as e:
        return f"status=error&message={str(e)}"


def editor_unlink(id_o, port_o, id_i, port_i):
    global node

    try:
        id_o = int(id_o)
        port_o = int(port_o)
        id_i = int(id_i)
        port_i = int(port_i)

        pa = NodePortAddress()
        pa.id = id_i
        pa.port = port_i

        node[id_o].output[port_o].remove(pa)

        node[id_i].input[port_i].id = None
        node[id_i].input[port_i].port = None

        return "status=success"

    except Exception as e:
        return f"status=error&message={str(e)}"


async def runtime_handle(request: web.Request):
    ws = web.WebSocketResponse()

    global node

    try:
        await ws.prepare()

        full_start = time.time()

        node_network = runtime_node_network(request.query.get("select_id"))
        node_layer = runtime_node_layer(node_network)

        ncw = dict.fromkeys(node_network, bytearray)

        node_start = time.time()

        for nd in node_layer:
            for k in nd:
                await runtime_node_play(nd[k], k, node_layer, ws, ncw[k])

        node_end = time.time()

        runtime_content_write(ncw, ws)

        full_end = time.time()

        print(f"full time: {full_end - full_start}, node time: {node_end - node_start}")

        await ws.close()

    except Exception as e:
        await ws.close()

        print(str(e))

    return ws


def runtime_node_network(center_ID):
    global node

    nn: dict[int, Node] = {}
    nn[center_ID] = node[center_ID]

    for pa in node[center_ID].input:
        runtime_node_network_chain(nn, pa)

    for pal in node[center_ID].output:
        for pa in pal:
            runtime_node_network_chain(nn, pa)

    return nn


def runtime_node_network_chain(nn: dict[int, Node], pa: NodePortAddress):
    global node

    if pa.id in nn:
        return

    nn[pa.id] = node[pa.id]

    for pa in node[pa.id].input:
        runtime_node_network_chain(nn, pa)

    for pal in node[pa.id].output:
        for pa in pal:
            runtime_node_network_chain(nn, pa)


def runtime_node_layer(nn: dict[int, Node]):
    nl: list[dict[int, Node]] = []
    nl.append({})

    for k in nn:
        if len(nn[k].output) == 0:
            nl[0][k] = nn[k]

    for k in nl[0]:
        for pal in nl[0][k].output:
            for pa in pal:
                runtime_node_layer_down(nn, nl, pa, 1)

    layer = len(nl)

    for nlr in reversed(nl):
        layer -= 1

        for nk in nlr:
            for nlrb in reversed(nl[:layer]):
                if nk in nlrb:
                    del nlrb[nk]

    return nl


def runtime_node_layer_down(
    nn: dict[int, Node], nl: list[dict[int, Node]], pa: NodePortAddress, i: int
):
    if len(nl) <= i:
        nl.append({})

    nl[i][pa.id] = nn[pa.id]

    i += 1

    for pal in nn[pa.id].output:
        for pa in pal:
            runtime_node_layer_down(nn, nl, pa, i)


async def runtime_content_write(nc: dict[int, bytearray], ws: web.WebSocketResponse):
    global node

    buffer = bytearray()

    for k in nc:
        if buffer:
            buffer.extend(b",")

        buffer.extend(struct.pack(">I", k) + struct.pack(">I", len(nc[k])) + nc[k])
        node[k].content = bytes(nc[k])

    await ws.send_bytes(buffer)


async def runtime_node_play(
    node: Node,
    id: int,
    nn: dict[int, Node],
    ws: web.WebSocketResponse,
    ncw: bytearray,
):
    global memory

    try:
        age = []

        for pa in node.input:
            age.append(nn[pa.id].output_buff[pa.port])

        if "system_access" in node.data.meta:
            keys = {}
            keys["_memory"] = memory
            keys["_content_read"] = node.content
            keys["_content_write"] = ncw

            await node.data.function(*age, **keys)
        else:
            await node.data.function(*age)

        ws.send_str(f"status=success&id={id}")
        return True

    except Exception as e:
        ws.send_str(f"status=error&id={id}error={str(e)}")
        return False
