import os

g_base_path = os.getcwd() + "/"


def create_file(path: str):
    open(path, "w").close()


def delete_file(path: str):
    try:
        os.remove(path)
    except OSError:
        print(f"{path} Not file")


def check_file(path: str) -> bool:
    return os.path.isfile(g_base_path + path)


def read_file(path: str) -> str:
    with open(g_base_path + path, "r") as f:
        return f.read()


def write_file(path: str, data: str):
    with open(g_base_path + path, "w") as f:
        f.write(data)


def create_directory(path: str):
    os.mkdir(path)


def delete_directory(path: str):
    try:
        os.rmdir(path)
    except OSError:
        print(f"{path} Not Directory")


def check_directory(path: str) -> bool:
    os.path.isdir(path)


def list_directory(path: str) -> list[str]:
    return os.listdir(path)
