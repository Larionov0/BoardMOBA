from django.db import models


class HeroParams(models.Model):
    # параметры, которые могут временно изменяться, но потом возвращаются в норму

    max_hp = models.IntegerField(default=0)
    max_energy = models.IntegerField(default=0)
    power = models.IntegerField(default=0)
    armor = models.IntegerField(default=0)
    magic = models.IntegerField(default=0)
    attack_range = models.FloatField(default=0)
    attack_cost = models.IntegerField(default=0)

    slowdown = models.IntegerField(default=0)
    solidity = models.BooleanField(default=False)
    silence = models.BooleanField(default=False)
    can_autoattack = models.BooleanField(default=True)
    stun = models.BooleanField(default=False)

    toxicity_value = models.IntegerField(default=0)
    toxicity_duration = models.IntegerField(default=0)
