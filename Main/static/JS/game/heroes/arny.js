import { Hero } from "../classes/game_objects/hero.js";
import { marks_generator } from "../classes/marks_generator.js";
import { Modificator } from "../classes/modificator.js";
import { Skill } from "../classes/skill.js";
import { Slowdown } from "../effects/slowdown.js";
import { Solidity } from "../effects/solidity.js";
import { Stun } from "../effects/stun.js";
import { Toxicity } from "../effects/toxicity.js";
import { distance, get_vector, get_perp_vectors, calc_point } from "../tools/math_tools.js";
import { Upgrades } from "../classes/upgrades.js";



var skill1 = new Skill('притягивание', 'skill1.png', 3, 3, 'Арни щупальцем притягивает к себе любую цель на расстоянии до 5.3 кл и наносит ей [магия] урона.',
    (game_state, hero, skill)=>{
        hero.clear_dop_marks_generators()
        hero.dop_marks_generators['skill1'] = (game_state, hero)=>{
            return marks_generator.generate_circle(hero.i, hero.j, 5.3, 'rgba(0, 0, 100, 0.1)')
        }
        
        game_state.after_action()

        hero.left_click_listener = (i, j, game_state, hero)=>{
            if (distance(hero.coords, [i, j]) <= 5.3){
                const target_hero = game_state.find_obj_by_coords(i, j, true)
                if (target_hero){
                    let points = marks_generator.generate_around_point(hero.i, hero.j)
                    points = points.map((point)=>{return {...point, distance: distance([point.i, point.j], target_hero.coords)}})
                    points = points.sort((p1, p2)=>p1.distance-p2.distance)
                    var target_point = null
                    for (let point of points){
                        if (target_hero.check_if_can_move_to_point(game_state, point.i, point.j)){
                            target_point = point
                            break
                        }
                    }

                    if (target_point){
                        target_hero.i = target_point.i
                        target_hero.j = target_point.j
                        target_hero.get_damage(hero.magic, hero)
                        target_hero.be_attacked_animation()
                        skill.standard_aftercast(game_state, hero)
                        setTimeout(()=>{game_state.after_action()}, 400)
                    } else {
                        hero.cancel_skill()
                    }
                }
            }
        }
    }
)


var skill2 = new Skill('стальная кожа', 'skill2.png', 3, 2, 'Арни укрепляет кожу, получая Стойкость[1] (первый удар по нему будет заблокирован в течении хода)',
    (game_state, hero, skill)=>{
        hero.get_effect(new Solidity(hero, game_state, 1, hero))
        skill.standard_aftercast(game_state, hero)
        game_state.after_action()
    }
)



var cast_skill3 = (game_state, hero, skill, vector, line)=>{
    let target_heroes = []

    for (let mark of line){
        let target_hero = game_state.find_obj_by_coords(mark.i, mark.j, true)
        if (target_hero) target_heroes.push(target_hero)
    }

    for (let target_hero of target_heroes){
        target_hero.get_damage(hero.magic, hero)
        target_hero.be_attacked_animation()
        let result = target_hero.be_pushed_in_line(vector, 2)
        if (result != true){  // if врезался во что-то
            target_hero.get_effect(new Stun(target_hero, game_state, 1, hero))
        } else {
            target_hero.get_effect(new Slowdown(target_hero, game_state, 1, hero, 1))
        }
    }

    skill.standard_aftercast(game_state, hero)
    setTimeout(()=>{game_state.after_action()}, 400)
}

var skill3 = new Skill('лобокол', 'skill3.png', 4, 3, 'Арни бьет лбом по линии перед собой (из 3 кл) в одном из 4 направлений. Все враги, стоящие на этой линии, отлетают на 2 кл и получают [магия] урона а также замедление[1] на ход. Если враг при отлёте столкнулся с другим героем или стенкой, он получает оглушение.',
    (game_state, hero, skill)=>{
        hero.clear_dop_marks_generators()
        hero.dop_marks_generators['skill1'] = (game_state, hero)=>{
            return marks_generator.generate_circle(hero.i, hero.j, 1, 'rgba(0, 0, 200, 0.3)')
        }

        hero.left_click_listener = (i, j, game_state, hero)=>{
            if (distance([i, j], hero.coords) == 1){
                var main_vector = get_vector(hero.coords, [i, j])

                hero.dop_marks_generators['skill1'] = (game_state, hero)=>{
                    let [perp1, perp2] = get_perp_vectors(main_vector)
                    var r = marks_generator.generate_line(calc_point([i, j], perp1), calc_point([i, j], perp2), 'rgba(0, 0, 200, 0.3)')
                    return r
                }

                game_state.after_action()

                hero.left_click_listener = (i, j, game_state, hero)=>{
                    var line = hero.dop_marks_generators['skill1'](game_state, hero)
                    if (line.filter((mark)=>mark.i==i && mark.j==j).length == 1){
                        cast_skill3(game_state, hero, skill, main_vector, line)
                    } else {
                        hero.cancel_skill()
                    }
                }
            } else {
                hero.cancel_skill()
            }
        }
    }
)


var skill4 = new Skill('ядовитые щупальца', 'skill4.png', 8, 3, 'Арни запускает ядовитые железы, его удары становятся ядовитыми[[магия//2] | 1] и он получает улучшение на 3 хода: броня+2 | макс энергия+2 | магия+2',
    (game_state, hero , skill)=>{
        hero.get_effect(new Toxicity(hero, game_state, 3, hero, 0, 1, (tox)=>Math.floor(tox.caster.magic/2)))
        hero.get_modificator(new Modificator('armor', 3, 2, 'after', 'sum'), false)
        hero.get_modificator(new Modificator('max_energy', 3, 2, 'after', 'sum'), false)
        hero.get_modificator(new Modificator('magic', 3, 2, 'after', 'sum'))
        skill.standard_aftercast(game_state, hero)
        game_state.after_action()
    }
)


var arny = ()=>new Hero({
    name: 'арни',
    eng_name: 'arny',
    img_src: 'arny/arny.png',
    is_proto: true,
    initiative: 0,
    i:0, j:0,
    // hp: 60,
    // power: 5,
    // energy: 6,
    // armor: 2,
    // magic: 8,
    // attack_range: 1.5,
    color: 'blue',
    token_img_src: 'arny_token.png',
    skills: [
        skill1,
        skill2,
        skill3,
        skill4
    ],
    upgrades: new Upgrades({
        max_hp: [{cost: 0, value: 60}, {cost: 25, value: 70}, {cost: 25, value: 80}, {cost: 35, value: 100}],
        max_energy: [{cost: 0, value: 6}, {cost: 25, value: 7}],
        power: [{cost: 0, value: 5}, {cost: 30, value: 7}, {cost: 10, value: 8}],
        armor: [{cost: 0, value: 2}, {cost: 30, value: 3}, {cost: 40, value: 4}],
        magic: [{cost: 0, value: 8}, {cost: 20, value: 10}, {cost: 30, value: 13}],
        attack_range: [{cost: 0, value: 1.5}, {cost: 20, value: 2.5}],
        attack_cost: [{cost: 0, value: 2}]
    })
})


export {arny}