import scripts.file as file

PRINT_FUNCTION_META = {
    "node_group": "Preview",
    "node_name": "Print",
    "input": [
        {
            "name": "value",
            "color": "var(--color-any)",
        }
    ],
    "output": [],
    "content": file.read_file("packages/built_in_node/assets/html/content-text.html"),
    "system_access": True,
}


def print_function(value, _content_write):
    _content_write = str(value)
