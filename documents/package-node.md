# PACKAGE NOOD DOCUMENT

How to create a node<br>

A node consists of functions and metadata.<br>

The number of arguments for a node can be determined, but there is no number suggestion.<br>
The number of returns of a node can be determined, but there is no number suggestion.<br>
The node's function must return a list, and the length of the list must be the length of output.<br>

Node metadata must include node_group, node_name, input, output, and content.<br>
node_group and node_name are used as keys to find the node.<br>
Input and output represent the input and output of the node, and the name and color values ​​are displayed on the node.<br>
Content is displayed in the center of the node. You can also execute code using the script tag, and the script can use dataBase variables, node element variables, and content element variables.<br>
If you put system_access in the metadata as a key, you must additionally put a variable called sys in the argument, regardless of the value.<br>
The sys variable is of class type.<br>
sys variables can access memory and content.<br>


#### example: built_in_node/nodes/etc.py
```
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


def print_function(sys, value):
    sys.content = str(value)
    return []

```

For functions without metadata variables, this is not included.<br>