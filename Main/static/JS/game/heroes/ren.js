import { Hero } from "../classes/game_objects/hero.js";
import { Skill } from "../classes/skill.js";
import { DelayedDamage } from "../effects/delayed_damage.js";
import { Silence } from "../effects/silence.js";
import { marks_generator } from "../classes/marks_generator.js";
import { Shield } from "../classes/shield.js";
import { distance, get_vector, get_perp_vectors, calc_point } from "../tools/math_tools.js";
import { Upgrades } from "../classes/upgrades.js";

var skill1 = new Skill('мистический шар', 'skill1.png', 2, 3, 'Рэн запускает мистический шар в выбранного врага на расстоянии до 3.5 кл, нанося тому [магия]+2 урона. Если это убивает миньйона, Рэн восстанавливает 2 энергии.', 
    (game_state, hero, skill)=>{
        hero.clear_dop_marks_generators()
        hero.dop_marks_generators['skill1'] = (game_state, hero)=>{
            return marks_generator.generate_circle(hero.i, hero.j, 3.5, 'rgba(200, 0, 0, 0.2)')
        }

        game_state.after_action()

        hero.left_click_listener = (i, j, game_state, hero)=>{
            if (distance(hero.coords, [i, j]) <= 3.5){
                const target = game_state.find_obj_by_coords(i, j, true)
                if (target && target.team != hero.team){
                    target.get_damage(hero.magic + 2, hero)
                    if (target.is_minion && !target.is_alive){
                        hero.energy += 2
                    }
                    skill.standard_aftercast(game_state, hero)
                    game_state.after_action()
                }
            } else hero.cancel_skill()
        }
    }
)



function cast_skill_2(game_state, hero, skill, center_i, center_j){
    var silence = false
    if (distance(hero.coords, [center_i, center_j]) <= 1.9)
        silence = true
    
    var shield_value = 0
    for (var target of game_state.all_heroes){
        if (distance(target.coords, [center_i, center_j]) <= 1.9){
            shield_value += 3
            if (target.team != hero.team){
                target.get_damage(Math.floor(hero.magic/2), hero)
                if (silence) target.get_effect(new Silence(target, game_state, 1, hero))
                target.be_attacked_animation()
            }
        }
    }

    for (let minion of game_state.minions){
        if (distance(minion.coords, [center_i, center_j]) <= 1.9){
            if (minion.team != hero.team){
                minion.get_damage(Math.floor(hero.magic/2), hero)
                minion.be_attacked_animation()
            }
        }
    }

    if (shield_value > 0){
        hero.get_shield(new Shield(hero, 1, shield_value, 0, hero))
    }
    setTimeout(()=>{
        skill.standard_aftercast(game_state, hero)
        game_state.after_action()
    }, 300)
}


var skill2 = new Skill('защитные духи', 'skill2.png', 3, 3, 'Выберите точку в радиусе 4.5 кл. Рэн призывает духов в квадрат 3 на 3 кл. Каждый враг, задетый духом, получает [магия / 2] урона. За каждого героя, задетого духом, Рэн получает по 3 силы щита. Если Рэн и сам находится в области, все враги получают безмолвие на ход.',
    (game_state, hero, skill)=>{
        hero.clear_dop_marks_generators()
        hero.dop_marks_generators['skill1'] = (game_state, hero)=>{
            return marks_generator.generate_circle(hero.i, hero.j, 4.5, 'rgba(0, 0, 200, 0.2)')
        }

        game_state.after_action()

        hero.left_click_listener = (i, j, game_state, hero)=>{
            if (distance(hero.coords, [i, j]) <= 4.5){
                var center_i = i; var center_j = j
                hero.dop_marks_generators['skill1'] = (game_state, hero)=>{
                    return marks_generator.generate_square(i, j, 1, 'rgba(100, 100, 100, 0.2)')
                }

                game_state.after_action()

                hero.left_click_listener = (i, j, game_state, hero)=>{
                    if (i == center_i && j == center_j){
                        cast_skill_2(game_state, hero, skill, center_i, center_j)
                    } else hero.cancel_skill()
                }
            } else hero.cancel_skill()
        }
    }
)


function cast_skill_3(game_state, target, hero, skill){
    target.get_effect(new DelayedDamage(game_state, target, hero, hero.magic + hero.power*2, 1, [], 1000, [], (delayed_damage)=>{
        if (delayed_damage.hero.is_alive == false && delayed_damage.hero.is_hero){
            delayed_damage.caster.skills[2].reduce_cooldown(delayed_damage.hero.game_state, delayed_damage.hero, 100)
        }
    }))
    skill.standard_aftercast(game_state, hero)
    game_state.after_action()
}

var skill3 = new Skill('душное проклятие', 'skill3.png', 4, 3, 'Враг в радиусе 2.5 кл получает душное проклятие, наносящее [магия]+[сила]*2 урона на следующем ходу. Если оно убивает вражеского героя, Рэн обнуляет перезарядку этого умения.', 
    (game_state, hero, skill)=>{
        hero.clear_dop_marks_generators()
        hero.dop_marks_generators['skill1'] = (game_state, hero)=>{
            return marks_generator.generate_circle(hero.i, hero.j, 2.5, 'rgba(200, 0, 0, 0.2)')
        }

        game_state.after_action()

        hero.left_click_listener = (i, j, game_state, hero)=>{
            if (distance(hero.coords, [i, j]) <= 2.5){
                const target = game_state.find_obj_by_coords(i, j, true)
                if (target && target.team != hero.team){
                    cast_skill_3(game_state, target, hero, skill)
                } else { hero.cancel_skill() }
            } else { hero.cancel_skill() }
        }
    }
)


var skill4 = new Skill('сфера ужаса', 'skill4.png', 9, 5, 'Рэн запускает сферу ужаса по прямой на дальность 3 кл. Она попадает в первую же цель, нанеся ей 12 + [магия] + [сила] урона.',
    (game_state, hero, skill)=>{
        hero.clear_dop_marks_generators()
    hero.dop_marks_generators['skill1'] = (game_state, hero)=>{
        return [
            ...marks_generator.generate_line(hero.coords, [hero.i-3, hero.j], 'rgba(100, 0, 0, 0.3)'),
            ...marks_generator.generate_line(hero.coords, [hero.i, hero.j+3], 'rgba(100, 0, 0, 0.3)'),
            ...marks_generator.generate_line(hero.coords, [hero.i+3, hero.j], 'rgba(100, 0, 0, 0.3)'),
            ...marks_generator.generate_line(hero.coords, [hero.i, hero.j-3], 'rgba(100, 0, 0, 0.3)'),
        ]
    }

    game_state.after_action()

    hero.left_click_listener = (i, j, game_state, hero)=>{
        let d = distance([i, j], hero.coords)
        if (0<d && d<=3 && (i==hero.i || j==hero.j)){
            let vector = get_vector(hero.coords, [i, j])
            vector = vector.map((coord)=>{if (coord==0) return coord; else return coord / Math.abs(coord)})

            let sphere = [hero.i, hero.j]
            for (let i=0; i<3; i++){
                sphere = calc_point(sphere, vector)
                let target = game_state.find_obj_by_coords(sphere[0], sphere[1], true)
                if (target !== null){
                    target.get_damage(12 + hero.magic + hero.power, hero)
                    target.be_attacked_animation()
                    setTimeout(()=>{ skill.standard_aftercast(game_state, hero); game_state.after_action() }, 300)
                    break
                }

                let wall = game_state.find_solid_obj_by_coords(sphere[0], sphere[1])
                if (wall != null){  // коли в стену врезались
                    skill.standard_aftercast(game_state, hero); game_state.after_action()
                    break
                }
            }
        } else { hero.cancel_skill() }
    }
})


var ren = () => new Hero({
    name: 'рэн',
    eng_name: 'ren',
    img_src: 'ren/ren.png',
    is_proto: true, i:0, j:0,
    // hp: 40,
    // energy: 6,
    // power: 4,
    // armor: 0,
    // magic: 10,
    // attack_range: 3.5,
    token_img_src: 'ren_token.png',
    skills: [
        skill1, skill2, skill3, skill4
    ],
    upgrades: new Upgrades({
        max_hp: [{cost: 0, value: 40}, {cost: 25, value: 50}, {cost: 25, value: 60}, {cost: 25, value: 70}],
        max_energy: [{cost: 0, value: 6}, {cost: 25, value: 7}, {cost: 25, value: 8}],
        power: [{cost: 0, value: 4}, {cost: 20, value: 6}, {cost: 20, value: 8}],
        armor: [{cost: 0, value: 0}, {cost: 30, value: 1}],
        magic: [{cost: 0, value: 10}, {cost: 30, value: 14}, {cost: 30, value: 18}, {cost: 40, value: 24}],
        attack_range: [{cost: 0, value: 3.5}, {cost: 20, value: 4.5}],
        attack_cost: [{cost: 0, value: 2}]
    })
})


export {ren}
