from .effect import *


class Poison(DurableEffect):
    name = 'Poison'
    img_src = 'poison.png'
    value = models.IntegerField()

    def gen_description(self, link):
        return f'Отравление [{self.value}] на {self.duration} ходов (наложено {link.caster.name})'

    def before_move(self, link):
        self.decrease_duration(link)
        link.hero.loose_hp(self.value)
        self.get_game_state(link).create_ui_action('damage', link.hero.id)

