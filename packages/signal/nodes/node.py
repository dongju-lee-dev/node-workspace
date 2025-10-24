from scripts import file

SIGNAL_META = {
    "node_group": "Signal",
    "node_name": "Signal",
    "input": [
        {
            "name": "input",
            "color": "var(--color-any)",
        }
    ],
    "output": [
        {
            "name": "output",
            "color": "var(--color-any)",
        }
    ],
    "content": file.read_file("packages/signal/assets/signal-content.html"),
}


def signal(input):
    return [
        input,
    ]


SIGNAL_IF_META = {
    "node_group": "Signal",
    "node_name": "Signal_If",
    "input": [
        {
            "name": "input",
            "color": "var(--color-any)",
        },
        {
            "name": "bool",
            "color": "var(--color-bool)",
        },
    ],
    "output": [
        {
            "name": "output",
            "color": "var(--color-any)",
        }
    ],
    "content": file.read_file("packages/signal/assets/signal-if-content.html"),
    "system_access": True,
}


def signal_if(sys, input, b):
    sys.content

    return [
        input,
    ]
