from .effect import DurableEffect
from django.db import models
from Main.models.modifier import Modifier


class Slowdown(DurableEffect):
    name = 'Slowdown'
    img_src = 'slowdown.png'

    value = models.IntegerField()

    def gen_description(self, link):
        return f"Замедление ({self.value} на {self.duration} ходов) (наложено {link.caster.name})"

    def before_move(self, link):
        self.decrease_duration(link)

    def gen_modifiers(self, link):
        return [Modifier(hero=link.hero, param_name='slowdown', value=self.value, duration=1)]
