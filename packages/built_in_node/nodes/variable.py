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
    "content": file.read_file("packages/built_in_node/assets/html/content-input.html"),
    "system_access": True,
}


def content_to_int(sys):
    return [
        int(sys.content),
    ]


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
    "content": file.read_file("packages/built_in_node/assets/html/content-input.html"),
    "system_access": True,
}


def content_to_float(sys):
    return [
        float(sys.content),
    ]


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
    "content": file.read_file("packages/built_in_node/assets/html/content-input.html"),
    "system_access": True,
}


def content_to_string(sys):
    return [
        sys.content,
    ]


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
    "content": file.read_file("packages/built_in_node/assets/html/content-input.html"),
    "system_access": True,
}


def content_to_bool(sys):
    return [
        bool(sys.content),
    ]


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
    "content": file.read_file("packages/built_in_node/assets/html/content-input.html"),
    "system_access": True,
}


def memory_read(sys):
    return [
        sys.memory[sys.content],
    ]


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
    "content": file.read_file("packages/built_in_node/assets/html/content-input.html"),
    "system_access": True,
}


def memory_write(sys, data):
    sys.memory[sys.content] = data
    return []
