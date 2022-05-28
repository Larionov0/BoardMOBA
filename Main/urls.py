from django.urls import path
from .views import *


urlpatterns = [
    path('game/', game),

    path('lobbies/', lobbies_view, name='lobbies_view'),
    path('enter_lobby/<int:lobby_id>/', enter_lobby, name='enter_lobby'),
    path('exit_lobby/', exit_lobby, name='exit_lobby'),
    path('check_game_start/', check_game_start, name='check_game_start'),

    path('get_mask/', get_mask),
    path('wasd/', wasd),
    path('end_turn/', end_turn),
    path('cell_rightclicked/', cell_rightclicked),
    path('cell_clicked/', cell_clicked),
    path('skill_clicked/', skill_clicked)
]

