from django.db import models
from Main.classes.heroes.all_heroes import all_heroes
from .hero_params import HeroParams
from .hero import Hero
from Main.models.skill import Skill
import random
from .ui_action import UIAction


class GameState(models.Model):
    active_hero_index = models.IntegerField(default=0)
    n = models.IntegerField(default=12)
    m = models.IntegerField(default=12)
    update_id = models.IntegerField(default=1)

    def check_if_can_move_to_point(self, i, j):
        pass

    def create_heroes(self, heroes_names: dict):
        self.all_heroes.clear()
        for team, names in heroes_names.items():
            for name in names:
                proto_hero = all_heroes[name]
                base_params = HeroParams.objects.create(
                        max_hp=proto_hero.max_hp,
                        max_energy=proto_hero.max_energy,
                        power=proto_hero.power,
                        armor=proto_hero.armor,
                        magic=proto_hero.magic,
                        attack_range=proto_hero.attack_range,
                        attack_cost=proto_hero.attack_cost,
                    )
                params = base_params
                params.pk = None
                params.save()
                hero = Hero.objects.create(
                    name=name,
                    eng_name=name,
                    game_state=self,
                    team=team,
                    base_params=base_params,
                    params=params,
                    hp=proto_hero.max_hp,
                    energy=proto_hero.max_energy
                )

                for number, skill in enumerate(proto_hero.skills, 1):
                    Skill.objects.create(
                        hero=hero,
                        name=skill.name,
                        cooldown=skill.cooldown,
                        energy=skill.energy,
                        number=number
                    )

    @property
    def userprofiles(self):
        return self.lobby.userprofiles

    def start_game(self, heroes_names={1: ['ren', 'arny'], 2: ['emma', 'karl']}):  # {1: ['ren', 'arny'], 2: ['emma', 'karl']}
        self.uiaction_set.all().delete()
        userprofiles = self.userprofiles.all()
        u1, u2 = userprofiles[0], userprofiles[1]
        u1.team = 1
        u1.save()

        u2.team = 2
        u2.save()

        self.create_heroes(heroes_names)

        all_heroes = list(self.all_heroes.all())
        random.shuffle(all_heroes)
        for i, hero in enumerate(all_heroes):
            hero.global_index = i
            hero.save()

        for team in [1, 2]:
            team_heroes = list(self.all_heroes.filter(team=team))
            random.shuffle(team_heroes)
            for i, hero in enumerate(team_heroes):
                hero.index = i
                hero.save()

        all_heroes = list(self.all_heroes.all())
        for hero in all_heroes:
            hero.set_random_coords(self.n, self.m)

        self.create_ui_redraw()

        self.get_active_hero().before_move()

    def create_ui_action(self, type, target_id=0, duration=0.3):
        self.uiaction_set.create(type=type, target_id=target_id, duration=duration)

    def create_ui_redraw(self):
        return self.create_ui_action('redraw', duration=0.1)

    def get_active_hero(self):
        return self.all_heroes.get(global_index=self.active_hero_index)

    def wasd_pressed(self, dir):
        self.get_active_hero().move(dir)

    def get_all_solid_objects(self):
        return [*list(self.all_heroes.all())]

    def get_solid_obj_by_coords(self, i, j):
        if i<0 or i>=self.n or j<0 or j>=self.m:
            return {'solid': True, 'object': 'wall'}

        objects = [obj for obj in self.get_all_solid_objects() if obj.i == i and obj.j == j]
        if len(objects) == 0:
            return None
        else:
            return objects[0]

    def get_all_creatures(self):
        return [*list(self.all_heroes.all())]

    def get_creature_by_coords(self, i, j):
        obj = self.get_solid_obj_by_coords(i, j)
        if obj and obj.is_creature:
            return obj

    def can_move_to_point(self, i, j):
        if not (0 <= i < self.n and 0 <= j < self.m):
            return False

        if self.get_solid_obj_by_coords(i, j):
            return False

        return True

    def end_turn(self):
        self.get_active_hero().after_move()

        self.active_hero_index += 1
        if self.active_hero_index == self.all_heroes.count():
            self.active_hero_index = 0
        self.save()

        self.get_active_hero().before_move()
        self.create_ui_redraw()

    def cell_rightclicked(self, i, j):
        self.get_active_hero().cell_rightclicked(i, j)

    def cell_clicked(self, i, j):
        self.get_active_hero().cell_clicked(self, i, j)

    def skill_clicked(self, skill_number):
        self.get_active_hero().skill_clicked(self, skill_number)

    def generate_marks_rules(self):
        return self.get_active_hero().generate_base_marks_rules()

    def clear_all_marks_rules(self):
        self.marksrule_set.all().delete()
