from django.db import models
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType


class EffectLink(models.Model):
    effect_table = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    effect_id = models.PositiveIntegerField()
    effect = GenericForeignKey('effect_table', 'effect_id')
    hero = models.ForeignKey('Hero', on_delete=models.CASCADE, related_name='effects')
    caster = models.ForeignKey('Hero', on_delete=models.CASCADE, related_name='my_effects')
    is_alive = models.BooleanField(default=True)

    def to_dict(self):
        return {
            'img_src': self.effect.img_src,
            'description': self.effect.gen_description(self),
            'name': self.effect.name,
            'id': self.effect.id
        }

    def die(self):
        self.is_alive = False
        self.save()
