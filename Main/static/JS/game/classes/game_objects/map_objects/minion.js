import { calc_point, distance, get_surrounding_4_points } from "../../../tools/math_tools.js";
import { Creature } from "../creature.js";

class Minion extends Creature {
    constructor(game_state, team, id, i, j, hp=20, energy=5, power=5, armor=0, magic=0, attack_range=1.5, vision_range=5){
        super({
            name:  team==1?'синий миньйон':'красный миньйон' ,
            eng_name: 'minion',
            img_src: '',
            is_proto: false,
            i:i, j:j,
            hp: hp,
            energy: energy,
            power: power,
            armor: armor,
            magic: magic,
            color: team==1? 'blue' : 'red',
            attack_range: attack_range,
            token_img_src: ''
        })

        this.id = id
        this.game_state = game_state
        this.team = team
        this.is_solid = true
        this.vision_range = vision_range

        this.html_cell_class = 'minion'
        this.target_enemy = null

        this.previous_coords = [0, 0]

        this.is_minion = true
        this.type = 'warrior'

        this.gold_reward = 5
    }

    find_closest_enemy(){
        let objects = this.game_state.get_all_objects_in_range(this.i, this.j, this.vision_range, (obj)=>obj.team==3-this.team && obj.is_alive)
        let min_distance = 10000
        let closest_object = null
        for (let object of objects){
            let d = distance(object.coords, this.coords)
            if ( d < min_distance ){
                closest_object = object
                min_distance = d
            }
        }
        return closest_object
    }


    // define_target_point(enemy){
    //     let range = this.attack_range
    //     let nearest_objects = this.game_state.get_all_objects_in_range(enemy.i, enemy.j, range)
    //     let min_distance = 10000
    //     let closest_point = null  // с которой можно попасть по врагу
    //     for (let i=enemy.i-range)
    // }

    move_1_to_point(point){
        let points = get_surrounding_4_points(this.coords)
        points.sort((p1, p2)=>distance(p1, point)-distance(p2, point))
        for (let point of points){
            // if (closest_objects.filter((obj)=>obj.i==point[0] && obj.j==point[1]).length==0){
            if (this.check_if_can_move_to_point(this.game_state, point[0], point[1]) && !(point[0]==this.previous_coords[0] && point[1]==this.previous_coords[1])){
                this.previous_coords = this.coords
                this.i = point[0]; this.j = point[1]
                return true
            }
        }
        return false
    }

    move_1_to_enemy(enemy, closest_objects){
        let points = get_surrounding_4_points(this.coords)
        points.sort((p1, p2)=>distance(p1, enemy.coords)-distance(p2, enemy.coords))
        for (let point of points){
            // if (closest_objects.filter((obj)=>obj.i==point[0] && obj.j==point[1]).length==0){
            if (this.check_if_can_move_to_point(this.game_state, point[0], point[1]) && !(point[0]==this.previous_coords[0] && point[1]==this.previous_coords[1])){
                this.previous_coords = this.coords
                this.i = point[0]; this.j = point[1]
                return true
            }
        }
        return false
    }

    my_turn(){
        this.before_move()
        if ( ! this.params.stun ){
            let closest_enemy = this.find_closest_enemy()
            let closest_objects = this.game_state.get_all_objects_in_range(this.i, this.j, this.energy)
            if (closest_enemy !== null){
                while (this.energy > this.slowdown){
                    if (distance(this.coords, closest_enemy.coords) <= this.attack_range){
                        if (this.energy >= this.attack_cost){
                            this.make_autoattack(closest_enemy)
                        }
                        return
                    } else {
                        let result = this.move_1_to_enemy(closest_enemy, closest_objects)
                        if (! result) return
                        this.energy -= (1 + this.slowdown)
                    }
                }
            } else {
                let vector = this.team==1 ? [3, 0] : [-3, 0]
                while (this.energy > this.slowdown){
                    let result = this.move_1_to_point(calc_point(this.coords, vector))
                    if (result) this.energy -= (1 + this.slowdown)
                    else return
                }
            }
        }

        this.after_move(this.game_state)
    }
}


Minion.spawn_from_spawn_point = function(game_state, spawn_point){
    var hp, power, attack_range
    if (spawn_point.type == 'warrior'){
        hp = 25
        power = 5
        attack_range = 1.5
    } else if (spawn_point.type == 'archer'){
        hp = 20
        power = 4
        attack_range = 3
    }
    const minion =  new Minion(game_state, spawn_point.team, game_state.gen_new_minion_id(), spawn_point.i, spawn_point.j,
    hp, 5, power, 0, 0, attack_range, 5)
    minion.type = spawn_point.type
    
    return minion
}


export {Minion}