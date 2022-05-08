from django.db import models
import random
from Main.classes.heroes.all_heroes import all_heroes
from Main.tools.math_tools import distance
from Main.classes.marks_generator import MarksGenerator
from .skill import Skill
from .game_state import GameState


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


class EventLog(models.Model):
    message = models.CharField(max_length=120, default='', blank=True)
    datetime = models.DateTimeField(auto_now=True)
