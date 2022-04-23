def make_game_state_mask(game_state):
    return {
        'active_hero_index': game_state.active_hero_index,
        'n': game_state.n, 'm': game_state.m
    }


def make_hero_mask(hero):
    return {key: value for key, value in hero.__dict__.items() if not key.startswith('_')}


def make_heroes_mask(game_state):
    all_heroes = game_state.all_heroes.all()
    heroes_masks = []
    for hero in all_heroes:
        heroes_masks.append(make_hero_mask(hero))
    return heroes_masks


def make_mask(game_state):
    mask = {
        'game_state': make_game_state_mask(game_state),
        'heroes': make_heroes_mask(game_state)
    }

    return mask


