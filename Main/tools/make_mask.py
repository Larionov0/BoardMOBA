from Main.tools.time_decorator import time_decorator


def make_game_state_mask(game_state):
    return {
        'active_hero_index': game_state.active_hero_index,
        'n': game_state.n, 'm': game_state.m
    }


def make_hero_mask(hero):
    hero_mask = {key: value for key, value in hero.__dict__.items() if not key.startswith('_')}
    hero_mask['img_src'] = hero.hero_obj.img_src
    hero_mask['token_img_src'] = hero.hero_obj.token_img_src

    for key, value in hero.params.__dict__.items():
        if not key.startswith('_') and key != 'id':
            hero_mask[key] = value

    hero_mask['color'] = hero.color
    return hero_mask


def make_heroes_mask(game_state):
    all_heroes = game_state.all_heroes.all()
    heroes_masks = []
    for hero in all_heroes:
        heroes_masks.append(make_hero_mask(hero))
    return heroes_masks


def make_marks_mask(game_state):
    marks = []
    for rule in game_state.marksrule_set.all():
        for mark in rule.generate_marks():
            marks.append(mark.__dict__)
    return marks


def make_mask(game_state, user, local_update_id):
    ui_actions = list(game_state.uiaction_set.filter(update_id__gt=local_update_id).order_by('update_id'))

    if len(ui_actions) == 0:
        return {'blank': True}

    mask = {
        'game_state': make_game_state_mask(game_state),
        'heroes': make_heroes_mask(game_state),
        'team': user.userprofile.team,
        'my_turn': user.userprofile.team == game_state.get_active_hero().team,
        'marks': make_marks_mask(game_state),
        'ui_actions': [action.to_json() for action in ui_actions],
        'update_id': ui_actions[-1].update_id
    }

    return mask
