from Main.tools.time_decorator import time_decorator
from django.contrib.contenttypes.models import ContentType
from Main.models.effects.all_effects import DelayedDamage


def make_game_state_mask(game_state):
    return {
        'active_hero_index': game_state.active_hero_index,
        'map': game_state.map,
        'towers': [tower.to_dict() for tower in game_state.alive_towers],
        'minions': make_minions_mask(game_state),
    }


def make_hero_mask(hero):
    hero_mask = {key: value for key, value in hero.__dict__.items() if not key.startswith('_')}
    hero_mask['img_src'] = hero.hero_obj.img_src
    hero_mask['token_img_src'] = hero.hero_obj.token_img_src
    hero_mask['i'] = hero.i
    hero_mask['j'] = hero.j

    for key, value in hero.params.__dict__.items():
        if not key.startswith('_') and key != 'id':
            hero_mask[key] = value

    hero_mask['color'] = hero.color
    hero_mask['skills'] = [skill.to_dict() for skill in hero.skills.all()]

    hero_mask['effects'] = [effect_link.to_dict() for effect_link in hero.alive_effects]
    hero_mask['my_effects'] = [effect_link.to_dict() for effect_link in hero.alive_my_effects]
    hero_mask['shields'] = [shield.to_dict() for shield in hero.alive_shields]
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


def make_dop_marks_mask(game_state):
    dop_marks = {}
    for hero in game_state.all_heroes.all():
        for dd_link in hero.effects.filter(effect_table=ContentType.objects.get_for_model(DelayedDamage).id, is_alive=True):
            dop_marks[dd_link.effect.id] = [mark.__dict__ for mark in dd_link.effect.gen_marks(dd_link)]
    return dop_marks


def make_minions_mask(game_state):
    return [minion.to_dict() for minion in game_state.all_minions.all()]


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
        'dop_marks': make_dop_marks_mask(game_state),
        'ui_actions': [action.to_json() for action in ui_actions],
        'update_id': ui_actions[-1].update_id,
    }

    return mask
