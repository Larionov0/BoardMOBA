from django.db import models
from Main.classes.marks_generator import MarksGenerator
from Main.classes.heroes.all_heroes import all_heroes
from .hero_params import HeroParams
import random
from Main.tools.math_tools import distance
from Main.models.marks_rule import *
from Main.models.effects.all_effects import *
from django.contrib.contenttypes.models import ContentType
from numpy import array

from Main.models.unit import Unit


class Hero(Unit):
    is_creature = True

    name = models.CharField(default='Hero', max_length=30)
    eng_name = models.CharField(default='Hero', max_length=30)

    index = models.IntegerField(default=0)
    global_index = models.IntegerField(default=0)

    base_params = models.OneToOneField('HeroParams', on_delete=models.PROTECT, related_name='base_hero')
    params = models.OneToOneField('HeroParams', on_delete=models.PROTECT, related_name='hero')

    game_state = models.ForeignKey('GameState', on_delete=models.CASCADE, blank=True, null=True,
                                   related_name='all_heroes')

    @property
    def hero_obj(self):
        return all_heroes[self.name]

    def generate_base_marks_rules(self):
        self.game_state.clear_all_marks_rules()
        MarksRule.objects.create(
            marks_form=Circle.objects.create(
                i=self.i, j=self.j,
                r=self.energy // (self.params.slowdown+1),
                color='rgba(0, 200, 50, 0.2)'
            ),
            name='move',
            game_state=self.game_state
        )
        if self.params.can_autoattack and self.energy >= self.params.attack_cost:
            MarksRule.objects.create(
                marks_form=Circle.objects.create(
                    i=self.i, j=self.j,
                    r=self.params.attack_range, color='rgba(255, 0, 0, 0.2)'
                ),
                name='attack',
                game_state=self.game_state
            )

    def cell_rightclicked(self, i, j):
        if self.params.can_autoattack:
            self.try_make_autoattack(i, j)

    def skill_clicked(self, game_state, skill_number):
        if self.params.silence:
            return
        skill = self.skills.get(number=skill_number)
        if skill.chosen:
            skill.cancel(game_state)
        else:
            if skill.is_available(self):
                skill.chosen = True
                skill.phase = 0
                skill.save()
                skill.run_current_phase(game_state, self, None, None)

    def cell_clicked(self, game_state, i, j):
        skills = self.skills.filter(chosen=True)
        if skills.count() == 0:
            return
        else:
            skills[0].run_current_phase(game_state, self, i, j)

    def __str__(self):
        return f"Hero {self.name} ({self.game_state.id})"
