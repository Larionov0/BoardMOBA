from django.shortcuts import render, HttpResponse
from django.http.response import JsonResponse
from django.contrib.auth.decorators import login_required
from .models import *
from django.shortcuts import redirect
from Main.tools.make_mask import make_mask


def hero_move(request, dir):
    pass


def get_mask(request):
    return JsonResponse(make_mask(request.user.userprofile.lobby.game_state))


def set_mask(request):
    if request.method == 'POST':
        request.user.userprofile.lobby.json_data = request.body.decode('utf-8')
        request.user.userprofile.lobby.save()
        return JsonResponse({'ok': True})


def game(request):
    user = request.user
    return render(request, 'index.html', {'team': list(user.userprofile.lobby.userprofiles.all()).index(user.userprofile) + 1})


# Create your views here.
@login_required
def lobbies_view(request):
    request.user.userprofile.exit_lobby()
    return render(request, 'lobbies.html', {'lobbies': Lobby.objects.all()})


def enter_lobby(request, lobby_id):
    lobby = Lobby.objects.get(id=lobby_id)
    if lobby.userprofiles.count() == 2:
        return HttpResponse('Здесь уже 2 игрока')
    elif lobby.userprofiles.count() == 1 and lobby.userprofiles.all()[0] != request.user.userprofile:  # старт игры
        request.user.userprofile.lobby = lobby
        request.user.userprofile.save()
        lobby.start_game()
        return redirect('/main/game')
    else:
        request.user.userprofile.lobby = lobby
        request.user.userprofile.save()
        return render(request, 'lobby.html', {'lobby': lobby, 'user': request.user})


def exit_lobby(request):
    request.user.userprofile.exit_lobby()
    return redirect('/main/lobbies')


def check_game_start(request):
    # print(request.user.userprofile.lobby.userprofiles.count())
    # print(request.user.userprofile.lobby.userprofiles.all())
    return JsonResponse({"start": request.user.userprofile.lobby.userprofiles.count() == 2})
