from Main.classes.hero import HeroObj, SkillObj
from Main.models.marks_rule import *


def s1p0(game_state, hero, skill, i=None, j=None):
    game_state.clear_all_marks_rules()
    MarksRule.objects.create(
        marks_rule=Circle.objects.create(
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
        if target and target.team == hero.team:
            points = [
                [hero.i-1, hero.j], [hero.i, hero.j-1],
                [hero.i+1, hero.j], [hero.i, hero.j+1]
            ]
            points.sort(key=lambda point: distance(point, [i, j]))

            for point in points:
                if not game_state.get_solid_obj_by_coords(point[0], point[1]):
                    # cast
                    target.teleport(point[0], point[1])  # FIXME
                    target.get_damage(hero.params.magic)
                    skill.aftercast(game_state, hero)  # FIXME
                    hero.generate_base_marks_rules()
                    game_state.create_ui_redraw()
                    game_state.create_ui_action('damage', target.id)
                    return
            skill.cancel(game_state)
        else:
            skill.cancel(game_state)
    else:
        skill.cancel(game_state)  # FIXME


skill1 = SkillObj('притягивание', 'skill1.png', 3, 3,
                  'Арни щупальцем притягивает к себе любую цель на расстоянии до 5.3 кл и наносит ей [магия] урона.',
                  [s1p0, s1p1])


skill2 = SkillObj('стальная кожа', 'skill2.png', 3, 2,
                  'Арни укрепляет кожу, получая Стойкость[1] (первый удар по нему будет заблокирован в течении хода)',
                  lambda: True)

skill3 = SkillObj('лобокол', 'skill3.png', 4, 3,
                  'Арни бьет лбом по линии перед собой (из 3 кл) в одном из 4 направлений. '
                  'Все враги, стоящие на этой линии, отлетают на 2 кл и получают [магия] урона '
                  'а также замедление[1] на ход. Если враг при отлёте столкнулся с другим героем или стенкой, '
                  'он получает оглушение.',
                  lambda: True)


skill4 = SkillObj('ядовитые щупальца', 'skill4.png', 8, 3,
                  'Арни запускает ядовитые железы, его удары становятся ядовитыми[[магия//2] | 1] '
                  'и он получает улучшение на 3 хода: броня+2 | макс энергия+2 | магия+2',
                  lambda: True)


arny = HeroObj('arny', 60, 6, 5, 2, 8, 1.5, 2, [skill1, skill2, skill3, skill4])
