from scripts.tool import ToolBase
from aiohttp import web

class Signal(ToolBase):
    def load(self, request):
        return web.FileResponse("/packages/signal/assets/tool-script.js")