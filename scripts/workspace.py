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


class WorkSpaceSys:
    memory: dict[int, any]
    content: str

    def __init__(self, memory, content):
        self.memory = memory
        self.content = content
        

class NodePortAddress:
    id: int
    port: int

    def __init__(self, id, port):
        self.id = id
        self.port = port

    def __eq__(self, other):
        if isinstance(other, NodePortAddress):
            return self.id == other.id and self.port == other.port
        return False


class NodeSave:
    group: str
    name: str
    input: list[NodePortAddress]
    output: list[list[NodePortAddress]]
    position_x: float
    position_y: float
    content: str

    def __init__(self, group, name, input, output, position_x, position_y, content):
        self.group = group
        self.name = name
        self.input = input
        self.output = output
        self.position_x = position_x
        self.position_y = position_y
        self.content = content


class Node:
    data: NodeData
    input: list[NodePortAddress]
    output: list[list[NodePortAddress]]
    output_buff: list[any]
    position_x: float
    position_y: float
    content: str

    def __init__(
        self, data, input, output, output_buff, position_x, position_y, content
    ):
        self.data = data
        self.input = input
        self.output = output
        self.output_buff = output_buff
        self.position_x = position_x
        self.position_y = position_y
        self.content = content


node: dict[int, Node] = {}
memory: dict[str, any] = {}
path: str = None


def init():
    if not file.existe_directory(WORKSPACE_PATH):
        file.create_directory(WORKSPACE_PATH)

    yaml.SafeLoader.add_constructor(
        "tag:yaml.org,2002:python/object:scripts.workspace.NodeSave",
        lambda loader, data: NodeSave(**loader.construct_mapping(data)),
    )

    yaml.SafeLoader.add_constructor(
        "tag:yaml.org,2002:python/object:scripts.workspace.NodePortAddress",
        lambda loader, data: NodePortAddress(**loader.construct_mapping(data)),
    )

    yaml.SafeDumper.add_representer(
        NodeSave,
        lambda dumper, data: dumper.represent_mapping(
            "tag:yaml.org,2002:python/object:scripts.workspace.NodeSave",
            data.__dict__.copy(),
        ),
    )

    yaml.SafeDumper.add_representer(
        NodePortAddress,
        lambda dumper, data: dumper.represent_mapping(
            "tag:yaml.org,2002:python/object:scripts.workspace.NodePortAddress",
            data.__dict__.copy(),
        ),
    )

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
    file.write_file(f"{path}/space.nww", yaml.dump({}, sort_keys=False))

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
        global path

        buff = yaml.safe_load(file.read_file(f"{WORKSPACE_PATH}/{name}/space.nww"))
        node = {}

        for key, value in buff.items():
            n = Node(
                package.get_node(value.group, value.name),
                value.input,
                value.output,
                [],
                value.position_x,
                value.position_y,
                value.content,
            )
            node[key] = n

        memory.clear()
        path = f"{WORKSPACE_PATH}/{name}/space.nww"

        return json.dumps(buff, default=lambda obj: obj.__dict__, indent=4)

    except Exception as e:
        return str(e)


def workspace_unload():
    try:
        global node
        global memory
        global path

        node.clear()
        memory.clear()
        path = None

        return ""

    except Exception as e:
        return str(e)


def workspace_save(name: str):
    try:
        global node

        buff: dict[int, NodeSave] = {}

        for key, value in node.items():
            ns = NodeSave(
                value.data.meta["node_group"],
                value.data.meta["node_name"],
                value.input,
                value.output,
                value.position_x,
                value.position_y,
                value.content,
            )
            buff[key] = ns

        file.write_file(
            f"{WORKSPACE_PATH}/{name}/space.nww", yaml.safe_dump(buff, sort_keys=False)
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
        i_b = [NodePortAddress(None, None) for _ in range(len(n_b.meta["input"]))]
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

        node[id_o].output[port_o].append(NodePortAddress(id_i, port_i))

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

        node[id_o].output[port_o].remove(NodePortAddress(id_i, port_i))

        node[id_i].input[port_i].id = None
        node[id_i].input[port_i].port = None

        return "status=success"

    except Exception as e:
        return f"status=error&message={str(e)}"


async def runtime_handle(request: web.Request):
    ws = web.WebSocketResponse()

    try:
        await ws.prepare(request)

        node_id = int((await ws.receive()).data)
        node_network = runtime_node_network(node_id)
        node_layer = runtime_node_layer(node_network)

        for nls in reversed(node_layer):
            for nid in nls:
                result = await runtime_node_play(nid)

                await ws.send_str(result[0])

                if not result[1]:
                    raise RuntimeError(
                        f"runtime error occurred. id: {nid}, message: {result[0]}"
                    )

        await ws.close()

    except Exception as e:
        await ws.close()

        print(str(e))

    return ws


def runtime_node_network(id: int):
    nn = set()

    runtime_node_network_chain(nn, id)

    return list(nn)


def runtime_node_network_chain(nn: set, id: int):
    global node

    n = node[id]
    nn.add(id)

    for pa in n.input:
        if pa.id != None and pa.id not in nn:
            runtime_node_network_chain(nn, pa.id)

    for pal in n.output:
        for pa in pal:
            if pa.id != None and pa.id not in nn:
                runtime_node_network_chain(nn, pa.id)


def runtime_node_layer(nn: list[int]):
    global node

    nl: list[set] = []

    for id in nn:
        if len(node[id].output) == 0:
            runtime_node_layer_chain(nl, 0, id)

    nid_s = set()

    for nll in reversed(nl):

        nid_r = set()

        for nid in nll:
            if nid in nid_s:
                nid_r.add(nid)
            else:
                nid_s.add(nid)

        nll.difference_update(nid_r)

    return nl


def runtime_node_layer_chain(nl: list[set], nl_index: int, id: int):
    global node

    if len(nl) <= nl_index:
        nl.append(set())

    nl[nl_index].add(id)
    nl_index += 1

    for pa in node[id].input:
        if pa.id != None:
            runtime_node_layer_chain(nl, nl_index, pa.id)


async def runtime_node_play(id: int):
    global node
    global memory

    try:
        n = node[id]
        age = []

        for pa in n.input:
            age.append(node[pa.id].output_buff[pa.port])

        if "system_access" in n.data.meta:
            sys = WorkSpaceSys(memory, n.content)
            n.output_buff = n.data.function(sys, *age)
            n.content = sys.content
            return (f"status=success&id={id}&content={n.content}", True)

        else:
            n.output_buff = node[id].data.function(*age)
            return (f"status=success&id={id}", True)

    except Exception as e:
        return (f"status=error&id={id}&error={str(e)}", False)
