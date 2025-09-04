from scripts.tool import ToolBase
from aiohttp import web

PACKAGE_META = {"tool_name": "built_in_tool_package"}


class Package(ToolBase):
    def load(self, request):
        return web.FileResponse("packages/built_in_tool/assets/js/package.js")
