from scripts.tool import ToolBase
from aiohttp import web

MEMORYVIEW_META = {"tool_name": "built_in_tool_memory_view"}


class MemoryView(ToolBase):
    def load(self, request):
        return web.FileResponse("packages/built_in_tool/assets/js/memory-view.js")
