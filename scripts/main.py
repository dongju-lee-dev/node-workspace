import sys
import os
import aiohttp.web as web

sys.path.append(os.getcwd())

from scripts import asset
from scripts import package
from scripts import setting
from scripts import workspace

# web : 정리
# web.Application()으로 인스턴스 생성
# web.run_app()로 실행
# web.Response 기본적인 데이터 보내기 body, content_type 등을 직접 작성해야함
# web.FileResponse file 데이터를 보낼떄
# web.StreamResponse 단방향 대용량 데이터 전송에 좋음
# web.json_response json 데이터 보내기
# web.WebSocketResponse 웹소켓 연결 통신

# 서버 입장 : get과 post는 기본이고 나머지는 바리에이션인듯
# web.get 데이터 보내기
# web.post 데이터 받기
# web.put 데이터 등록
# web.patch 데이터 수정
# web.delete 데이터 삭제

# load map
# 7w
# webui에서 node 검색, 생성, 연결, 삭제, 조작
# webui에서 tool 검색, 사용

setting.read()

app = web.Application()

app.add_routes(asset.init())
app.add_routes(package.init())
app.add_routes(workspace.init())

web.run_app(app, host=setting.get("host"), port=setting.get("port"))

setting.write()
