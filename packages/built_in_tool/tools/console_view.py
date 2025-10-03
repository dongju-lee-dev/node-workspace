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
