from .effect import SummaryDurableEffect
from django.db import models
from Main.models.modifier import Modifier


class Solidity(SummaryDurableEffect):
    name = 'Solidity'
    img_src = 'solidity.png'

    def gen_description(self, link):
        return f"Стойкость ({self.duration} ходов) (наложено {link.caster.name})"

    def before_move(self, link):
        self.decrease_duration(link)

    def gen_modifiers(self, link):
        return [Modifier(hero=link.hero, param_name='solidity', value=True, duration=1, is_set=True)]
