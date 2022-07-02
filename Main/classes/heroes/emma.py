from Main.classes.hero import HeroObj, SkillObj
from Main.models.marks_rule import *
from Main.models.effects.all_effects import *
from Main.models.effects.effect_link import EffectLink


def s1p0(game_state, hero, skill, i=None, j=None):
    game_state.clear_all_marks_rules()
    MarksRule.objects.create(
        marks_form=Circle.objects.create(
            i=hero.i,
            j=hero.j,
            color='rgba(0, 200, 0, 0.1)',
            r=2
        ),
        name='skill1',
        game_state=game_state
    )
    game_state.create_ui_redraw()


def s1p1(game_state, hero, skill, i=None, j=None):
    if distance([i, j], hero.coords) <= 2:
        hero.change_coords(i, j)
        hero.get_effect(EffectLink.objects.create(
            caster=hero,
            hero=hero,
            effect=Toxicity.objects.create(
                value=hero.params.magic,
                poison_duration=2,
                duration=1
            )
        ))

        skill.aftercast(game_state, hero)
    else:
        skill.cancel(game_state)


skill1 = SkillObj('подскок', 'skill1.png', 3, 1,
                  'Эмма перепрыгивает припятствия и приземляется на расстоянии до 2х клеток от себя, '
                  'отравляя[[magic]|2] следующую автоатаку',
                  [s1p0, s1p1])


def s2p0(game_state, hero, skill, i=None, j=None):
    game_state.clear_all_marks_rules()
    d = 3
    vectors = [[d, 0], [0, d], [-d, 0], [0, -d]]
    for vector in vectors:
        MarksRule.objects.create(
            marks_form=Line.objects.create(
                i1=hero.i,
                j1=hero.j,
                i2=hero.i + vector[0],
                j2=hero.j + vector[1],
                color='rgba(0, 0, 200, 0.2)'
            ),
            name='skill1',
            game_state=game_state
        )
    game_state.create_ui_redraw()


def s2p1(game_state, hero, skill, i=None, j=None):
    if distance([i, j], hero.coords) > 3 or not(i == hero.i or j == hero.j):
        return skill.cancel(game_state)

    vector = [i - hero.i, j - hero.j]
    not_null_coord = abs(vector[0] if vector[0] != 0 else vector[1])
    vector[0] /= not_null_coord
    vector[1] /= not_null_coord

    bolt = hero.coords
    for i in range(3):
        bolt[0] += vector[0]
        bolt[1] += vector[1]

        creature = game_state.get_creature_by_coords(*bolt)
        if creature is not None:
            creature.get_damage(hero.params.magic * 2)
            game_state.create_ui_action('damage', creature.id)
            creature.get_effect(EffectLink.objects.create(
                caster=hero,
                hero=creature,
                effect=Slowdown.objects.create(value=1, duration=1)
            ))
            creature.be_pushed(vector, 3, lambda obj: stolknovenie(game_state, hero, skill, creature, obj), redraw=True)
            break

    skill.aftercast(game_state, hero)


def stolknovenie(game_state, hero, skill, creature, obj):
    creature.get_damage(hero.params.magic * 2)
    game_state.create_ui_action('damage', creature.id)

    if obj.is_creature:
        obj.get_damage(hero.params.magic * 2)
        game_state.create_ui_action('damage', obj.id)


skill2 = SkillObj('тяжелый болт', 'skill2.png', 4, 2,
                  'Эмма выстреливает тяжелым болтом по прямой до 3 кл. '
                  'Первая цель на пути получает [magic * 2] урона и отталкивается на 3 клетки, '
                  'получая замедление[1|1]. Если цель влетает во что-то, она получает удвоенный урон. '
                  'Более того, если цель влетает в другого врага, тот получает те же эффекты',
                  [s2p0, s2p1])


def s3p0(game_state, hero, skill, i=None, j=None):
    game_state.clear_all_marks_rules()
    MarksRule.objects.create(
        marks_form=Circle.objects.create(
            i=hero.i,
            j=hero.j,
            color='rgba(200, 0, 0, 0.1)',
            r=4.5
        ),
        name='skill3',
        game_state=game_state
    )
    game_state.create_ui_redraw()


def s3p1(game_state, hero, skill, i, j):
    if distance(hero.coords, [i, j]) > 4.5:
        skill.cancel(game_state)
        return

    game_state.clear_all_marks_rules()
    MarksRule.objects.create(
        name='skill1',
        game_state=game_state,
        marks_form=Circle.objects.create(
            i=i,
            j=j,
            r=1,
            color='rgba(200, 0, 0, 0.2)'
        )
    )
    game_state.create_ui_redraw()
    game_state.active_hero_dict = {'i': i, 'j': j}


def s3p2(game_state, hero, skill, i, j):
    dct = game_state.active_hero_dict
    if i != dct['i'] or j != dct['j']:
        skill.cancel(game_state)
        return

    marks = game_state.marksrule_set.get(name='skill1').generate_marks()
    for mark in marks:
        target = game_state.get_creature_by_coords(mark.i, mark.j)
        if target and target.team != hero.team:
            target.get_damage(hero.params.power)
            target.get_effect(EffectLink.objects.create(
                hero=target,
                caster=hero,
                effect=Poison.objects.create(
                    value=hero.params.magic,
                    duration=2
                )
            ))
            game_state.create_ui_action('damage', target.id)
    skill.aftercast(game_state, hero)


skill3 = SkillObj('болт с неба', 'skill3.png', 3, 3,
                  'Выберите точку в радиусе 4.5 кл. В неё падает небесный болт, образуя кратер в форме плюса. '
                  'Каждый враг в этой зоне получает [сила] урона и отравление[[магия]|2]',
                  [s3p0, s3p1, s3p2])


def s4_end_func(dd_link):
    if dd_link.hero.is_alive is False:
        dd_link.caster.heal(20)


def s4p0(game_state, hero, skill, i=None, j=None):
    game_state.clear_all_marks_rules()
    MarksRule.objects.create(
        name='s4',
        game_state=game_state,
        marks_form=Circle.objects.create(i=hero.i, j=hero.j, r=6, color='rgba(255, 100, 0, 0.2)')
    )
    game_state.create_ui_redraw()


def s4p1(game_state, hero, skill, i, j):
    if distance(hero.coords, [i, j]) > 6:
        skill.cancel(game_state)
        return

    target = game_state.get_creature_by_coords(i, j)
    if target and target.team != hero.team:
        dd = DelayedDamage.objects.create(
                duration=1,
                damage=hero.params.power*2 + hero.params.magic*3,
                stun_cancel=True,
                max_distance=4,
                end_function_index=DelayedDamage.find_index_by_end_func(s4_end_func)
            )

        DelayedDamage_Effects.objects.create(
            delayed_damage=dd,
            effect=Bleeding.objects.create(duration=3)
        )

        target.get_effect(EffectLink.objects.create(
            hero=target,
            caster=hero,
            effect=dd
        ))
        skill.aftercast(game_state, hero)
    else:
        skill.cancel()


skill4 = SkillObj('приговор', 'skill4.png', 8, 5,
                  'Эмма прицеливается во врага на расстоянии до 6кл замедляя[1] его, '
                  'и в начале своего след хода совершает выстрел, нанося [сила*2]+[магия*3] урона. '
                  'Если цель погибает, Емма восстанавливает 15 здоровья. Сбить прицел может только '
                  'оглушение или перемещение цели за 8 кл.',
                  [s4p0, s4p1])


emma = HeroObj('emma', 40, 6, 8, 0, 3, 3.5, 2, [skill1, skill2, skill3, skill4])
DelayedDamage.add_end_function(s4_end_func)
