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
        if not key.startswith('_'):
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
    return [mark.__dict__ for mark in game_state.generate_marks()]


def make_mask(game_state, user):
    mask = {
        'game_state': make_game_state_mask(game_state),
        'heroes': make_heroes_mask(game_state),
        'team': user.userprofile.team,
        'my_turn': user.userprofile.team == game_state.get_active_hero().team,
        'marks': make_marks_mask(game_state)
    }

    return mask
