import { Skill } from "../classes/skill.js";
import { marks_generator } from "../classes/marks_generator.js";
import { distance } from "../tools/math_tools.js";
import { Hero } from "../classes/game_objects/hero.js";
import { Slowdown } from "../effects/slowdown.js";
import { Shield } from "../classes/shield.js";
import { Bleeding } from "../effects/bleeding.js";
import { Upgrades } from "../classes/upgrades.js";


// function bubble_sort(array, func){
//     var ogr = array.length - 1
//     for (let ogr=array.length-1; ogr-=1; ogr>0){
//         for (let i=0; i<ogr; i++){
//             if (func(array[i]) > func(array[i+1]))
//                 [array[i], array[i+1]] = [array[i+1], array[i]]
//         }
//     }
//     return array
// }


var skill1 = new Skill('бросок топора', 'skill1.png', 2, 2, 'Карл бросает топор в выбранного врага в радиусе 4 кл. Топор наносит урон = силе и накладывает замедление[1] на ход',
    (game_state, hero, skill)=>{
        hero.clear_dop_marks_generators()
        hero.dop_marks_generators['skill1'] = (game_state, hero)=>{
            return marks_generator.generate_circle(hero.i, hero.j, 4, 'rgba(0, 0, 100, 0.1)')
        }
        
        game_state.after_action()

        hero.left_click_listener = (i, j, game_state, hero)=>{
            if (distance(hero.coords, [i, j]) <= 4){
                const target = game_state.find_obj_by_coords(i, j, true)
                if (target){
                    if (target.team != 1000){  // FIXME: 1000
                        target.get_damage(hero.power, hero)
                        target.get_effect(new Slowdown(target, game_state, 1, hero, 1))
                        target.be_attacked_animation()
                        skill.standard_aftercast(game_state, hero)
                        setTimeout(()=>{game_state.after_action()}, 500)
                    }
                }
            }
        }
    }
)


var skill2 = new Skill('крепкая стойка', 'skill2.png', 3, 1, 'Карл встает в крепкую стойку и получает щит[7 + [магия]] на ход', (game_state, hero, skill)=>{
    hero.get_shield(new Shield(hero, 1, 7 + hero.magic, 0, hero))
    skill.standard_aftercast(game_state, hero)
    game_state.after_action()
})


var skill3 = new Skill('размах', 'skill3.png', 3, 3, 'Карл одним размахом наносит [сила + магия] урона всем окружающим врагам и отталкивает их',
    (game_state, hero, skill)=>{
        hero.clear_dop_marks_generators()
        hero.dop_marks_generators['skill3'] = (game_state, hero)=>{
            return marks_generator.generate_square(hero.i, hero.j, 1, 'rgba(0, 0, 100, 0.1)')
        }

        hero.left_click_listener = (i, j, game_state, hero)=>{
            if (distance(hero.coords, [i, j]) == 0){
                delete hero.dop_marks_generators['skill3']

                var marks = marks_generator.generate_square(hero.i, hero.j, 1, 'test')
                for (let mark of marks){
                    if (!(mark.i == hero.i && mark.j == hero.j)){
                        let target = game_state.find_obj_by_coords(mark.i, mark.j, true)
                        if (target){
                            target.get_damage(hero.power + hero.magic, hero)
                            target.be_attacked_animation()
                            target.push_on_vector([target.i - hero.i, target.j - hero.j])
                        }
                    }
                }
                
                skill.standard_aftercast(game_state, hero)
                setTimeout(()=>{game_state.after_action()}, 400)
            }
        }
    }
)


var skill4 = new Skill('Добивание', 'skill4.png', 7, 4, 'Карл прыгает к врагу на расстоянии до 3х клеток и наносит рассекающий удар с уроном = [сила] + [магия] * 5 и оставляет кровотечение[3]', 
    (game_state, hero, skill)=>{
        hero.clear_dop_marks_generators()
        hero.dop_marks_generators['skill3'] = (game_state, hero)=>{
            return marks_generator.generate_circle(hero.i, hero.j, 3, 'rgba(200, 0, 0, 0.2)')
        }

        hero.left_click_listener = (i, j, game_state, hero)=>{
            if (distance(hero.coords, [i, j]) <= 3){
                const target_hero = game_state.find_hero_by_coords(i, j)
                if (target_hero){
                    var around = [[target_hero.i-1, target_hero.j], [target_hero.i+1, target_hero.j], 
                                  [target_hero.i, target_hero.j-1], [target_hero.i, target_hero.j+1]]
                    around = around.sort((a, b)=>distance(a, hero.coords)-distance(b, hero.coords))

                    for (let point of around){
                        if (hero.check_if_can_move_to_point(game_state, point[0], point[1])){
                            hero.i = point[0]; hero.j = point[1]
                            game_state.after_action()
                            
                            target_hero.get_damage(hero.power + hero.magic * 5, hero)
                            target_hero.get_effect(new Bleeding(target_hero, game_state, hero, 3))
                            target_hero.be_attacked_animation()
                            skill.standard_aftercast(game_state, hero)
                            setTimeout(()=>{game_state.after_action()}, 400)
                            return
                        }
                    }
                    hero.cancel_skill()
                    game_state.after_action()
                }
            }
        }
    }
)


var karl = ()=> new Hero({
    name: 'карл',
    eng_name: 'karl',
    img_src: 'karl/karl.png',
    is_proto: true,
    initiative: 0,
    i: 0,
    j: 0,
    // hp: 50,
    // energy: 6,
    // power: 7,
    // armor: 1,
    // magic: 3,
    // attack_range: 1.5,
    skills: [
        skill1,
        skill2,
        skill3,
        skill4
    ],
    color: 'blue',
    token_img_src: 'karl_token.png',
    upgrades: new Upgrades({
        max_hp: [{cost: 0, value: 50}, {cost: 25, value: 60}, {cost: 25, value: 70}],
        max_energy: [{cost: 0, value: 6}, {cost: 25, value: 7}],
        power: [{cost: 0, value: 7}, {cost: 30, value: 9}, {cost: 40, value: 12}],
        armor: [{cost: 0, value: 1}, {cost: 30, value: 2}],
        magic: [{cost: 0, value: 3}, {cost: 30, value: 5}, {cost: 30, value: 7}],
        attack_range: [{cost: 0, value: 1.5}],
        attack_cost: [{cost: 0, value: 2}]
    })
})

export {karl}