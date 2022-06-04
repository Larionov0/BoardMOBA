from .effect import DurableEffect
from django.db import models
from Main.models.modifier import Modifier


class Toxicity(DurableEffect):
    name = 'Toxicity'
    img_src = 'toxicity.png'

    value = models.IntegerField()
    poison_duration = models.IntegerField()

    def gen_description(self, link):
        return f"Токсичность [Отравление: {self.value} | {self.poison_duration}] ({self.duration} ходов) (наложено {link.caster.name})"

    def after_move(self, link):
        self.decrease_duration(link)

    def gen_modifiers(self, link):
        return [Modifier(hero=link.hero, param_name='toxicity_value', value=self.value, duration=1),
                Modifier(hero=link.hero, param_name='toxicity_duration', value=self.poison_duration, duration=1)]
