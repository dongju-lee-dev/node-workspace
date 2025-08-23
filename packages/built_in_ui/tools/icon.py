from scripts.tool import ToolBase
from aiohttp import web


class BuiltInUI_Icon(ToolBase):
    def load(self, request):
        return web.FileResponse('packages/built_in_ui/assets/js/icon.js')
