from scripts.tool import ToolBase
from aiohttp import web

ICON_META = {"tool_name": "built_in_tool_icon"}


class Icon(ToolBase):
    def load(self, request):
        return web.FileResponse("packages/built_in_tool/assets/js/icon.js")
