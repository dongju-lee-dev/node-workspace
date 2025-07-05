from aiohttp import web
import scripts.utility.file as file


class Server:
    def __init__(self, host: str, port: int):
        self.app = web.Application()
        self.app.add_routes(
            [
                web.get("/", self.main_page),
            ]
        )
        web.run_app(self.app, host=host, port=port)

    def main_page(request):
        return web.FileResponse("assets/page/index.html")
