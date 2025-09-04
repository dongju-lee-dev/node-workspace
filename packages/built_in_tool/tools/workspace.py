from scripts.tool import ToolBase
import aiohttp.web as web

WORKSPACE_META = {"tool_name":"built_in_tool_workspace"}

class Workspace(ToolBase):
    def load(self, request):
        return web.FileResponse("packages/built_in_tool/assets/js/workspace.js")
