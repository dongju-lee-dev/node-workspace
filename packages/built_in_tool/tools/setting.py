from scripts.tool import ToolBase
from aiohttp import web

SETTING_META = {"tool_name":"built_in_tool_setting"}

class Setting(ToolBase):
    def load(self, request):
        return web.FileResponse("packages/built_in_tool/assets/js/setting.js")
