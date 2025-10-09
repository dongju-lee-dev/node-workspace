# WORKSPACE DOCUMENT

Workspace API Description

### /workspace, get
Returns a list of folders inside the workspace folder inside the save folder.<br>

### /workspace, post
Create a new workspace.

### /workspace, delete
Remove the workspace.

### /workspace/load, get
The query statement receives the name as an argument and loads the workspace.

### /workspace/unload, post
No arguments Initializes the meta, node, memory, and path of the workspace.

### /workspace/save, post
It receives a name as an argument via JSON and saves it. The format is YAML.

### /workspace/rename, patch
Change the name of the workspace.

### /workspace/meta, get
Returns the metadata of the workspace.

### /workspace/meta, post
Create new workspace metadata.

### /workspace/meta, put
Overwrites workspace metadata.

### /workspace/meta, delete
Delete workspace metadata.

### /workspace/node, get
Returns the node corresponding to the id value

### /workspace/node, post
Create Node

### /workspace/node/movement, patch
Move node location

### /workspace/node/content, patch
Update node content

### /workspace/node/link, patch
node connection

### /workspace/node/unlink, patch
Disconnect node

### /workspace/node, delete
delete node

### /workspace/memory, get
Return memory value

### /workspace/memory, post
Add memory

### /workspace/memory, put
Update memory

### /workspace/memory, delete
clear memory

### /workspace/path, get
Address of the currently opened workspace folder

### /workspace/runtime, get
It receives a node id as an argument and executes all nodes connected to the node with that node id.