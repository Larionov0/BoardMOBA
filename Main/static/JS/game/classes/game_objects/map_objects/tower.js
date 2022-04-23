import { Creature } from "../creature.js";

class Tower extends Creature{
    constructor(game_state, team, name, eng_name, i, j, height, width, hp, armor, power, zone){
        super({
            name: name,
            eng_name: eng_name,
            img_src: '',
            is_proto: false,
            i: i, j: j,
            hp: hp,
            energy: 1,
            power: power,
            armor: armor,
            magic: 0,
            color: team==1 ? 'blue' : 'red',
            attack_range: 0,
            token_img_src: ''
        })

        this.game_state = game_state

        this.height = height
        this.width = width
        this.end_i = this.i + height - 1
        this.end_j = this.j + width - 1

        if (zone){
            this.zone = zone  // attack zone  [i, j, h, w]
            this.attack_i = zone[0]
            this.attack_j = zone[1]
            this.attack_height = zone[2]
            this.attack_width = zone[3]
            this.attack_end_i = this.attack_i + this.attack_height - 1
            this.attack_end_j = this.attack_j + this.attack_width - 1
        }

        this.team = team
        this.html_cell_class = 'tower'
    }

    make_parts(){
        let parts = []
        for (let i=this.i; i<=this.end_i; i++){
            for (let j=this.j; j<=this.end_j; j++){
                parts.push(new TowerPart(i, j, this))
            }
        }
        return parts
    }

    my_turn(){
        
    }
}


class TowerPart extends Creature {
    constructor(i, j, tower){
        super({ 
            name: 'tower_part', eng_name: 'tower_part', img_src: '',
            i: i, j: j
         })
        this.tower = tower
        this.team = tower.team
        this.is_solid = true
    }

    get_damage(damage){
        this.tower.get_damage(damage)
        this.tower.be_attacked_animation()
    }
}

export {Tower, TowerPart}
