import aiohttp.web as web


class ToolBase:
    """
    It is the basis of tool development.
    The load, unload, and work functions must be included.
    """
    
    async def load(request: web.Request) -> web.Response:
        """
        You must receive data as aiohttp.web.Request type and return it as aiohttp.web.Response type.
        Called when loading a tool in webui.
        """
        
        return web.Response()

    async def unload(request: web.Request) -> web.Response:
        """
        You must receive data as aiohttp.web.Request type and return it as aiohttp.web.Response type.
        Called when the page is terminated or the tool is no longer in use in the webui.
        """
        
        return web.Response()

    async def work(request: web.Request) -> web.Response:
        """
        You must receive data as aiohttp.web.Request type and return it as aiohttp.web.Response type.
        This function receives a task request from webui and uses a query to receive data.
        
        command=work
        name={tool_name}
        You can execute this function with a query.
        """
        
        return web.Response()
