from django.db import models


class Shield(models.Model):
    hero = models.ForeignKey('Hero', on_delete=models.CASCADE, related_name='shields')
    caster = models.ForeignKey('Hero', on_delete=models.SET_NULL, null=True, related_name='my_shields')
    duration = models.IntegerField()
    value = models.IntegerField()
    max_value = models.IntegerField()
    armor = models.IntegerField()
    is_alive = models.BooleanField(default=True)

