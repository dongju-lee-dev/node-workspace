import yaml
import json
from aiohttp import web
from scripts import file
from scripts import package
from scripts.node import NodeData

WORKSPACE_PATH = "save/workspace"


class WorkSpaceSys:
    """Special variables when executing a function"""

    memory: dict[int, any]
    content: str

    def __init__(self, memory, content):
        self.memory = memory
        self.content = content


class NodePortAddress:
    """node port address"""
    
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
    """Format for node storage"""

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
    """Node runtime storage format"""
    
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


meta: dict[str, any] = {}
node: dict[int, Node] = {}
memory: dict[str, any] = {}
path: str = None


def init():
    """workspace init"""
    
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
        # workspace
        web.get("/workspace", workspace_list_handle),
        web.post("/workspace", workspace_create_handle),
        web.delete("/workspace", workspace_delete_handle),
        web.get("/workspace/load", workspace_load_handle),
        web.post("/workspace/unload", workspace_unload_handle),
        web.post("/workspace/save", workspace_save_handle),
        web.patch("/workspace/rename", workspace_rename_handle),
        # meta
        web.get("/workspace/meta", meta_get_handle),
        web.post("/workspace/meta", meta_create_handle),
        web.put("/workspace/meta", meta_update_handle),
        web.delete("/workspace/meta", meta_delete_handle),
        # node
        web.get("/workspace/node", node_get_handle),
        web.post("/workspace/node", node_create_handle),
        web.patch("/workspace/node/movement", node_movement_handle),
        web.patch("/workspace/node/content", node_content_handle),
        web.patch("/workspace/node/link", node_link_handle),
        web.patch("/workspace/node/unlink", node_unlink_handle),
        web.delete("/workspace/node", node_delete_handle),
        # memory
        web.get("/workspace/memory", memory_get_handle),
        web.post("/workspace/memory", memory_create_handle),
        web.put("/workspace/memory", memory_update_handle),
        web.delete("/workspace/memory", memory_delete_handle),
        # path
        web.get("/workspace/path", path_get_handle),
        # runtime
        web.get("/workspace/runtime", runtime_handle),
    ]


async def workspace_list_handle(request: web.Request):
    """workspace list"""
    
    try:
        return web.json_response(file.list_directory(WORKSPACE_PATH))

    except Exception as e:
        return web.Response(status=400, text=str(e))


async def workspace_create_handle(request: web.Request):
    """workspace create"""

    try:
        data = await request.json()
        path = f"{WORKSPACE_PATH}/{data["name"]}"

        if file.existe_directory(path):
            raise RuntimeError("There is already a workspace with the same name")

        file.create_directory(path)
        file.create_file(f"{path}/space.nww")
        file.create_file(f"{path}/space.nww")
        file.write_file(
            f"{path}/space.nww", yaml.dump({"meta": {}, "node": {}}, sort_keys=False)
        )

        return web.Response(status=200)

    except Exception as e:
        return web.Response(status=400, text=str(e))


async def workspace_delete_handle(request: web.Request):
    """workspace delete"""
    
    try:
        file.delete_all_directory(f"{WORKSPACE_PATH}/{request.query.get("name")}")

        return web.Response(status=200)

    except Exception as e:
        return web.Response(status=400, text=str(e))


async def workspace_load_handle(request: web.Request):
    """workspace load"""

    global meta
    global node
    global memory
    global path

    try:
        name = request.query.get("name")
        buff = yaml.safe_load(file.read_file(f"{WORKSPACE_PATH}/{name}/space.nww"))

        meta = {}
        node = {}
        memory.clear()
        path = f"{WORKSPACE_PATH}/{name}"

        for key, value in buff["meta"].items():
            meta[key] = value

        for key, value in buff["node"].items():
            node[key] = Node(
                package.get_node(value.group, value.name),
                value.input,
                value.output,
                [],
                value.position_x,
                value.position_y,
                value.content,
            )

        return web.Response(status=200)

    except Exception as e:
        return web.Response(status=400, text=str(e))


async def workspace_unload_handle(request: web.Request):
    """workspace unload"""
    
    try:
        global meta
        global node
        global memory
        global path

        meta.clear()
        node.clear()
        memory.clear()
        path = None

        return web.Response(status=200)

    except Exception as e:
        return web.Response(status=400, text=str(e))


async def workspace_save_handle(request: web.Request):
    """workspace save"""

    try:
        global meta
        global node

        data = await request.json()
        meta_buff = {}
        node_buff = {}

        for key, value in meta.items():
            meta_buff[key] = value

        for key, value in node.items():
            node_buff[key] = NodeSave(
                value.data.meta["node_group"],
                value.data.meta["node_name"],
                value.input,
                value.output,
                value.position_x,
                value.position_y,
                value.content,
            )

        buff = {}
        buff["meta"] = meta_buff
        buff["node"] = node_buff

        file.write_file(
            f"{WORKSPACE_PATH}/{data["name"]}/space.nww",
            yaml.safe_dump(buff, sort_keys=False),
        )

        return web.Response(status=200)

    except Exception as e:
        return web.Response(status=400, text=str(e))


async def workspace_rename_handle(request: web.Request):
    """workspace rename"""

    try:
        data = await request.json()

        file.rename_directory(
            f"{WORKSPACE_PATH}/{data["old_name"]}",
            f"{WORKSPACE_PATH}/{data["new_name"]}",
        )

        return web.Response(status=200)

    except Exception as e:
        return web.Response(status=400, text=str(e))


async def meta_get_handle(request: web.Request):
    """meta data get"""

    global meta

    try:
        if "key" in request.query:
            return web.json_response(
                meta[request.query.get("key")],
                dumps=lambda data: json.dumps(data, default=lambda obj: obj.__dict__),
            )

        else:
            return web.json_response(
                meta,
                dumps=lambda data: json.dumps(data, default=lambda obj: obj.__dict__),
            )

    except Exception as e:
        return web.Response(status=400, text=str(e))


async def meta_create_handle(request: web.Request):
    """meta data create"""

    global meta

    try:
        data = await request.json()

        if "value" in request.query:
            meta[data["key"]] = data["value"]
        else:
            meta[data["key"]] = None

        return web.Response(status=200)

    except Exception as e:
        return web.Response(status=400, text=str(e))


async def meta_update_handle(request: web.Request):
    """meta data update"""

    global meta

    try:
        data = await request.json()

        meta[data["key"]] = data["value"]

        return web.Response(status=200)

    except Exception as e:
        return web.Response(status=400, text=str(e))


async def meta_delete_handle(request: web.Request):
    """meta data delete"""

    global meta

    try:
        del meta[request.query.get("key")]

    except Exception as e:
        return web.Response(status=400, text=str(e))


async def node_get_handle(request: web.Request):
    """node data get"""

    global node

    try:
        buff = None

        if "id" in request.query:
            buff = node[int(request.query.get("id"))]
            buff = NodeSave(
                buff.data.meta["node_group"],
                buff.data.meta["node_name"],
                buff.input,
                buff.output,
                buff.position_x,
                buff.position_y,
                buff.content,
            )

        else:
            buff = {}
            for key, value in node.items():
                buff[key] = NodeSave(
                    value.data.meta["node_group"],
                    value.data.meta["node_name"],
                    value.input,
                    value.output,
                    value.position_x,
                    value.position_y,
                    value.content,
                )

        return web.json_response(
            buff,
            dumps=lambda data: json.dumps(data, default=lambda obj: obj.__dict__),
        )

    except Exception as e:
        return web.Response(status=400, text=str(e))


async def node_create_handle(request: web.Request):
    """node data create"""

    global node

    try:
        data = await request.json()

        id = 0
        for i in node.keys():
            if id != i:
                break
            id += 1

        n_b = package.get_node(data["group"], data["name"])
        i_b = [NodePortAddress(None, None) for _ in range(len(n_b.meta["input"]))]
        o_b = [[] for _ in range(len(n_b.meta["output"]))]
        o_b_b = [None for _ in range(len(n_b.meta["output"]))]

        node[id] = Node(
            n_b,
            i_b,
            o_b,
            o_b_b,
            float(data["positionX"]),
            float(data["positionY"]),
            "",
        )

        return web.Response(status=200, text=str(id))

    except Exception as e:
        return web.Response(status=400, text=str(e))


async def node_movement_handle(request: web.Request):
    """node movement"""

    global node

    try:
        data = await request.json()
        id = int(data["id"])
        position_x = float(data["positionX"])
        position_y = float(data["positionY"])

        node[id].position_x = position_x
        node[id].position_y = position_y

        return web.Response(status=200)

    except Exception as e:
        return web.Response(status=400, text=str(e))


async def node_content_handle(request: web.Request):
    """node content"""

    global node

    try:
        data = await request.json()
        id = int(data["id"])
        content = data["content"]

        node[id].content = content

        return web.Response(status=200)

    except Exception as e:
        return web.Response(status=400, text=str(e))


async def node_link_handle(request: web.Request):
    """node link"""

    global node

    try:
        data = await request.json()
        o_i = int(data["outputId"])
        o_p = int(data["outputPort"])
        i_i = int(data["inputId"])
        i_p = int(data["inputPort"])

        node[o_i].output[o_p].append(NodePortAddress(i_i, i_p))

        node[i_i].input[i_p].id = o_i
        node[i_i].input[i_p].port = o_p

        return web.Response(status=200)

    except Exception as e:
        return web.Response(status=400, text=str(e))


async def node_unlink_handle(request: web.Request):
    """node unlink"""

    global node

    try:
        data = await request.json()
        o_i = int(data["outputId"])
        o_p = int(data["outputPort"])
        i_i = int(data["inputId"])
        i_p = int(data["inputPort"])

        node[o_i].output[o_p].remove(NodePortAddress(i_i, i_p))

        node[i_i].input[i_p].id = None
        node[i_i].input[i_p].port = None

        return web.Response(status=200)

    except Exception as e:
        return web.Response(status=400, text=str(e))


async def node_delete_handle(request: web.Request):
    """node delete"""

    global node

    try:
        id = int(request.query.get("id"))

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

        return web.Response(status=200)

    except Exception as e:
        return web.Response(status=400, text=str(e))


async def memory_get_handle(request: web.Request):
    """memory data get"""

    global memory

    try:
        if "key" in request.query:
            return web.json_response(memory[request.query.get("key")])

        else:
            return web.json_response(memory)

    except Exception as e:
        return web.Response(status=400, text=str(e))


async def memory_create_handle(request: web.Request):
    """create memory data"""

    try:
        data = await request.json()
        if "value" in data:
            memory[data["key"]] = data["value"]
        else:
            memory[data["key"]] = None

        return web.Response(status=200)

    except Exception as e:
        return web.Response(status=400, text=str(e))


async def memory_update_handle(request: web.Request):
    """udpate memory data"""

    try:
        data = await request.json()
        memory[data["key"]] = data["value"]

        return web.Response(status=200)

    except Exception as e:
        return web.Response(status=400, text=str(e))


async def memory_delete_handle(request: web.Request):
    """delete memory data"""

    try:
        del memory[request.query.get("key")]

        return web.Response(status=200)

    except Exception as e:
        return web.Response(status=400, text=str(e))


async def path_get_handle(request: web.Request):
    """get now path"""

    global path

    try:
        return web.Response(status=200, text=path)

    except Exception as e:
        return web.Response(status=400, text=str(e))


async def runtime_handle(request: web.Request):
    """Executes all nodes associated with the node with the sent node ID value."""

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
