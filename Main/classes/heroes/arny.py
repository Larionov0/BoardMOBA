from Main.classes.hero import HeroObj, SkillObj
from Main.models.marks_rule import *
from Main.models.effects.all_effects import *
from Main.models.effects.effect_link import EffectLink
from Main.models.modifier import Modifier
from numpy import array


def s1p0(game_state, hero, skill, i=None, j=None):
    game_state.clear_all_marks_rules()
    MarksRule.objects.create(
        marks_form=Circle.objects.create(
            i=hero.i, j=hero.j,
            r=5.3, color='rgba(0, 0, 100, 0.1)'
        ),
        name='skill1',
        game_state=game_state
    )
    game_state.create_ui_redraw()


def s1p1(game_state, hero, skill, i=None, j=None):
    if distance(hero.coords, [i, j]) <= 5.3:
        target = game_state.get_creature_by_coords(i, j)
        if target and target.team != hero.team:
            points = [
                [hero.i-1, hero.j], [hero.i, hero.j-1],
                [hero.i+1, hero.j], [hero.i, hero.j+1]
            ]
            points.sort(key=lambda point: distance(point, [i, j]))

            for point in points:
                if not game_state.get_solid_obj_by_coords(point[0], point[1]):
                    # cast
                    target.teleport(point[0], point[1])
                    target.get_damage(hero.params.magic)

                    skill.aftercast(game_state, hero)
                    game_state.create_ui_action('damage', target.id)
                    game_state.create_ui_redraw()
                    return
            skill.cancel(game_state)
        else:
            skill.cancel(game_state)
    else:
        skill.cancel(game_state)


skill1 = SkillObj('притягивание', 'skill1.png', 3, 3,
                  'Арни щупальцем притягивает к себе любую цель на расстоянии до 5.3 кл и наносит ей [магия] урона.',
                  [s1p0, s1p1])


def s2p0(game_state, hero, skill, i=None, j=None):
    hero.get_effect(EffectLink.objects.create(
        hero=hero,
        caster=hero,
        effect=Solidity.objects.create(
            duration=1
        )
    ))
    skill.aftercast(game_state, hero)
    # hero.generate_base_marks_rules()
    game_state.create_ui_redraw()


skill2 = SkillObj('стальная кожа', 'skill2.png', 3, 2,
                  'Арни укрепляет кожу, получая Стойкость[1] (первый удар по нему будет заблокирован в течении хода)',
                  [s2p0])


def s3p0(game_state, hero, skill, i=None, j=None):
    game_state.clear_all_marks_rules()
    MarksRule.objects.create(
        marks_form=Circle.objects.create(
            i=hero.i, j=hero.j,
            r=1, color='rgba(0, 0, 100, 0.2)'
        ),
        name='skill3',
        game_state=game_state
    )
    game_state.create_ui_redraw()


def s3p1(game_state, hero, skill, i=None, j=None):
    game_state.clear_all_marks_rules()
    if distance([i, j], hero.coords) == 1:
        vector = array([i, j]) - hero.coords  # [i - hero.i, j - hero.j]
        c_point = hero.coords + vector
        vector1 = array([vector[1], vector[0]])
        vector2 = array([-vector[1], -vector[0]])
        point1 = c_point + vector1
        point2 = c_point + vector2
        userprofile = hero.userprofile
        userprofile.short_info = f'{c_point[0]} {c_point[1]}'
        userprofile.save()
        MarksRule.objects.create(
            marks_form=Line.objects.create(i1=point1[0], j1=point1[1], i2=point2[0], j2=point2[1],
                                           color=f"rgba(0, 0, 100, 0.2)"),
            name='skill3',
            game_state=game_state
        )
        game_state.create_ui_redraw()
    else:
        skill.cancel(game_state)


def s3p2(game_state, hero, skill, i=None, j=None):
    c_point = array(list(map(int, hero.userprofile.short_info.split(' '))))
    if [i, j] == list(c_point):
        vector = array([i, j]) - hero.coords
        vector1 = array([vector[1], vector[0]])
        vector2 = array([vector[1], -vector[0]])
        point1 = c_point + vector1
        point2 = c_point + vector2

        for point in [c_point, point1, point2]:
            target = game_state.get_creature_by_coords(*point)
            if target is not None and target.team != hero.team:
                target.get_damage(hero.params.magic)
                target.get_effect(EffectLink.objects.create(
                    caster=hero,
                    hero=target,
                    effect=Slowdown.objects.create(
                        duration=1,
                        value=1
                    )
                ))
                game_state.create_ui_action('damage', target.id)
                target.be_pushed(vector, 2, lambda obj: s3_stolknovenie(obj, game_state, hero, skill, target), redraw=True)
                skill.aftercast(game_state, hero)
    else:
        skill.cancel(game_state)


def s3_stolknovenie(obj, game_state, hero, skill, target):
    target.get_effect(EffectLink.objects.create(
        caster=hero,
        hero=target,
        effect=Stun.objects.create(
            duration=1
        )
    ))
    game_state.create_ui_action('damage', target.id)


skill3 = SkillObj('лобокол', 'skill3.png', 4, 3,
                  'Арни бьет лбом по линии перед собой (из 3 кл) в одном из 4 направлений. '
                  'Все враги, стоящие на этой линии, отлетают на 2 кл и получают [магия] урона '
                  'а также замедление[1] на ход. Если враг при отлёте столкнулся с другим героем или стенкой, '
                  'он получает оглушение.',
                  [s3p0, s3p1, s3p2])


def s4p0(game_state, hero, skill, i=None, j=None):
    hero.get_modifier(Modifier.objects.create(
        hero=hero,
        param_name='armor',
        value=2,
        duration=3
    ))
    hero.get_modifier(Modifier.objects.create(
        hero=hero,
        param_name='max_energy',
        value=2,
        duration=3
    ))
    hero.get_modifier(Modifier.objects.create(
        hero=hero,
        param_name='magic',
        value=2,
        duration=3
    ))

    hero.get_effect(EffectLink.objects.create(
        hero=hero,
        caster=hero,
        effect=Toxicity.objects.create(
            duration=3,
            value=hero.params.magic // 2,
            poison_duration=1
        )
    ))

    skill.aftercast(game_state, hero)


skill4 = SkillObj('ядовитые щупальца', 'skill4.png', 8, 3,
                  'Арни запускает ядовитые железы, его удары становятся ядовитыми[[магия//2] | 1] '
                  'и он получает улучшение на 3 хода: броня+2 | макс энергия+2 | магия+2',
                  [s4p0])


arny = HeroObj('arny', 60, 6, 5, 2, 8, 1.5, 2, [skill1, skill2, skill3, skill4])
