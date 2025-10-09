import sys
import os
import aiohttp.web as web

sys.path.append(os.getcwd())

from scripts import asset
from scripts import package
from scripts import setting
from scripts import workspace

setting.read()

if not setting.existe("host"):
    setting.set("host", "localhost")
    
if not setting.existe("port"):
    setting.set("port", "8080")

app = web.Application()

app.add_routes(asset.init())
app.add_routes(package.init())
app.add_routes(workspace.init())
app.add_routes(setting.init())

web.run_app(app, host=setting.get("host"), port=int(setting.get("port")))

setting.write()
