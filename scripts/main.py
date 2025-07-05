import sys
import os
import json

sys.path.append(os.getcwd())

import etc.path as path
import server.server as server
import utility.file as file

# 인스턴스 준비

server_setting = json.loads(file.read_file(path.SERVER_SETTING))

server.Server(server_setting["host"], server_setting["port"])