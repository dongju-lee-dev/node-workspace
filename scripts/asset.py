import aiohttp.web as web


def init():
    return [
        web.get("/", index_handle),
        #web.get("/")
        web.get("/assets/{tail:.*}", assets_handle),
    ]


def index_handle(request: web.Request):
    """main page handle"""
    return web.FileResponse("assets/index.html")

def assets_handle(request: web.Request):
    """assets handle"""
    return web.FileResponse(request.path[1:])
