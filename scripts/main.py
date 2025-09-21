import sys
import os
import aiohttp.web as web

sys.path.append(os.getcwd())

from scripts import asset
from scripts import package
from scripts import setting
from scripts import workspace

# 지금 임시로 만드는 것을 저장하는 기능이 필요함
# bulit_in_tool - workspace
# - 현재 연 워크스페이스 이름을 저장하고 나중에 저장 버튼을 누르면 이름으로 저장하기
# - 이름이 없으면 새로 만들어서 추가

# 저장 버튼 추가
# 저장 테스트
# 실행 테스트
# 끝나면 built_in_tool 다 완성하기

# bulit_in_tool
# - package : package 삭제 UI 추가, github에서 다운로드 UI 추가, package 리스트 추가
# - setting : setting 기능을 사용할 수 있게 하기 생성, 삭제, 수정
# - menory view : 안 만듬
# - console view : 안 만듬

# 출시 전 단계
# package로 추가된 것과 기본적인 모두에 attachShadow를 추가할 것
# venv 에서 uv 전환 필요
# setup.py를 만들어서 미리 설치해야하는 것을 설치하자
# windows-setup.bat에서 호출함
# 모든 통신을 REST API 형식으로 변경
# 모든 기본 통신을 json 형식으로 변경
# 문서 작성 : package, node, tool, workspace

# === v1.0 ===

# 기능 개발 순서
# 패키지에 로컬 폴더를 집어 넣는 기능 추가
# 외부 저장 작업 공간 주소 기능 추가

# 패키지 개발 순서
# signal : 노드를 원격 실행
# preview : 이미지, 소리, 3d모델에 대한 프리뷰 제공
# torch : ai 돌리기
# numpy : cpu 가속
# hw_info : 하드웨어 상태확인
# aiohttp : 네트워크 작업
# custom_node : 커스텀 노드
# tensor_flow : ai 돌리기
# open_cv : 이미지 처리

# === v1.x ===

# 대규모 공사
# js -> ts
# 웹 빌드 도구 사용
# 다중 사용자 기능
# 격리된 Tool 기능
# 프론트 엔드로 대부분의 기능 이동
# 백엔드는 코드 실행과 ui 전송만
# 다양한 피드백을 받는다.

# === v2.0 ===

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
