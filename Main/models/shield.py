from django.db import models


class Shield(models.Model):
    hero = models.ForeignKey('Hero', on_delete=models.CASCADE, related_name='shields')
    caster = models.ForeignKey('Hero', on_delete=models.SET_NULL, null=True, related_name='my_shields')
    duration = models.IntegerField()
    value = models.IntegerField()
    max_value = models.IntegerField()
    armor = models.IntegerField()
    is_alive = models.BooleanField(default=True)

    def get_damage(self, damage):
        self.value -= damage - self.armor
        self.save()
        if self.value > 0:
            return 0

        elif self.value == 0:
            self.is_alive = False
            self.save()
            return 0

        else:
            self.is_alive = False
            self.save()
            return -self.value

    def decrease_duration(self):
        self.duration -= 1
        if self.duration <= 0:
            self.is_alive = False
        self.save()

    @property
    def caster_name(self):
        return self.caster.name

    def to_dict(self):
        return {'description': self.gen_description()}

    def gen_description(self):
        return f"Щит HP={self.value}/{self.max_value} | на {self.duration} ходов | броня={self.armor}  (наложено: {self.caster_name})"
