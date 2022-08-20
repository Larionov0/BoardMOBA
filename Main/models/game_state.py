from django.db import models
from Main.classes.heroes.all_heroes import all_heroes
from .hero_params import HeroParams
from .hero import Hero
from Main.models.skill import Skill
import random
from .ui_action import UIAction
import json
from Main.maps import maps
from Main.tools.geometric_tools import check_is_point_in_square
from Main.models.map_objects.tower import Tower


class GameState(models.Model):
    active_hero_index = models.IntegerField(default=0)
    # n = models.IntegerField(default=12)
    # m = models.IntegerField(default=12)
    update_id = models.IntegerField(default=1)
    map_id = models.IntegerField(default=1)

    active_hero_json = models.TextField(max_length=100, default='{}')  # дополнительные параметры для скиллов активного героя (например, сохранять координаты с одной фазы для использования в другой фазе)

    @property
    def map(self):
        return maps[self.map_id]

    @property
    def alive_towers(self):
        return self.towers.filter(hp__gt=0)

    @property
    def n(self):
        return self.map['n']

    @property
    def m(self):
        return self.map['m']

    @property
    def active_hero_dict(self):
        return json.loads(self.active_hero_json)

    @active_hero_dict.setter
    def active_hero_dict(self, dct):
        self.active_hero_json = json.dumps(dct)
        self.save()

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
        self.setup_heroes()
        self.create_towers()

        self.create_ui_redraw()

        self.get_active_hero().before_move()

    def setup_heroes(self):
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

    def create_towers(self):
        for team in [1, 2]:
            for number in [1, 2]:
                Tower.objects.create(team=team, number=number, hp=Tower.HP_DICT[number], game_state=self)

    def create_ui_action(self, type, target_id=0, duration=0.3):
        self.uiaction_set.create(type=type, target_id=target_id, duration=duration)

    def create_ui_redraw(self):
        return self.create_ui_action('redraw', duration=0.1)

    def get_active_hero(self):
        return self.all_heroes.get(global_index=self.active_hero_index)

    def wasd_pressed(self, dir):
        self.get_active_hero().move(dir)

    def _get_all_solid_objects(self):
        return [*list(self.all_heroes.all())]

    def get_solid_obj_by_coords(self, i, j):
        if i<0 or i>=self.n or j<0 or j>=self.m:
            return {'solid': True, 'object': 'wall'}
        for wall_cluster in self.map['walls']:
            if check_is_point_in_square(i, j, wall_cluster):
                return {'solid': True, 'object': 'wall'}

        for tower in self.alive_towers:
            if i in [tower.i, tower.i+1] and j in [tower.j, tower.j+1]:
                return tower

        objects = [obj for obj in self._get_all_solid_objects() if obj.i == i and obj.j == j]
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
        # if not (0 <= i < self.n and 0 <= j < self.m):
        #     return False

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
