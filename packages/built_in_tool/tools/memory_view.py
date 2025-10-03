from scripts.tool import ToolBase
from scripts.workspace import memory
from aiohttp import web

MEMORYVIEW_META = {"tool_name": "built_in_tool_memory_view"}


class MemoryView(ToolBase):
    def load(self, request):
        return web.FileResponse("packages/built_in_tool/assets/js/memory_view.js")
    
    def work(self, request):
        print(memory)

        return web.json_response(memory)
