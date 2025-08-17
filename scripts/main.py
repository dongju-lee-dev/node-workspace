import sys
import os
import aiohttp.web as web

sys.path.append(os.getcwd())

from scripts import asset
from scripts import package
from scripts import setting
from scripts import workspace

# 2
# 패키지 방식으로 built_in_ui 시리즈 개발
# bulit_in_ui_setting
# built_in_ui_package
# built_in_ui_workspace
# built_in_ui_workspace_save
# built_in_ui_icon

# 3
# 노드 생성
# 노드 연결

# 4
# workspace 연동
# workspace 로드, 언로드, 세이브
# workspace 코드 제작 기술 개발
# 글로벌 변수 기능
# 워크스페이스를 불러오면 글로벌 변수 기능이 있는데 
# 코드를 실행하면 글로벌 변수에 접근하여 변경이 가능하며 코드 실행이 끝이 나도 글로벌 변수는 사라지지 않는다.

# 5
# 패키지에 로컬 폴더를 집어 넣는 기능 추가
# 외부 저장 작업 공간 주소 기능 추가

setting.read()

if not setting.existe("host"):
    setting.set("host", "localhost")

if not setting.existe("port"):
    setting.set("port", 8080)

app = web.Application()

app.add_routes(asset.init())
app.add_routes(package.init())
app.add_routes(workspace.init())
app.add_routes(setting.init())

web.run_app(app, host=setting.get("host"), port=setting.get("port"))

setting.write()

# side panel 반갈 기능
# 다중 사용자 기능
# 다중 편집 기능
