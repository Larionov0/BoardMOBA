from .effect import SummaryDurableEffect


class Bleeding(SummaryDurableEffect):
    name = 'Bleeding'
    img_src = 'bleeding.png'

    def gen_description(self, link):
        return f'Кровотечение[{self.duration}] (наложено {link.caster.name})'

    def before_target_move(self, link):
        game_state = link.hero.game_state
        link.hero.loose_hp(self.duration)
        game_state.create_ui_action('damage', link.hero.id, 0.2)
        self.decrease_duration(link)
