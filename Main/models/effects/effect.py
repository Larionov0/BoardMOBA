from django.db import models


class Effect(models.Model):
    name = 'Effect'
    img_src = ''

    # hero = models.ForeignKey('Hero', on_delete=models.CASCADE, related_name='effects')
    # caster = models.ForeignKey('Hero', on_delete=models.CASCADE, related_name='my_effects')
    # is_alive = models.BooleanField(default=True)

    def get_game_state(self, link):
        return link.hero.game_state

    class Meta:
        abstract = True

    def gen_description(self, link):
        return 'Effect'

    def on_getting(self, link):
        pass

    def before_move(self, link):
        pass

    def after_move(self, link):
        pass

    def before_target_move(self, link):
        pass

    def after_target_move(self, link):
        pass

    def gen_modifiers(self, link):
        return []


class DurableEffect(Effect):
    duration = models.IntegerField()

    class Meta:
        abstract = True

    def decrease_duration(self, link):
        self.duration -= 1
        self.save()
        if self.duration <= 0:
            link.is_alive = False
            link.save()


class SummaryDurableEffect(DurableEffect):
    class Meta:
        abstract = True

    def on_getting(self, link):
        sum_dur = 0
        for effect_link in link.hero.alive_effects:
            effect = effect_link.effect
            if effect.name == self.name:
                sum_dur += effect.duration
                effect_link.is_alive = False
                effect_link.save()

        link.is_alive = True
        link.save()
        self.duration = sum_dur
        self.save()
