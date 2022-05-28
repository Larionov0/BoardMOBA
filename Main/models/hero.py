from django.db import models
from Main.classes.marks_generator import MarksGenerator
from Main.classes.heroes.all_heroes import all_heroes
from .hero_params import HeroParams
import random
from Main.tools.math_tools import distance
from Main.models.marks_rule import *


class Hero(models.Model):
    is_creature = True

    name = models.CharField(default='Hero', max_length=30)
    eng_name = models.CharField(default='Hero', max_length=30)
    i = models.IntegerField(default=0)
    j = models.IntegerField(default=0)

    game_state = models.ForeignKey('GameState', on_delete=models.CASCADE, blank=True, null=True, related_name='all_heroes')
    # is_proto = models.BooleanField(default=True)

    index = models.IntegerField(default=0)
    global_index = models.IntegerField(default=0)
    team = models.IntegerField(default=1)

    base_params = models.OneToOneField('HeroParams', on_delete=models.PROTECT, related_name='base_hero')
    params = models.OneToOneField('HeroParams', on_delete=models.PROTECT, related_name='hero')

    hp = models.IntegerField(default=0)
    energy = models.IntegerField(default=0)
    attacks_during_turn = models.IntegerField(default=0)
    is_alive = models.BooleanField(default=True)

    @property
    def hero_obj(self):
        return all_heroes[self.name]

    # def generate_move_marks(self):
    #     radius = self.energy // (self.params.slowdown+1)
    #     return MarksGenerator().circle_list(self.i, self.j, radius, color='rgba(0, 200, 50, 0.2)')
    #
    # def generate_attack_marks(self):
    #     marks = []
    #     if self.params.can_autoattack and self.energy >= self.params.attack_cost:
    #         marks = MarksGenerator().circle_list(self.i, self.j, self.params.attack_range, color='rgba(255, 0, 0, 0.2)')
    #     return marks
    #
    # def generate_base_marks(self):
    #     return [*self.generate_move_marks(), *self.generate_attack_marks()]

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

    def set_random_coords(self, n, m):
        self.i = random.randint(0, n-1)
        self.j = random.randint(0, m-1)
        self.save()

    # marks
    # effects
    # modificators
    # shields

    @property
    def color(self):
        return 'rgba(0, 0, 255, 0.3)' if self.team == 1 else 'rgba(255, 0, 0, 0.3)'

    @property
    def coords(self):
        return [self.i, self.j]

    def recalc_params(self):  # FIXME: доделать когда появятся еффекты
        params = self.base_params
        params.pk = None
        params.save()

        self.params = params
        self.save()

        for modifier in self.modifiers.filter(is_alive=True):
            modifier.modify(self.params)

        self.params.can_autoattack = self.attacks_during_turn > 0
        self.params.save()

    def move(self, dir):
        if self.energy > self.params.slowdown:
            i, j = self.i, self.j
            if dir == 'w':
                i -= 1
            elif dir == 'a':
                j -= 1
            elif dir == 's':
                i += 1
            elif dir == 'd':
                j += 1

            if self.game_state.can_move_to_point(i, j):
                self.i = i
                self.j = j

                self.energy -= 1 + self.params.slowdown
                self.save()
                self.generate_base_marks_rules()
                self.game_state.create_ui_redraw()
                return True
        return False

    @property
    def alive_effects(self):
        return self.effects.filter(is_alive=True)

    @property
    def alive_my_effects(self):
        return self.my_effects.filter(is_alive=True)

    def clear_dead_effects(self):
        for effect_link in self.my_effects.filter(is_alive=False):
            effect_link.effect.delete()
        self.my_effects.filter(is_alive=False).delete()

        for effect_link in self.effects.filter(is_alive=False):
            effect_link.effect.delete()
        self.effects.filter(is_alive=False).delete()

    def before_move(self):
        self.energy = self.params.max_energy
        self.attacks_during_turn = 0
        self.recalc_params()
        self.save()

        for effect_link in self.alive_effects:
            effect_link.effect.before_target_move(effect_link)
        for effect_link in self.alive_my_effects:
            effect_link.effect.before_move(effect_link)
        self.clear_dead_effects()

        self.generate_base_marks_rules()

    def after_move(self):
        for skill in self.skills.all():
            skill.after_move(self)

        for effect_link in self.alive_effects:
            effect_link.effect.after_target_move(effect_link)
        for effect_link in self.alive_my_effects:
            effect_link.effect.after_move(effect_link)

        for modifier in self.modifiers.filter(is_alive=True):
            modifier.decrease()
        self.recalc_params()

    def cell_rightclicked(self, i, j):
        if self.params.can_autoattack:
            self.try_make_autoattack(i, j)

    def try_make_autoattack(self, i, j):
        target = self.game_state.get_creature_by_coords(i, j)

        if target is None:
            return False
        if self.energy < self.params.attack_cost:
            return False
        if self.team == target.team:
            return False
        if distance(self.coords, target.coords) > self.params.attack_range:
            return False

        self.make_autoattack(target)
        return True

    def make_autoattack(self, target):
        target.get_damage(self.params.power)
        self.energy -= self.params.attack_cost
        self.attacks_during_turn += 1
        self.save()
        self.recalc_params()
        self.game_state.create_ui_action('damage', target.id, duration=0.3)

        self.recalc_params()

        self.generate_base_marks_rules()
        self.game_state.create_ui_redraw()

    def get_damage(self, damage):
        remaining_damage = damage - self.params.armor
        if remaining_damage > 0:
            self.loose_hp(remaining_damage)

    def loose_hp(self, damage):
        self.hp -= damage
        self.save()
        if self.hp <= 0:
            self.die()

    def die(self):
        self.is_alive = False
        self.i = -1
        self.j = -1
        self.save()

    def skill_clicked(self, game_state, skill_number):
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

    def get_effect(self, effect_link):
        effect_link.effect.on_getting(effect_link)
        self.recalc_params()

    def get_modifier(self, modifier, recalc=True):
        if recalc:
            self.recalc_params()

    def teleport(self, i, j):
        self.i = i
        self.j = j
        self.save()

    def __str__(self):
        return f"Hero {self.name} ({self.game_state.id})"
