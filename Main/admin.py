from django.contrib import admin
from .models import *


for model in [Lobby, GameState, Hero, Skill, HeroParams]:
    admin.site.register(model)
