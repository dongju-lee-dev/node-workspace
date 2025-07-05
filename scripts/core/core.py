import sys
import os
import json

sys.path.append(os.getcwd())

import scripts.etc.path as path
import scripts.server.server as server
import scripts.utility.file as file


import torch
import tensorflow

# server start

server_setting = json.loads(file.read_file(path.SERVER_SETTING_PATH))

server.Server(server_setting["host"], server_setting["port"])