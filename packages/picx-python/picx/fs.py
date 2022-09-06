from pathlib import Path

class Fs:
  def exists(self, filename = ""):
    file_path = Path(filename)
    if (file_path.is_dir() or file_path.is_file()):
      return True
    else:
      return False

  def read_file(self, filename = ""):
    text = ""
    for line in open(filename):
      text += line
    return text

  def resolve():
    return ""

  def dirname():
    return ""

  def contains():
    return ""

  sep = "/"

