import sys
import os
import aiohttp.web as web

sys.path.append(os.getcwd())

from scripts import asset
from scripts import package
from scripts import setting
from scripts import workspace

# === v1.0 ===

# 패키지 개발
# signal : 노드를 원격 실행
# preview : 이미지, 소리, 3d모델에 대한 프리뷰 제공
# hw_info : 하드웨어 상태확인
# numpy : cpu 가속
# torch : ai 돌리기
# tensor_flow : ai 돌리기
# aiohttp : 네트워크 작업
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
# 다중 사용자 기능
# 다중 편집 기능
# 다중 언어 지원
# 언어 변경을 고려 할 것

# === v2.0 ===

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
