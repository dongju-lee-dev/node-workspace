# Package development documentation

This document contains the minimum required to develop a package.<br>
When developing a package, setup.json and start.json are required. Setup.json is used during installation, and start.json is used during package initialization.<br>
<br>

> setup.json (ex.

```
{
    "name": package_name,
    "package": [package required for package, ...]
}
```

Only packages that can be installed with pip are allowed.<br>
<br>

> start.json (ex.

```
{
    "node": [
        {
            "group": "node group name",
            "name": "node name",
            "code": "node code file local path",
            "design": "node design file local path"
        },
        ...
    ],

    "tool":[
        {
            "name": "tool name",
            "class_name": "tool code class name",
            "path": "tool code file local path"
        },
        ...
    ]
}
```

In node development, one node can and must have one code and design file.<br>
When creating a tool, inherit ToolBase and proceed with development.<br>
Be sure to override the functions that exist in ToolBase.<br>