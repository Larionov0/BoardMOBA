from Main.tools.singleton import Singleton
from Main.tools.math_tools import distance


class Mark:
    def __init__(self, i, j, color=None):
        self.i = i
        self.j = j
        self.color = color

    def __str__(self):
        return f"[{self.i}; {self.j}]"


class MarksGenerator(metaclass=Singleton):
    def circle(self, center_i, center_j, radius, color=None):
        c_radius = int(radius)
        for i in range(center_i - c_radius, center_i + c_radius + 1):
            for j in range(center_j - c_radius, center_j + c_radius + 1):
                if distance([center_i, center_j], [i, j]) <= radius:
                    yield Mark(i, j, color)

    def circle_list(self, *args, **kwargs):
        return list(self.circle(*args, **kwargs))
