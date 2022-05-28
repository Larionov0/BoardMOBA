from Main.classes.hero import HeroObj, SkillObj
from Main.models.marks_rule import *
from Main.models.effects.all_effects import *
from Main.models.effects.effect_link import EffectLink


skill1 = SkillObj('подскок', 'skill1.png', 3, 1,
                  'Эмма перепрыгивает припятствия и приземляется на расстоянии до 2х клеток от себя, '
                  'отравляя[[magic]|2] следующую автоатаку',
                  lambda: True)


skill2 = SkillObj('тяжелый болт', 'skill2.png', 4, 2,
                  'Эмма выстреливает тяжелым болтом по прямой до 3 кл. '
                  'Первая цель на пути получает [magic * 2] урона и отталкивается на 3 клетки, '
                  'получая замедление[1|1]. Если цель влетает во что-то, она получает удвоенный урон. '
                  'Более того, если цель влетает в другого врага, тот получает те же эффекты',
                  lambda: True)


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
    hero.generate_base_marks_rules()
    skill.aftercast(game_state, hero)
    game_state.create_ui_redraw()


skill3 = SkillObj('болт с неба', 'skill3.png', 3, 3,
                  'Выберите точку в радиусе 4.5 кл. В неё падает небесный болт, образуя кратер в форме плюса. '
                  'Каждый враг в этой зоне получает [сила] урона и отравление[[магия]|2]',
                  [s3p0, s3p1, s3p2])


skill4 = SkillObj('приговор', 'skill4.png', 8, 5,
                  'Эмма прицеливается во врага на расстоянии до 6клб замедляя[1] его, '
                  'и в начале своего след хода совершает выстрел, нанося [сила*2]+[магия*3] урона. '
                  'Если цель погибает, Емма восстанавливает 15 здоровья. Сбить прицел может только '
                  'оглушение или перемещение цели за 8 кл.',
                  lambda: True)


emma = HeroObj('emma', 40, 6, 8, 0, 3, 3.5, 2, [skill1, skill2, skill3, skill4])
