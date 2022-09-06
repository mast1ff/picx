from abc import ABC
from .token import Token
from ..utils.underscore import last

class DelimitedToken(ABC, Token):
  trim_left = False
  trim_right = False
  content = ""

  def __init__(
    self,
    kind,
    content,
    input,
    begin,
    end,
    trim_left = False,
    trim_right = False,
    file = None
  ):
    super().__init__(kind, input, begin, end, file)
    self.content = content
    self.trim_left = trim_left
    self.trim_right = trim_right

    tl = content[0] == "-"
    tr = last(content) == "-"
    slice_start = 0
    slice_end = len(content)
    if (tl == True):
      slice_start = 1
    if (tr == True):
      slice_end = -1

    self.content = content[slice_start:slice_end].strip()
