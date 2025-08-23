from scripts.tool import ToolBase
from aiohttp import web


class BuiltInUI_Setting(ToolBase):
    def load(self, request):
        return web.FileResponse("packages/built_in_ui/assets/js/setting.js")
