from scripts.tool import ToolBase
from aiohttp import web

CONSOLEVIEW_META = {"tool_name": "built_in_tool_console_view"}


class ConsoleView(ToolBase):
    def load(self, request):
        return web.FileResponse("packages/built_in_tool/assets/js/console-view.js")
