from django.db import models


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
        self.json_data = ''
        self.save()


class GameState(models.Model):
    active_hero_index = models.IntegerField(default=0)
    n = models.IntegerField(default=22)
    m = models.IntegerField(default=26)

    def check_if_can_move_to_point(self, i, j):
        pass


class EventLog(models.Model):
    message = models.CharField(max_length=120, default='', blank=True)
    datetime = models.DateTimeField(auto_now=True)


class Hero(models.Model):
    name = models.CharField(default='Hero', max_length=30)
    eng_name = models.CharField(default='Hero', max_length=30)
    img_src = models.CharField(max_length=30, blank=True)
    token_img_src = models.CharField(max_length=30, blank=True)
    i = models.IntegerField(default=0)
    j = models.IntegerField(default=0)

    game_state = models.ForeignKey(GameState, on_delete=models.CASCADE, blank=True, null=True)
    is_proto = models.BooleanField(default=True)

    index = models.IntegerField(default=0)
    global_index = models.IntegerField(default=0)
    team = models.IntegerField(default=1)

    base_params = models.OneToOneField(HeroParams, on_delete=models.PROTECT, related_name='base_hero')
    params = models.OneToOneField(HeroParams, on_delete=models.PROTECT, related_name='hero')

    hp = models.IntegerField(default=0)
    energy = models.IntegerField(default=0)
    attacks_during_turn = models.IntegerField(default=0)
    is_alive = models.BooleanField(default=True)

    # marks
    # effects
    # modificators
    # shields

    @property
    def color(self):
        return 'rgba(0, 0, 255, 0.3)' if self.team == 1 else 'rgba(255, 0, 0, 0.3)'

    def recalc_params(self):
        pass


class HeroParams(models.Model):
    # параметры, которые могут временно изменяться, но потом возвращаются в норму

    max_hp = models.IntegerField(default=0)
    max_energy = models.IntegerField(default=0)
    power = models.IntegerField(default=0)
    armor = models.IntegerField(default=0)
    magic = models.IntegerField(default=0)
    attack_range = models.IntegerField(default=0)
    attack_cost = models.IntegerField(default=0)

    slowdown = models.IntegerField(default=0)
    solidity = models.BooleanField(default=False)
    can_autoattack = models.BooleanField(default=True)
    stun = models.BooleanField(default=False)

    toxicity_value = models.IntegerField(default=0)
    toxicity_duration = models.IntegerField(default=0)


class Skill(models.Model):
    hero = models.ForeignKey(Hero, models.CASCADE, related_name='skills')
    name = models.CharField(max_length=40)
    img_src = models.CharField(max_length=50)
    cooldown = models.IntegerField(default=1)
    cur_cooldown = models.IntegerField(default=0)
    energy = models.IntegerField(default=1)
    description = models.TextField(max_length=200)
    chosen = models.BooleanField(default=False)
