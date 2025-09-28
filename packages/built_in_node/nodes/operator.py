ADD_META = {
    "node_group": "Operator",
    "node_name": "Add",
    "input": [
        {
            "name": "a",
            "color": "var(--color-any)",
        },
        {
            "name": "b",
            "color": "var(--color-any)",
        },
    ],
    "output": [
        {
            "name": "result",
            "color": "var(--color-any)",
        }
    ],
    "content": "",
}


def add(a, b):
    return [
        a + b,
    ]


SUB_META = {
    "node_group": "Operator",
    "node_name": "Sub",
    "input": [
        {
            "name": "a",
            "color": "var(--color-any)",
        },
        {
            "name": "b",
            "color": "var(--color-any)",
        },
    ],
    "output": [
        {
            "name": "result",
            "color": "var(--color-any)",
        }
    ],
    "content": "",
}


def sub(a, b):
    return [
        a - b,
    ]


MUL_META = {
    "node_group": "Operator",
    "node_name": "Mul",
    "input": [
        {
            "name": "a",
            "color": "var(--color-any)",
        },
        {
            "name": "b",
            "color": "var(--color-any)",
        },
    ],
    "output": [
        {
            "name": "result",
            "color": "var(--color-any)",
        }
    ],
    "content": "",
}


def mul(a, b):
    return [
        a * b,
    ]


DIV_META = {
    "node_group": "Operator",
    "node_name": "Div",
    "input": [
        {
            "name": "a",
            "color": "var(--color-any)",
        },
        {
            "name": "b",
            "color": "var(--color-any)",
        },
    ],
    "output": [
        {
            "name": "result",
            "color": "var(--color-any)",
        }
    ],
    "content": "",
}


def div(a, b):
    return [
        a / b,
    ]


FDIV_META = {
    "node_group": "Operator",
    "node_name": "Fdiv",
    "input": [
        {
            "name": "a",
            "color": "var(--color-any)",
        },
        {
            "name": "b",
            "color": "var(--color-any)",
        },
    ],
    "output": [
        {
            "name": "result",
            "color": "var(--color-any)",
        }
    ],
    "content": "",
}


def fdiv(a, b):
    return [
        a // b,
    ]


MOD_META = {
    "node_group": "Operator",
    "node_name": "Mod",
    "input": [
        {
            "name": "a",
            "color": "var(--color-any)",
        },
        {
            "name": "b",
            "color": "var(--color-any)",
        },
    ],
    "output": [
        {
            "name": "result",
            "color": "var(--color-any)",
        }
    ],
    "content": "",
}


def mod(a, b):
    return [
        a % b,
    ]


LOGICAL_AND_META = {
    "node_group": "Operator",
    "node_name": "And",
    "input": [
        {
            "name": "a",
            "color": "var(--color-bool)",
        },
        {
            "name": "b",
            "color": "var(--color-bool)",
        },
    ],
    "output": [
        {
            "name": "result",
            "color": "var(--color-bool)",
        },
    ],
    "content": "",
}


def logical_and(a: bool, b: bool):
    return [
        a and b,
    ]


LOGICAL_OR_META = {
    "node_group": "Operator",
    "node_name": "or",
    "input": [
        {
            "name": "a",
            "color": "var(--color-bool)",
        },
        {
            "name": "b",
            "color": "var(--color-bool)",
        },
    ],
    "output": [
        {
            "name": "result",
            "color": "var(--color-bool)",
        },
    ],
    "content": "",
}


def logical_or(a: bool, b: bool):
    return [
        a or b,
    ]


LOGICAL_NOT_META = {
    "node_group": "Operator",
    "node_name": "not",
    "input": [
        {
            "name": "a",
            "color": "var(--color-bool)",
        },
    ],
    "output": [
        {
            "name": "result",
            "color": "var(--color-bool)",
        },
    ],
    "content": "",
}


def logical_not(a: bool):
    return [
        not a,
    ]


IS_LESS_THAN_META = {
    "node_group": "Operator",
    "node_name": "Is less than",
    "input": [
        {
            "name": "a",
            "color": "var(--color-any)",
        },
        {
            "name": "b",
            "color": "var(--color-any)",
        },
    ],
    "output": [
        {
            "name": "result",
            "color": "var(--color-bool)",
        },
    ],
    "content": "",
}


def is_less_than(a, b):
    return [
        a < b,
    ]


IS_LESS_THAN_OR_EQUAL_TO_META = {
    "node_group": "Operator",
    "node_name": "Is less than or equal to",
    "input": [
        {
            "name": "a",
            "color": "var(--color-any)",
        },
        {
            "name": "b",
            "color": "var(--color-any)",
        },
    ],
    "output": [
        {
            "name": "result",
            "color": "var(--color-bool)",
        },
    ],
    "content": "",
}


def is_less_than_or_equal_to(a, b):
    return [
        a <= b,
    ]


IS_EQUAL_TO_META = {
    "node_group": "Operator",
    "node_name": "Is equal to",
    "input": [
        {
            "name": "a",
            "color": "var(--color-any)",
        },
        {
            "name": "b",
            "color": "var(--color-any)",
        },
    ],
    "output": [
        {
            "name": "result",
            "color": "var(--color-bool)",
        },
    ],
    "content": "",
}


def is_equal_to(a, b):
    return [
        a == b,
    ]


IS_NOT_EQUAL_TO_META = {
    "node_group": "Operator",
    "node_name": "Is not equal to",
    "input": [
        {
            "name": "a",
            "color": "var(--color-any)",
        },
        {
            "name": "b",
            "color": "var(--color-any)",
        },
    ],
    "output": [
        {
            "name": "result",
            "color": "var(--color-bool)",
        },
    ],
    "content": "",
}


def is_not_equal_to(a, b):
    return [
        a != b,
    ]


IS_GREATER_THAN_META = {
    "node_group": "Operator",
    "node_name": "Is greater than",
    "input": [
        {
            "name": "a",
            "color": "var(--color-any)",
        },
        {
            "name": "b",
            "color": "var(--color-any)",
        },
    ],
    "output": [
        {
            "name": "result",
            "color": "var(--color-bool)",
        },
    ],
    "content": "",
}


def is_greater_than(a, b):
    return [
        a > b,
    ]


IS_GREATER_THAN_OR_EQUAL_TO_META = {
    "node_group": "Operator",
    "node_name": "Is greater than or equal to",
    "input": [
        {
            "name": "a",
            "color": "var(--color-any)",
        },
        {
            "name": "b",
            "color": "var(--color-any)",
        },
    ],
    "output": [
        {
            "name": "result",
            "color": "var(--color-bool)",
        },
    ],
    "content": "",
}


def is_greater_than_or_equal_to(a, b):
    return [
        a >= b,
    ]
