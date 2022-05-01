from django.db import models
import random
from Main.classes.heroes.all_heroes import all_heroes


class Lobby(models.Model):
    name = models.CharField(max_length=50, default='New lobby')
    password = models.CharField(max_length=50, default='12345')  # я знаю, что нужно хранить хэш пароля. Пока эта функция не реализована
    update_id = models.IntegerField(default=0)
    # active_user = models.ForeignKey(UserProfile, on_delete=models.SET_NULL, null=True, blank=True, related_name='active_lobby')
    game_state = models.OneToOneField('GameState', models.SET_NULL, blank=True, null=True, related_name='lobby')

    def __str__(self):
        return f"{self.name}"

    @property
    def users(self):
        return [profile.user for profile in self.userprofiles.all()]

    def end_game(self):
        # self.remove_all_heroes()
        self.json_data = ''

    def start_game(self):
        self.game_state = GameState.objects.create()
        self.save()
        self.game_state.start_game()


class GameState(models.Model):
    active_hero_index = models.IntegerField(default=0)
    n = models.IntegerField(default=12)
    m = models.IntegerField(default=12)

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
                Hero.objects.create(
                    name=name,
                    eng_name=name,
                    game_state=self,
                    team=team,
                    base_params=base_params,
                    params=params,
                    hp=proto_hero.max_hp,
                    energy=proto_hero.max_energy
                )

    @property
    def userprofiles(self):
        return self.lobby.userprofiles

    def start_game(self, heroes_names={1: ['ren', 'arny'], 2: ['emma', 'karl']}):  # {1: ['ren', 'arny'], 2: ['emma', 'karl']}
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

        self.get_active_hero().before_move()

    def get_active_hero(self):
        return self.all_heroes.get(global_index=self.active_hero_index)

    def wasd_pressed(self, dir):
        self.get_active_hero().move(dir)

    def get_all_solid_objects(self):
        return [*list(self.all_heroes.all())]

    def get_solid_obj_by_coords(self, i, j):
        objects = [obj for obj in self.get_all_solid_objects() if obj.i == i and obj.j == j]
        if len(objects) == 0:
            return None
        else:
            return objects[0]

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


class EventLog(models.Model):
    message = models.CharField(max_length=120, default='', blank=True)
    datetime = models.DateTimeField(auto_now=True)


class Hero(models.Model):
    name = models.CharField(default='Hero', max_length=30)
    eng_name = models.CharField(default='Hero', max_length=30)
    i = models.IntegerField(default=0)
    j = models.IntegerField(default=0)

    game_state = models.ForeignKey(GameState, on_delete=models.CASCADE, blank=True, null=True, related_name='all_heroes')
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

    def recalc_params(self):
        pass

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
                return True
        return False

    def before_move(self):
        self.energy = self.params.max_energy
        self.save()

    def after_move(self):
        pass


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


class Skill(models.Model):
    hero = models.ForeignKey(Hero, models.CASCADE, related_name='skills')
    name = models.CharField(max_length=40)
    cooldown = models.IntegerField(default=1)
    cur_cooldown = models.IntegerField(default=0)
    energy = models.IntegerField(default=1)
    chosen = models.BooleanField(default=False)

    @property
    def skill_obj(self):
        return self.hero.hero_obj.skills_dict[self.name]

    @property
    def img_src(self):
        return
