import os

g_path = os.getcwd() + "/"


def create_file(path: str):
    """Create a new file with a local address"""
    
    f = open(g_path + path, "w")
    f.close()


def delete_file(path: str):
    """Delete file to local address"""

    os.remove(g_path + path)


def existe_file(path: str):
    """Check existence of file"""
    
    return os.path.exists(g_path + path)


def read_file(path: str):
    """Read file local path"""
    
    with open(g_path + path, "r") as f:
        return f.read()


def write_file(path: str, data: str):
    """Write file local path"""
    
    with open(g_path + path, "w") as f:
        f.write(data)


def create_directory(path: str):
    """Create a new folder"""
    
    os.mkdir(g_path + path)


def delete_directory(path: str):
    """Delete folder"""
    
    os.rmdir(g_path + path)


def existe_directory(path: str):
    """Check existence of folder"""
    
    return os.path.exists(g_path + path)


def list_directory(path: str):
    """Return list within folder"""
    
    return os.listdir(g_path + path)


def rename_directory(old_path: str, new_path: str):
    """Change folder name"""
    
    if existe_directory(new_path):
        return f"The folder already exists. Please check again. : {new_path}"

    os.rename(g_path + old_path, g_path + new_path)
    return ""


def get_absolute_path(path: str):
    """Return local address"""
    
    return g_path + path
