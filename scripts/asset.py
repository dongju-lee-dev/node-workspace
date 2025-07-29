import aiohttp.web as web


def init():
    return [
        web.get("/", main_page_handle),
        web.get("/assets/{tail:.*}", assets_handle),
    ]


def main_page_handle(requset: web.Request):
    """main page handle"""
    return web.FileResponse("assets/page/index.html")


def assets_handle(request: web.Request):
    """assets handle"""
    return web.FileResponse(request.path[1:])
