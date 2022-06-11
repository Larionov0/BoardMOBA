from .effect import SummaryDurableEffect
from django.db import models
from Main.models.modifier import Modifier


class Silence(SummaryDurableEffect):
    name = 'Silence'
    img_src = 'silence.png'

    def gen_description(self, link):
        return f"Безмолвие ({self.duration} ходов) (наложено {link.caster.name})"

    def after_target_move(self, link):
        self.decrease_duration(link)

    def gen_modifiers(self, link):
        return [Modifier(hero=link.hero, param_name='silence', value=True, duration=1, is_set=True)]
