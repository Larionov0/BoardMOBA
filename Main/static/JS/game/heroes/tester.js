import { Hero } from '../classes/hero.js'
import { Skill } from "../classes/skill.js";
import { marks_generator } from "../classes/marks_generator.js";
import { distance } from "../tools/math_tools.js";


var tester_hero = ()=> new Hero({
    name: 'tester',
    eng_name: 'tester',
    img_src: 'tester/zaluzhnyi.webp',
    is_proto: true,
    initiative: 0,
    i: 0, j: 0,
    hp: 40, energy: 6, power: 10, armor: 0, magic: 0,
    skills: [
        new Skill('сильный удар', '', 3, 2, 'наносит удвоенный урон в радиусе 5', (game_state, hero, skill)=>{
            delete hero.dop_marks_generators['attack_range']
            hero.dop_marks_generators['test_skill1'] = (game_state, hero)=>{
                return marks_generator.generate_circle(hero.i, hero.j, 5, 'rgba(0, 0, 100, 0.1)')
            }
    
            hero.left_click_listener = (i, j, game_state, hero)=>{
                if (distance(hero.coords, [i, j]) <= 5){
                    const target_hero = game_state.find_hero_by_coords(i, j)
                    if (target_hero){
                        if (target_hero.team != 1000){  // FIXME: 1000
                            target_hero.get_damage(hero.power * 2)
                            target_hero.be_attacked_animation()
                            skill.standard_aftercast(game_state, hero)
                            setTimeout(()=>{game_state.after_action()}, 600)
                        }
                    }
                }
            }
            game_state.after_action()
        }),
        new Skill('воодушевление', '', 2, 0, 'дает вам 2 энергии', (game_state, hero, skill)=>{
            hero.energy += 2
            skill.standard_aftercast(game_state, hero)
        }),
        new Skill('кувалда небес', '', 3, 3, 'Наносит урон всем в квадрате 3 на 3 в радиусе до 4 кл', (game_state, hero, skill)=>{
            delete hero.dop_marks_generators['attack_range']
    
            hero.dop_marks_generators['test_skill3'] = (game_state, hero)=>{
                return marks_generator.generate_circle(hero.i, hero.j, 4, 'rgba(0, 0, 100, 0.1)')
            }
    
            hero.left_click_listener = (i, j, game_state, hero)=>{
                if (distance(hero.coords, [i, j]) <= 4){
                    delete hero.dop_marks_generators['test_skill3']
                    hero.dop_marks_generators['test_skill3'] = (game_state, hero)=>{
                        return marks_generator.generate_square(i, j, 1, 'rgba(0, 0, 100, 0.1)')
                    }
                    var prev_i=i; var prev_j=j
                    hero.left_click_listener = (i, j, game_state, hero)=>{
                        if (i==prev_i&&j==prev_j){
    
                            for (let target_hero of game_state.all_heroes){
                                if (target_hero.team != 1000){
                                    if (prev_i-1<=target_hero.i && target_hero.i<=prev_i+1  &&  prev_j-1<=target_hero.j && target_hero.j<=prev_j+1){  // in square 3x3
                                        target_hero.get_damage(3)
                                        hero.hp += 3
                                        target_hero.be_attacked_animation()
                                    }
                                }
                            }
    
                            skill.standard_aftercast(game_state, hero)
                            setTimeout(()=>{game_state.after_action()}, 600)
                        } else {
                            hero.cancel_skill()
                            game_state.after_action()
                        }
                    }
                    game_state.after_action()
                }
            }
        }),
        new Skill('ульта', '', 3, 2, 'Оооочень длинное описание умения, просто ахуеть можно с этой длинны вот так то вот оно бывает', ()=>{})
    ],
    color: 'black'
})

// var tester_hero = new Hero('tester', './IMG/zaluzhnyi.webp', true, 0, 0, 0, 40, 6, 10, 0, 0, [
//     new Skill('сильный удар', '', 3, 2, 'наносит удвоенный урон в радиусе 5', (game_state, hero, skill)=>{
//         delete hero.dop_marks_generators['attack_range']
//         hero.dop_marks_generators['test_skill1'] = (game_state, hero)=>{
//             return marks_generator.generate_circle(hero.i, hero.j, 5, 'rgba(0, 0, 100, 0.1)')
//         }

//         hero.left_click_listener = (i, j, game_state, hero)=>{
//             if (distance(hero.coords, [i, j]) <= 5){
//                 const target_hero = game_state.find_hero_by_coords(i, j)
//                 if (target_hero){
//                     if (target_hero.team != 1000){  // FIXME: 1000
//                         target_hero.get_damage(hero.power * 2)
//                         target_hero.be_attacked_animation()
//                         skill.standard_aftercast(game_state, hero)
//                         setTimeout(()=>{game_state.after_action()}, 600)
//                     }
//                 }
//             }
//         }
//         game_state.after_action()
//     }),
//     new Skill('воодушевление', '', 2, 0, 'дает вам 2 энергии', (game_state, hero, skill)=>{
//         hero.energy += 2
//         skill.standard_aftercast(game_state, hero)
//     }),
//     new Skill('кувалда небес', '', 3, 3, 'Наносит урон всем в квадрате 3 на 3 в радиусе до 4 кл', (game_state, hero, skill)=>{
//         delete hero.dop_marks_generators['attack_range']

//         hero.dop_marks_generators['test_skill3'] = (game_state, hero)=>{
//             return marks_generator.generate_circle(hero.i, hero.j, 4, 'rgba(0, 0, 100, 0.1)')
//         }

//         hero.left_click_listener = (i, j, game_state, hero)=>{
//             if (distance(hero.coords, [i, j]) <= 4){
//                 delete hero.dop_marks_generators['test_skill3']
//                 hero.dop_marks_generators['test_skill3'] = (game_state, hero)=>{
//                     return marks_generator.generate_square(i, j, 1, 'rgba(0, 0, 100, 0.1)')
//                 }
//                 var prev_i=i; var prev_j=j
//                 hero.left_click_listener = (i, j, game_state, hero)=>{
//                     if (i==prev_i&&j==prev_j){

//                         for (let target_hero of game_state.all_heroes){
//                             if (target_hero.team != 1000){
//                                 if (prev_i-1<=target_hero.i && target_hero.i<=prev_i+1  &&  prev_j-1<=target_hero.j && target_hero.j<=prev_j+1){  // in square 3x3
//                                     target_hero.get_damage(3)
//                                     hero.hp += 3
//                                     target_hero.be_attacked_animation()
//                                 }
//                             }
//                         }

//                         skill.standard_aftercast(game_state, hero)
//                         setTimeout(()=>{game_state.after_action()}, 600)
//                     } else {
//                         hero.cancel_skill()
//                         game_state.after_action()
//                     }
//                 }
//                 game_state.after_action()
//             }
//         }
//     }),
//     new Skill('ульта', '', 3, 2, 'Оооочень длинное описание умения, просто ахуеть можно с этой длинны вот так то вот оно бывает', ()=>{})
// ])

export {tester_hero}
