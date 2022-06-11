from .effect import *
from django.db import models
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType
from Main.tools.math_tools import distance
from .effect_link import EffectLink


class DelayedDamage_Effects(models.Model):
    delayed_damage = models.ForeignKey('DelayedDamage', on_delete=models.CASCADE, related_name='dd_effects')
    effect_table = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    effect_id = models.PositiveIntegerField()
    effect = GenericForeignKey('effect_table', 'effect_id')


class DelayedDamage(DurableEffect):
    name = 'DelayedDamage'
    img_src = 'delayed_damage.png'
    damage = models.IntegerField()
    stun_cancel = models.BooleanField(default=False)
    move_cancel = models.BooleanField(default=False)
    max_distance = models.IntegerField()
    
    @property
    def effects(self):
        return [dd_effect.effect for dd_effect in self.dd_effects.all()]

    def gen_description(self, link):
        return f'Отложенный урон [{self.damage}] через {self.duration} ходов (наложено {link.caster.name})'

    def before_move(self, link):
        self.decrease_duration(link)
        if self.duration == 0:
            if distance(link.caster.coords, link.hero.coords) <= self.max_distance:
                self.run(link)

    def run(self, link):
        link.hero.get_damage(self.damage)
        self.get_game_state(link).create_ui_action('damage', link.hero.id)
        for effect in self.effects:
            link.hero.get_effect(EffectLink.objects.create(effect=effect, hero=link.hero, caster=link.caster))
