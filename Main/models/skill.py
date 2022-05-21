from django.db import models


class Skill(models.Model):
    hero = models.ForeignKey("Hero", models.CASCADE, related_name='skills')
    name = models.CharField(max_length=40)
    cooldown = models.IntegerField(default=1)
    cur_cooldown = models.IntegerField(default=0)
    energy = models.IntegerField(default=1)
    chosen = models.BooleanField(default=False)
    phase = models.PositiveIntegerField(default=0)
    number = models.IntegerField()

    @property
    def skill_obj(self):
        return self.hero.hero_obj.skills_dict[self.name]

    @property
    def img_src(self):
        return

    def is_available(self, hero):
        return hero.energy >= self.energy and self.cur_cooldown == 0

    def run_current_phase(self, game_state, hero, i=None, j=None):
        if self.is_available(hero):
            phase = self.skill_obj.phases[self.phase]
            self.phase += 1
            self.save()
            phase(game_state, hero, self, i, j)

    def cancel(self, game_state):
        self.chosen = False
        self.phase = 0
        game_state.generate_marks_rules()
        game_state.create_ui_redraw()
        self.save()

    def aftercast(self, game_state, hero):  # после успешного запуска
        hero.energy -= self.energy
        hero.save()
        self.cur_cooldown = self.cooldown + 1
        self.save()
        self.cancel(game_state)

    def to_dict(self):
        dct = {key: value for key, value in self.__dict__.items() if not key.startswith('_') and key not in ['hero', 'phase']}
        obj = self.skill_obj
        dct['img_src'] = obj.img_src
        dct['description'] = obj.description
        return dct

    def after_move(self, hero):
        if self.cur_cooldown > 0:
            self.cur_cooldown -= 1
            self.save()
