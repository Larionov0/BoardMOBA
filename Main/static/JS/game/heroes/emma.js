import { Hero } from "../classes/game_objects/hero.js";
import { marks_generator } from "../classes/marks_generator.js";
import { Skill } from "../classes/skill.js";
import { DelayedDamage } from "../effects/delayed_damage.js";
import { Poison } from "../effects/poison.js";
import { Slowdown } from "../effects/slowdown.js";
import { Toxicity } from "../effects/toxicity.js";
import { distance, get_vector, get_perp_vectors, calc_point } from "../tools/math_tools.js";
import { Upgrades } from "../classes/upgrades.js";


var skill1 = new Skill('подскок', 'skill1.png', 3, 1, 'Эмма перепрыгивает припятствия и приземляется на расстоянии до 2х клеток от себя, отравляя[[magic]|2] следующую автоатаку',
    (game_state, hero, skill)=>{
        hero.clear_dop_marks_generators()
        hero.dop_marks_generators['skill1'] = (game_state, hero)=>{
            return marks_generator.generate_circle(hero.i, hero.j, 2, 'rgba(0, 100, 0, 0.2)')
        }

        game_state.after_action()

        hero.left_click_listener = (i, j, game_state, hero)=>{
            if (distance([i, j], hero.coords) <= 2 && hero.check_if_can_move_to_point(game_state, i, j)){
                hero.i = i; hero.j = j

                hero.get_effect(new Toxicity(hero, game_state, 1, hero, null, 2, (tox)=>tox.caster.magic))
                skill.standard_aftercast(game_state, hero)
                game_state.after_action()
            } else {
                hero.cancel_skill()
            }
        }
    }
)


var skill2 = new Skill('тяжелый болт', 'skill2.png', 4, 2, 'Эмма выстреливает тяжелым болтом по прямой до 3 кл. Первая цель на пути получает [magic * 2] урона и отталкивается на 3 клетки, получая замедление[1|1]. Если цель влетает во что-то, она получает удвоенный урон. Более того, если цель влетает в другого врага, тот получает те же эффекты', 
(game_state, hero, skill)=>{
    hero.clear_dop_marks_generators()
    hero.dop_marks_generators['skill1'] = (game_state, hero)=>{
        // return marks_generator.generate_circle(hero.i, hero.j, 1, 'rgba(100, 0, 0, 0.2)')
        return [
            ...marks_generator.generate_line(hero.coords, [hero.i-3, hero.j], 'rgba(100, 0, 0, 0.2)'),
            ...marks_generator.generate_line(hero.coords, [hero.i, hero.j+3], 'rgba(100, 0, 0, 0.2)'),
            ...marks_generator.generate_line(hero.coords, [hero.i+3, hero.j], 'rgba(100, 0, 0, 0.2)'),
            ...marks_generator.generate_line(hero.coords, [hero.i, hero.j-3], 'rgba(100, 0, 0, 0.2)'),
        ]
    }

    game_state.after_action()

    hero.left_click_listener = (i, j, game_state, hero)=>{
        let d = distance([i, j], hero.coords)
        if (0<d && d<=3 && (i==hero.i || j==hero.j)){
            let vector = get_vector(hero.coords, [i, j])
            vector = vector.map((coord)=>{if (coord==0) return coord; else return coord / Math.abs(coord)})

            let bolt = [hero.i, hero.j]
            for (let i=0; i<3; i++){
                bolt = calc_point(bolt, vector)
                let target = game_state.find_obj_by_coords(bolt[0], bolt[1], true)
                if (target !== null){
                    target.get_damage(hero.magic * 2, hero)
                    target.be_attacked_animation()
                    target.get_effect(new Slowdown(target, game_state, 1, hero, 1))
                    skill.standard_aftercast(game_state, hero)

                    let result = target.be_pushed_in_line(vector, 3)
                    if (result !== true){
                        setTimeout(()=>{
                            game_state.after_action()

                            target.get_damage(hero.magic * 2, hero)
                            target.be_attacked_animation()

                            if (result instanceof Hero && result.team!=hero.team){
                                result.get_damage(hero.magic, hero)
                                result.be_attacked_animation()
                                result.get_effect(new Slowdown(target, game_state, 1, hero, 1))
                            }

                            setTimeout(()=>{game_state.after_action()}, 300)
                        }, 300)
                    } else {
                        setTimeout(()=>{ game_state.after_action() }, 300)
                    }
                    break
                }
            }
        } else {
            hero.cancel_skill()
        }
    }
})


var cast_skill3 = (i, j, game_state, hero, skill, generator)=>{
    let marks = hero.dop_marks_generators['skill1'](game_state, hero)
    for (let mark of marks){
        let target = game_state.find_obj_by_coords(mark.i, mark.j, true)
        if (target && target.team != hero.team){
            target.get_damage(hero.power, hero)
            target.get_effect(new Poison(target, game_state, hero, hero.magic, 2))
            target.be_attacked_animation()
        }
    }

    skill.standard_aftercast(game_state, hero)
    setTimeout(()=>{game_state.after_action()}, 300)
}


var skill3 = new Skill('болт с неба', 'skill3.png', 3, 3, 'Выберите точку в радиусе 4.3 кл. В неё падает небесный болт, образуя кратер в форме плюса. Каждый враг в этой зоне получает [сила] урона и отравление[[магия]|2]',
(game_state, hero, skill)=>{
    hero.clear_dop_marks_generators()
    hero.dop_marks_generators['skill1'] = (game_state, hero)=>{
        return marks_generator.generate_circle(hero.i, hero.j, 4.3, 'rgba(200, 0, 0, 0.1)')
    }

    game_state.after_action()

    hero.left_click_listener = (i, j, game_state, hero)=>{
        if (distance([i, j], hero.coords)<=4.3){
            hero.dop_marks_generators['skill1'] = (game_state, hero)=>{
                return marks_generator.generate_circle(i, j, 1, 'rgba(200, 0, 0, 0.2)')
            }

            game_state.after_action()

            var si=i; var sj=j
            hero.left_click_listener = (i, j, game_state, hero)=>{
                if (si==i && sj==j){

                    cast_skill3(i, j, game_state, hero, skill)
                } else { hero.cancel_skill() }
            }

        } else {hero.cancel_skill()}
    }
})

var skill4 = new Skill('приговор', 'skill4.png', 8, 5, 'Эмма прицеливается во врага на расстоянии до 6клб замедляя[1] его, и в начале своего след хода совершает выстрел, нанося [сила*2]+[магия*3] урона. Если цель погибает, Емма восстанавливает 15 здоровья. Сбить прицел может только оглушение или перемещение цели за 8 кл.', 
(game_state, hero, skill)=>{
    hero.clear_dop_marks_generators()
    hero.dop_marks_generators['skill1'] = (game_state, hero)=>{
        return [
            ...marks_generator.generate_circle(hero.i, hero.j, 8, 'rgba(0, 0, 100, 0.1)'),
            ...marks_generator.generate_circle(hero.i, hero.j, 6, 'rgba(200, 0, 0, 0.3)')
        ]
    }

    game_state.after_action()

    hero.left_click_listener = (i, j, game_state, hero)=>{
        if (distance(hero.coords, [i, j]) <= 6){
            const target_hero = game_state.find_hero_by_coords(i, j)
            if (target_hero && target_hero.team != hero.team){
                target_hero.get_effect(new DelayedDamage(game_state, target_hero, hero, hero.power*2+hero.magic*3, 1, ['stun'], 8,
                                        [], (delayed)=>{
                                            if (delayed.hero.is_alive==false){
                                                delayed.caster.heal(15)
                                            }
                                        }))
                target_hero.get_effect(new Slowdown(target_hero, game_state, 1, hero, 1))
                skill.standard_aftercast(game_state, hero)
                game_state.after_action()
            }
        } else {hero.cancel_skill()}
    }
})


var emma = ()=> new Hero({
    name: 'эмма',
    eng_name: 'emma',
    img_src: 'emma/emma.png',
    is_proto: true, initiative: 0, i:0, j:0,
    // hp: 40,
    // power: 8,
    // energy: 6,
    // armor: 0,
    // magic: 3,
    // attack_range: 3.5,
    color: 'blue',
    token_img_src: 'emma_token.png',
    skills: [
        skill1,
        skill2,
        skill3,
        skill4
    ],
    upgrades: new Upgrades({
        max_hp: [{cost: 0, value: 40}, {cost: 25, value: 50}, {cost: 25, value: 60}],
        max_energy: [{cost: 0, value: 6}, {cost: 25, value: 7}],
        power: [{cost: 0, value: 8}, {cost: 30, value: 10}, {cost: 30, value: 12}],
        armor: [{cost: 0, value: 0}, {cost: 30, value: 1}],
        magic: [{cost: 0, value: 3}, {cost: 30, value: 5}, {cost: 30, value: 7}],
        attack_range: [{cost: 0, value: 3.5}],
        attack_cost: [{cost: 0, value: 2}]
    })
})


export {emma}