import sys
import os
import aiohttp.web as web

sys.path.append(os.getcwd())

from scripts import asset
from scripts import package
from scripts import setting
from scripts import workspace

# workspace에 command 이벤트 추가
# - 오른 클릭 시 여러 command를 Dropdown menu로 보여줌
# - command를 클릭하면 그 command를 실행함

# bulit_in_tool
# - icon : 완성
# - workspace : name : 완성, workspace list : 완성, workspace command : 미완성, workspace field : 미안성
# - package : package 삭제 UI 추가, github에서 다운로드 UI 추가, package 리스트 추가
# - setting : dataBase에 setting page activate 이벤트 추가하여 완성하기?
# - workspace menory view : 안 만듬
# - console view : 안 만듬

# 출시 전에 venv 에서 uv 전환 필요
# setup.py를 만들어서 미리 설치해야하는 것을 설치하자
# windows-setup.bat에서 호출함

# === v1.0 ===

# 기능 추가
# 패키지에 로컬 폴더를 집어 넣는 기능 추가
# 외부 저장 작업 공간 주소 기능 추가
# 기본 통신 json 형식으로 변경

# 패키지 개발 순서
# signal : 노드를 원격 실행
# preview : 이미지, 소리, 모델에 대한 프리뷰 제공
# torch : ai 돌리기
# numpy : cpu 가속
# hw_info : 하드웨어 상태확인
# aiohttp : 네트워크 작업

# === v1.x ===

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

# 다중 사용자 기능
# 다중 편집 기능
