from django.db import models
from django.contrib.auth.models import User


class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='userprofile')
    team = models.IntegerField(default=0)  # 1 / 2
    points = models.IntegerField(default=0)
    wins = models.IntegerField(default=0)
    losses = models.IntegerField(default=0)
    lobby = models.ForeignKey('Main.Lobby', on_delete=models.SET_NULL, blank=True, null=True, related_name='userprofiles')
    short_info = models.CharField(max_length=50, default='', blank=True)  # используется для сохранения промежуточной инфы во время боя. (напр. точка, выбранная в прошлой фазе умения (как у арни))

    @classmethod
    def create_from_user(cls, user):
        return cls.objects.create(user=user)

    def exit_lobby(self):
        if self.lobby:
            self.lobby.end_game()
            self.lobby = None
            self.save()

    def __str__(self):
        return f"Profile {self.user}"
