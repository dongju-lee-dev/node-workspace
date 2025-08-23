from scripts.tool import ToolBase
import aiohttp.web as web


class BuiltInUI_Workspace(ToolBase):
    def load(self, request):
        return web.FileResponse("packages/built_in_ui/assets/js/workspace.js")
