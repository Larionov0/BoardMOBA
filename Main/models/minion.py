from Main.models.unit import *


class Minion(Unit):
    base_params = models.OneToOneField('HeroParams', on_delete=models.PROTECT, related_name='base_minion')
    params = models.OneToOneField('HeroParams', on_delete=models.PROTECT, related_name='minion')

    game_state = models.ForeignKey('GameState', on_delete=models.CASCADE, blank=True, null=True,
                                   related_name='all_minions')

    def to_dict(self):
        return {**{par: getattr(self, par) for par in ['team', 'i', 'j', 'color', 'hp']}, 'max_hp': self.params.max_hp}
