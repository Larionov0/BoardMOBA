from django.contrib import admin
from .models import *
from Main.models.effects.all_effects import all_effects


for model in [Lobby, GameState, Hero, Skill, HeroParams, UIAction, Circle, Rectangle, Line, MarksRule, EffectLink, *all_effects]:
    admin.site.register(model)
