from django.db import models


class Skill(models.Model):
    hero = models.ForeignKey("Hero", models.CASCADE, related_name='skills')
    name = models.CharField(max_length=40)
    cooldown = models.IntegerField(default=1)
    cur_cooldown = models.IntegerField(default=0)
    energy = models.IntegerField(default=1)
    chosen = models.BooleanField(default=False)
    phase = models.PositiveIntegerField(default=0)

    @property
    def skill_obj(self):
        return self.hero.hero_obj.skills_dict[self.name]

    @property
    def img_src(self):
        return
