from Main.classes.hero import HeroObj, SkillObj
from Main.models.shield import Shield


skill1 = SkillObj('бросок топора', 'skill1.png', 2, 2,
                  'Карл бросает топор в выбранного врага в радиусе 4 кл. '
                  'Топор наносит урон = силе и накладывает замедление[1] на ход',
                  lambda: True)


def s2p0(game_state, hero, skill, i=None, j=None):
    hero.get_shield(Shield.objects.create(
        hero=hero,
        caster=hero,
        duration=1,
        value=7 + hero.params.magic,
        max_value=7 + hero.params.magic,
        armor=0
    ))
    skill.aftercast(game_state, hero)


skill2 = SkillObj('крепкая стойка', 'skill2.png', 3, 1,
                  'Карл встает в крепкую стойку и получает щит[7 + [магия]] на ход',
                  [s2p0])

skill3 = SkillObj('размах', 'skill3.png', 3, 3,
                  'Карл одним размахом наносит [сила + магия] урона всем окружающим врагам и отталкивает их',
                  lambda: True)


skill4 = SkillObj('Добивание', 'skill4.png', 7, 4,
                  'Карл прыгает к врагу на расстоянии до 3х клеток и наносит рассекающий удар с уроном = [сила] + [магия] * 5 и оставляет кровотечение[3]',
                  lambda: True)


karl = HeroObj('karl', 50, 6, 7, 1, 3, 1.5, 2, [skill1, skill2, skill3, skill4])
