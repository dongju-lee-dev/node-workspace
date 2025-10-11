# WEBUI DOCUMENT

The database is accessible from anywhere.<br>

A database has variables and functions.<br>
The database is provided in all script execution environments, so it preserves the data.<br>
Do not manipulate database variables arbitrarily.<br>

"layer": The layer variable contains the reference elements on the left and right of the top bar and the left and right of the bottom bar.<br>
- leftTop: #top-bar-left-point<br>
- rightTop: #top-bar-right-point<br>
- leftBottom: #bottom-bar-left-point<br>
- rightBottom: #bottom-bar-right-point<br>

"workSpace": A variable that contains the workspace element. There are several additional events in the workspace.<br>
- "unload": Called when all nodes are deleted
- "load": Called when loading job data
- "createNode": Called when a new node is created.
- "deleteNode": Called when a node is deleted.
- "movementNode": Called when the node's location information changes.
- "contentNode": Called when a node's content information is changed.
- "linkNode": Called when a node is connected.
- "unlinkNode": Called when a node is disconnected.
- "runOpen": Called when running a node.
- "runMessage": Called when a message arrives while running a node.
- "runError": Called when an error occurs while running a node.
- "runClose": Called when node execution has ended.

"workSpaceTop": Contains the element at the top center of the workspace.<br>

"workSpaceBottom": Contains the element at the bottom center of the workspace.<br>

"window-field": Contains elements created for use when you want to create a window.<br>

"leftSidePanel": Contains the left side panel elements<br>

"rightSidePanel": Contains the right side panel elements<br>

"CreatePackageShadowDOM": Creates and returns a shadowDOM where desired.
You can pass the name of the desired parent element as an argument, and optionally HTML.<br>
- "window-field": window-field
- "work-space-top": workSpaceTop
- "work-space-bottom": workSpaceBottom
- top-bar-left: layout.leftTop
- top-bar-right layout.rightTop
- bottom-bar-left: layout.leftBottom
- bottom-bar-right layout.rightBottom

"SetSidePanelEvent": This is a function that is reserved for use in the side panel and can only be displayed in the side panel through this function.<br>

"SetMessage": This is a function that displays a message at the bottom of the screen. In the text field, enter the content to be displayed, and in the textColor field, enter the CSS property value. It is optional.<br>