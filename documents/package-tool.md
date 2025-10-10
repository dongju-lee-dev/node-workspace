# PACKAGE TOOL DOCUMENT

How to make tools<br>

Tools are created on a class basis.<br>
Tools must use a class called ToolBase as their parent.<br>

Create metadata by capitalizing all letters in the tool's class name and appending _META to the end.<br>
Tools absolutely require metadata.<br>

The metadata must contain tool_name.<br>

ToolBase has several functions.<br>
ToolBase uses the __init__ function, so when using the __init__ function, you must use super().__init__().<br>
ToolBase has load, unload, and work.<br>
load is called when a web page is accessed.<br>
unload is called when exiting a web page.<br>
The work function is a function that requests work from the web.<br>

When developing on the web, it is good to use a database.<br>
The tool requires a JavaScript file to be sent first, and the database is provided as a variable during execution.<br>
dataBase is a map variable.<br>

It is recommended to add elements to the dataBase via CreatePackageShadowDOM.<br>
It exists to separate through shadowDOM.<br>
DataBase has a SetSidePanelEvent which pre-schedules what can be added to the side panel.<br>

### example: built_in_tool/tools/console_view.py
```
import sys
from scripts.tool import ToolBase
from aiohttp import web
from io import StringIO

CONSOLEVIEW_META = {"tool_name": "built_in_tool_console_view"}


class Tee:
    def __init__(self, stream1, stream2):
        self.stream1 = stream1
        self.stream2 = stream2

    def write(self, data):
        self.stream1.write(data)
        self.stream2.write(data)

    def flush(self):
        self.stream1.flush()
        self.stream2.flush()


class ConsoleView(ToolBase):
    def __init__(self, meta):
        super().__init__(meta)

        self.ori = sys.stdout
        self.new = StringIO()

        sys.stdout = Tee(self.ori, self.new)

    def load(self, request):
        return web.FileResponse("packages/built_in_tool/assets/js/console_view.js")

    def work(self, request):
        text = self.new.getvalue()

        self.new.seek(0)
        self.new.truncate(0)

        return web.Response(status=200, text=text)

```