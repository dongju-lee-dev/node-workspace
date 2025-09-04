import scripts.file as file

CONTENT_TO_INT_META = {
    "node_group": "Variable",
    "node_name": "Int",
    "input": [],
    "output": [
        {
            "name": "value",
            "color": "var(--color-int)",
        },
    ],
    "content": file.read_file(
        "packages/built_in_node/assets/html/content-input.html"
    ),
    "system_access": True,
}


def content_to_int(_content_read):
    return int(_content_read)


CONTENT_TO_FLOAT_META = {
    "node_group": "Variable",
    "node_name": "Float",
    "input": [],
    "output": [
        {
            "name": "value",
            "color": "var(--color-float)",
        },
    ],
    "content": file.read_file(
        "packages/built_in_node/assets/html/content-input.html"
    ),
    "system_access": True,
}


def content_to_float(_content_read):
    return float(_content_read)


CONTENT_TO_STRING = {
    "node_group": "Variable",
    "node_name": "String",
    "input": [],
    "output": [
        {
            "name": "value",
            "color": "var(--color-string)",
        },
    ],
    "content": file.read_file(
        "packages/built_in_node/assets/html/content-input.html"
    ),
    "system_access": True,
}


def content_to_string(_content_read):
    return _content_read


CONTENT_TO_BOOL = {
    "node_group": "Variable",
    "node_name": "Bool",
    "input": [],
    "output": [
        {
            "name": "value",
            "color": "var(--color-bool)",
        },
    ],
    "content": file.read_file(
        "packages/built_in_node/assets/html/content-input.html"
    ),
    "system_access": True,
}


def content_to_bool(_content_read):
    return bool(_content_read)


MEMORY_READ_META = {
    "node_group": "Variable",
    "node_name": "Memory Read",
    "input": [],
    "output": [
        {
            "name": "value",
            "color": "var(--color-any)",
        },
    ],
    "content": file.read_file(
        "packages/built_in_node/assets/html/content-input.html"
    ),
    "system_access": True,
}


def memory_read(_memory, _content_read):
    return _memory[_content_read]


MEMORY_WRITE_META = {
    "node_group": "Variable",
    "node_name": "Memory Write",
    "input": [
        {
            "name": "key",
            "color": "var(--color-any)",
        },
    ],
    "output": [],
    "content": file.read_file(
        "packages/built_in_node/assets/html/content-input.html"
    ),
    "system_access": True,
}


def memory_write(data, _memory, _content_read):
    _memory[_content_read] = data
