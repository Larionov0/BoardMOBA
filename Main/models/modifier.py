from django.db import models


class Modifier(models.Model):
    hero = models.ForeignKey('Hero', on_delete=models.CASCADE, related_name='modifiers')
    param_name = models.CharField(max_length=15)
    value = models.IntegerField()
    duration = models.IntegerField()
    is_alive = models.BooleanField(default=True)
    is_set = models.BooleanField(default=False)  # будет ли модификатор устанавливать значение, а не плюсовать

    def modify(self, params):
        if self.is_set:
            setattr(params, self.param_name, self.value)
        else:
            setattr(params, self.param_name, getattr(params, self.param_name) + self.value)
        # save outside

    def decrease(self):
        self.duration -= 1
        if self.duration <= 0:
            self.is_alive = False
        self.save()

    def __str__(self):
        return f"Modifier {self.param_name} +{self.value} ({self.hero.game_state_id})"
