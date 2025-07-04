from aiohttp import web
import json
import scripts.utility.file as file


def main_page(request):
    return web.FileResponse("assets/page/index.html")


app = web.Application()
app.add_routes(
    [
        web.get("/", main_page),
    ]
)

setting = json.loads(file.read_file("settings/server_setting.json"))

web.run_app(app, host=setting["host"], port=setting["port"])
