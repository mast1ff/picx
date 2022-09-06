class Token:
  kind = ""
  input = ""
  begin = 0
  end = 0
  file = ""

  def __init__(self, kind, input, begin = 0, end = 0, file = None):
    self.kind = kind
    self.input = input
    self.begin = begin
    self.end = end
    if file is not None:
      self.file = file

  def get_text(self):
    return self.input[self.begin:self.end]

  def get_position(self):
    [row, col] = [1, 1]
    for i in range(self.begin):
      if self.input[i] == "\n":
        row += 1
        col = 1
      else:
        col += 1
    return [row, col]

  def size(self):
    return self.end - self.begin
