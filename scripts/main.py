import sys
import os
import aiohttp.web as web

sys.path.append(os.getcwd())

from scripts import asset
from scripts import package
from scripts import setting
from scripts import workspace

# =프 
# workspace에 command 이벤트 추가
# - 오른 클릭 시 여러 command를 Dropdown menu로 보여줌
# - command를 클릭하면 그 command를 실행함

# =백
# workspace node
# - 노드는 code, design만이 존재한다. 아마도?
#
# workspace node link
# - 노드를 연결하는 것을 개발
# - 노드를 실행하는 것은 node link이다.
# - ui에서 실행하고자 하는 노드를 클릭하여 선택 후 ui에 있는 실행 버튼을 누르면 처음 부터 실행된다.
# - 콘솔의 정보를 web으로 전송한다.
#
# workspace memory
# - 작업 공간을 열었을때 부터 닫을떄 까지 수동적으로 메모리를 관리한다.
# - 메모리는 타입이 존재하면 고유 이름이 존재한다.
# - 사전을 통해서 개발하면 된 것 같아.

# 파이썬의 대화형 그것이랑 유사함

# bulit_in_ui
# - icon : 완성
# - workspace : name : 완성, workspace list : 완성, workspace command : 미완성, workspace field : 미안성
# - package : package 삭제 UI 추가, github에서 다운로드 UI 추가
# - setting : dataBase에 setting page activate 이벤트 추가하여 완성하기?
# - workspace menory view : 안 만듬
# - console view : 안 만듬
# 개발 끝나면 리펙토링 한 번 하자

# built_in_node
# 간단한 수학 노드
# 정수, 실수, 문자 메모리 할당 노드

# web workspace에 작업 전달 기능 추가
# web workspace에 코드 실행 시 web소켓 연결

# 패키지에 로컬 폴더를 집어 넣는 기능 추가
# 외부 저장 작업 공간 주소 기능 추가

# setup에서 파이썬 파일 실행하여 built_in_node, built_in_ui의 setup.json으로 설치해야할 것을 설치

# package 개발 순서
# hw_info
# torch
# numpy
# aiohttp

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
