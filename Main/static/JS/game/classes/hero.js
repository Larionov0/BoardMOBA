import { distance } from "../tools/math_tools.js"
import { marks_generator } from "./marks_generator.js"
import { Shield } from "./shield.js"
import { Solidity } from "../effects/solidity.js"
import { Stun } from "../effects/stun.js"
import { Poison } from "../effects/poison.js"
import { DelayedDamage } from "../effects/delayed_damage.js"


class Hero {
    constructor ({name, eng_name, img_src, is_proto, initiative, i, j, hp, energy, power, armor, magic, skills, color, attack_range=2, token_img_src=''}={}){
        this.game_state = null  // ! at start of match

        this.name = name
        this.eng_name = eng_name
        this.img_src = img_src
        this.token_img_src = token_img_src
        this.is_proto = is_proto
        this.initiative = initiative // будет определяться случайно в начале матча
        this.i = i
        this.j = j

        this.base_params = {
            max_hp: hp,
            max_energy: energy,
            power: power,
            armor: armor,
            magic: magic,
            attack_range: attack_range,
            attack_cost: 2,

            slowdown: 0,
            solidity: false,
            can_autoattack: true,
            stun: false,

            autoattack_effects: {
                toxicity_value: 0,  // при ударах накладывать отравление
                toxicity_duration: 0,
            }
        }
        this.hp = hp
        this.energy = energy,

        this.params = {
            ...this.base_params,
            // autoattack_effects: {...this.base_params.autoattack_effects}
        }

        this.effects = []
        this.my_effects = []  // casted by me
        this.shields = []
        this.modificators = []

        this.skills = skills
        this.color = color
        if (this.color == undefined) this.color = 'black'

        this.team = null
        this.html_link = null
        this.cell_link = null

        this.is_solid = true // we cannot move through it
        this.attacks_during_turn = 0

        this.is_alive = true

        this.index = null
        this.global_index = null

        this.skill_chosen=null
        this.left_click_listener = null
        this.dop_marks_generators = {}
        this.restore_standard_dop_marks_generators()  // функции, которые будут возвращать список меток
    }
    get max_hp(){return this.params.max_hp}
    get max_energy(){return this.params.max_energy}
    get power(){return this.params.power}
    get armor(){return this.params.armor}
    get magic(){return this.params.magic}
    get attack_range(){return this.params.attack_range}
    get attack_cost(){return this.params.attack_cost}

    get slowdown(){return this.params.slowdown}
    get solidity(){return this.params.solidity}
    get can_autoattack(){return this.params.can_autoattack}
    

    // alive
    get alive_modificators(){return this.modificators.filter((mod)=>mod.is_alive)}
    get alive_effects(){return this.effects.filter((eff)=>eff.is_alive)}
    get alive_my_effects(){return this.my_effects.filter((eff)=>eff.is_alive)}
    get alive_shields(){return this.shields.filter((shield)=>shield.is_alive)}
    
    recalc_params(){
        // будет вызываться в начале каждого хода а также при нужных триггерах (например, при наступлении на зону, в ходе каста умений и тд)
        // при подсчете будут учитываться все эффекты, зоны, модификаторы
        this.params = {...this.base_params}
        this.params.autoattack_effects = {...this.base_params.autoattack_effects}
        var temp_modificators = []
        for (let effect of this.alive_effects){
            temp_modificators = [...temp_modificators, ...effect.gen_modificators()]
        }

        for (let mod of [...this.alive_modificators, ...temp_modificators]){
            mod.modify(this.params)
        }

        if (this.attacks_during_turn > 0) this.params.can_autoattack = false
        if (this.alive_effects.filter((eff)=>eff instanceof Solidity).length>0) this.params.solidity = true
        if (this.alive_effects.filter((eff)=>eff instanceof Stun).length>0) this.params.stun = true
    }

    get coords(){
        return [this.i, this.j]
    }

    clear_dop_marks_generators(){
        this.dop_marks_generators = {}
    }

    restore_standard_dop_marks_generators(){
        this.dop_marks_generators = {
            'run': (game_state, hero)=>{
                return this.gen_move_marks()
            },
            'attack_range': (game_state, hero)=>{
                if (hero.energy >= hero.attack_cost && hero.can_autoattack){
                    return marks_generator.generate_circle(hero.i, hero.j, hero.attack_range, 'rgba(137, 61, 84, 0.3)')
                }
                return []
            },
            'addaptive': (game_state, hero)=>{
                var marks = []
                hero.effects.filter((eff)=>{return (eff instanceof DelayedDamage) && eff.max_distance<100}).forEach((eff)=>{
                    marks = [...marks, ...marks_generator.generate_circle(eff.caster.i, eff.caster.j, eff.max_distance, 'rgba(100, 0, 0, 0.07)')]
                })
                return marks
            }
        }
    }

    gen_move_marks(){
        return marks_generator.generate_romb(this.i, this.j, Math.floor(this.energy/(1+this.slowdown)), 'rgba(110, 200, 140, 0.7)')
    }

    gen_active_marks(){
        // gen romb around active hero. Size = energy
        // var marks = this.gen_move_marks()
        var marks = []
        for (const [key, generator] of Object.entries(this.dop_marks_generators)){
            marks = [...marks, ...generator(this.game_state, this)]  // !!!  game_state, hero
        }

        return marks
    }

    local_before_move(){
        // calls for this unique hero
    }

    before_move(){
        // calls for all heroes
        this.skills.forEach((skill)=>{skill.chosen=false})
        this.skill_chosen = null

        this.recalc_params()

        this.alive_effects.forEach((effect)=>{effect.before_target_move()})
        this.alive_my_effects.forEach((effect)=>{effect.before_move()})
        this.effects_cleaner()

        this.alive_shields.forEach((shield)=>{shield.decrease_duration()})
        this.shields_cleaner()

        this.alive_modificators.forEach((mod)=>{if (mod.when=='before') mod.decrease()})

        this.attacks_during_turn = 0
        
        this.recalc_params()

        this.energy = this.max_energy

        this.local_before_move()

        if (this.params.stun) this.game_state.after_hero_move()
    }

    after_move(game_state){
        this.alive_effects.forEach((effect)=>{effect.after_target_move()})
        this.alive_my_effects.forEach((effect)=>{effect.after_move()})
        this.alive_modificators.forEach((mod)=>{if (mod.when=='after') mod.decrease()})
        this.effects_cleaner()

        for (let skill of this.skills){
            skill.cooldown_down()
        }
    }

    shields_cleaner(){
        this.shields = this.shields.filter((shield)=>shield.is_alive)
    }

    effects_cleaner(){
        this.effects = this.alive_effects
        this.my_effects = this.alive_my_effects
    }

    modificators_cleaner(){
        this.modificators = this.alive_modificators
    }

    get_effect(effect) {
        this.game_state.log(`На ${this.name} был наложен эффект ${effect.gen_description()}`)

        this.effects.push(effect)
        effect.on_getting()
        this.recalc_params()
    }

    get_modificator(mod, recalc=true){
        this.modificators.push(mod)
        if (recalc)
            this.recalc_params()
    }

    check_if_can_move_to_point(game_state, i, j){
        for (let game_obj of game_state.get_all_game_objects()){
            if (game_obj.i==i && game_obj.j==j && game_obj.is_solid) return false
        }
        
        if (i < 0 || j < 0 || i >= game_state.n || j > game_state.m) return false

        return true
    }

    move (direction, game_state) {
        var i = this.i; var j = this.j
        switch (direction) {
            case 'w':
                i -= 1
                break;
            
            case 'a':
                j -= 1
                break;
            
            case 's':
                i += 1
                break;
            
            case 'd':
                j += 1
                break;
            
            default:
                break;
        }
        if (this.check_if_can_move_to_point(game_state, i, j)){
            this.i = i; this.j = j;
            this.cancel_skill()
            return true
        }
        else {
            return false
        }
    }

    push_on_vector(vector){
        var i = this.i; var j = this.j

        i += vector[0]
        j += vector[1]
        if (this.check_if_can_move_to_point(this.game_state, i, j)){
            this.i = i; this.j = j
            return true
        }
        return false
    }

    be_pushed_in_line(vector1, length){
        //  returns true if pushed ok
        //  returns hero or 'wall' if pushed not ok

        for (let k=0; k<length; k++){
            let next_i = this.i; let next_j = this.j

            next_i += vector1[0]
            next_j += vector1[1]


            if (this.game_state.is_out_of_map(next_i, next_j)) return 'wall'
            let obj = this.game_state.find_obj_by_coords(next_i, next_j)
            if (obj){
                if (obj.is_solid){
                    return obj
                }
            }
            
            this.i = next_i
            this.j = next_j
        }
        return true
    }

    damage_through_shields(damage){
        while (this.shields.length>0){
            let shield = this.shields[0]
            damage = shield.get_damage(damage)
            if (shield.value<=0) this.shields.shift()
            
            if (damage == 0) return 0
        }
        return damage
    }

    get_shield(shield){
        this.shields.push(shield)
    }

    heal(value){
        this.game_state.log(`${this.name} восстановил ${Math.min(value, this.max_hp-this.hp)} hp`)
        this.hp += value
        if (this.hp > this.max_hp) this.hp = this.max_hp
    }

    get_damage(damage){
        if (this.solidity){
            this.alive_effects.filter((eff)=>eff instanceof Solidity)[0].decrease()
            this.recalc_params()
            return
        }

        damage = this.damage_through_shields(damage)
        if (damage > 0){
            const u_damage = damage - this.armor
            this.game_state.log(`${this.name} получил ${u_damage}/${damage} урона`)
            this.loose_hp(u_damage)
        }
    }

    loose_hp(damage){
        this.hp -= damage
        if (this.hp <= 0){
            this.die()
        }
    }

    die(){
        this.is_alive = false
        this.i = -1
        this.j = -1
        // alert(`${this.name} is dead`)
    }

    be_attacked_animation(){
        this.html_link.classList.add('attacked')
        // this.cell_link.classList.add('attacked')
        this.cell_link.querySelector('.hero_token').classList.add('bounced')
        setTimeout(()=>{
            this.cell_link.classList.remove('attacked')
        }, 300)
    }

    put_effects_on_autoattack(target){
        if (this.params.autoattack_effects.toxicity_value>0){
            target.get_effect(new Poison(target, this.game_state, this, this.params.autoattack_effects.toxicity_value, this.params.autoattack_effects.toxicity_duration))
        }
    }
    
    make_autoattack(target){
        this.game_state.log(`${this.name} нанес удар по ${target.name}`)
        target.get_damage(this.power)
        this.put_effects_on_autoattack(target)

        this.energy -= this.attack_cost
        target.be_attacked_animation()
        this.attacks_during_turn += 1
        this.recalc_params()

        setTimeout(()=>{
            this.game_state.after_action()
        }, 600)
    }

    try_to_make_autoattack(i, j){
        // returns true if it possible and false if it is not possible
        var target = this.game_state.find_obj_by_coords(i, j)

        if (target === null) return false
        if (this.energy < this.attack_cost) return false
        if (target === this) return false
        if (distance(this.coords, target.coords) > this.attack_range) return false

        this.make_autoattack(target)
        return true
    }

    cell_rightclicked(i, j) {
        // check if we can move
        if (this.can_autoattack){
            let result = this.try_to_make_autoattack(i, j)
        }
    }

    cell_clicked(i, j) {
        // check if we can move
        if (this.left_click_listener){
            this.left_click_listener(i, j, this.game_state, this)
        }
    }

    wasd_pressed(dir, game_state){
        if (this.energy > this.slowdown){
            const result = this.move(dir, game_state)
            if (result){
                this.energy -= (1 + this.slowdown)
            }
        }
        
        game_state.after_action()
    }

    cancel_skill(redraw=true){
        if (this.skill_chosen){
            this.skills[this.skill_chosen-1].chosen = false
            this.skill_chosen = null
            this.left_click_listener = null
            this.restore_standard_dop_marks_generators()
        }
        if (redraw) this.game_state.after_action()
    }

    skill_clicked(number, game_state){
        if (this.skill_chosen === null){
            this.skill_chosen = number
            this.skills[number-1].start(game_state, this)
        } else {
            this.cancel_skill()
        }

        game_state.after_action()
    }


    clone (){
        function deepclone(obj){
            return Object.assign(Object.create(Object.getPrototypeOf(obj)), obj)
        }

        var new_hero = deepclone(this)
        new_hero.skills = this.skills.map((skill)=>deepclone(skill))
        new_hero.effects = []
        new_hero.shields = []
        new_hero.restore_standard_dop_marks_generators()
        return new_hero
    }
}

export {Hero}
