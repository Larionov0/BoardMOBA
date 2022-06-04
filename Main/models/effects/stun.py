from .effect import SummaryDurableEffect
from django.db import models
from Main.models.modifier import Modifier


class Stun(SummaryDurableEffect):
    name = 'Stun'
    img_src = 'stun.png'

    def gen_description(self, link):
        return f"Оглушение ({self.duration} ходов) (наложено {link.caster.name})"

    def after_target_move(self, link):
        self.decrease_duration(link)

    def gen_modifiers(self, link):
        return [Modifier(hero=link.hero, param_name='stun', value=True, duration=1, is_set=True)]
