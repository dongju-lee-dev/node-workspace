import os

g_path = os.getcwd() + "/"

def absolute_path(path:str):
    return g_path + path

def create_file(path: str):
    f = open(g_path + path, "w")
    f.close()


def delete_file(path: str):
    os.remove(g_path + path)


def existe_file(path: str):
    return os.path.isfile(g_path + path)


def read_file(path: str):
    with open(g_path + path, "r") as f:
        return f.read()


def write_file(path: str, data: str):
    with open(g_path + path, "w") as f:
        f.write(data)


def create_directory(path: str):
    os.mkdir(g_path + path)


def delete_directory(path: str):
    os.rmdir(g_path + path)


def existe_directory(path: str):
    return os.path.isdir(g_path + path)


def list_directory(path: str):
    return os.listdir(g_path + path)
