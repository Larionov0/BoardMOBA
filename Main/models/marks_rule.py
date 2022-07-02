from django.db import models
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType
from Main.tools.math_tools import distance
from Main.classes.marks_generator import Mark


class MarksForm(models.Model):
    color = models.CharField(blank=True, null=True, default=None, max_length=30)

    class Meta:
        abstract = True

    def generate_marks(self):
        pass


class Circle(MarksForm):
    i = models.IntegerField()
    j = models.IntegerField()
    r = models.FloatField()

    def __str__(self):
        return f"Cirle {self.i}:{self.j}  (r = {self.r})"

    def generate_marks(self):
        marks = []
        c_radius = int(self.r)
        for i in range(self.i - c_radius, self.i + c_radius + 1):
            for j in range(self.j - c_radius, self.j + c_radius + 1):
                if distance([self.i, self.j], [i, j]) <= self.r:
                    marks.append(Mark(i, j, self.color))
        return marks


class Rectangle(MarksForm):
    i = models.IntegerField()
    j = models.IntegerField()
    h = models.IntegerField()
    w = models.IntegerField()

    def __str__(self):
        return f"Rectangle {self.i}:{self.j} (h={self.h} w={self.w})"


class Line(MarksForm):
    i1 = models.IntegerField()
    j1 = models.IntegerField()
    i2 = models.IntegerField()
    j2 = models.IntegerField()

    def generate_marks(self):
        vector = [self.i2 - self.i1, self.j2 - self.j1]
        assert vector[0] == 0 or vector[1] == 0, f'Мы пока не строим сложных линий : {self}'

        not_null_coord = abs(vector[0] if vector[0] != 0 else vector[1])
        vector[0] /= not_null_coord
        vector[1] /= not_null_coord

        marks = []

        cur_point = [self.i1, self.j1]
        for _ in range(not_null_coord + 1):
            marks.append(Mark(*cur_point, self.color))
            cur_point[0] += vector[0]
            cur_point[1] += vector[1]

        return marks

    def __str__(self):
        return f"Line {self.i1}:{self.j1} -> {self.i2}:{self.j2}"


class MarksRule(models.Model):
    marks_form_table = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    form_id = models.PositiveIntegerField()
    marks_form = GenericForeignKey('marks_form_table', 'form_id')

    name = models.CharField(max_length=10)
    game_state = models.ForeignKey('GameState', on_delete=models.CASCADE)

    def generate_marks(self):
        return self.marks_form.generate_marks()
