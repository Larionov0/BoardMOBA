import { Creature } from "./creature.js";

class Hero extends Creature{
    constructor({name, eng_name, img_src, is_proto, i, j, hp, energy, power, armor, magic, skills, color, attack_range=2, token_img_src='', upgrades={}, gold=0}={}){
        super({
            name: name,
            eng_name: eng_name,
            img_src: img_src,
            is_proto: is_proto,
            i: i, j: j,
            hp: hp,
            energy: energy,
            power: power,
            armor: armor,
            magic: magic,
            color: color,
            attack_range: attack_range,
            token_img_src: token_img_src
        })
        this.is_hero = true
        this.skills = skills
        this.skill_chosen=null
        this.gold = gold
        this.upgrades = upgrades
        this.html_cell_class = 'hero_token'
        this.gold_reward = 20
    }

    on_game_start(game_state){
        this.game_state = game_state
        this.upgrades.set_default_levels()
        this.apply_upgrades()
        this.hp = this.max_hp
        this.energy = this.max_energy
    }

    try_to_upgrade_param(par_name){
        if (this.upgrades.can_upgrade(par_name)){
            let next_param = this.upgrades.params[par_name][this.upgrades.params_levels[par_name] + 1]
            if (this.gold >= next_param.cost){
                this.gold -= next_param.cost
                this.game_state.log(`${this.name} прокачал характеристику ${par_name}`)
                this.upgrades.upgrade(par_name)
                this.apply_upgrades()
                this.game_state.after_action()
            } else {
                alert('Недостаточно золота')
            }
        } else {
            alert('Мы не можем прокачать этот параметр')
        }
    }

    apply_upgrades(){
        for (let [par_name, values] of Object.entries(this.upgrades.params)){
            this.base_params[par_name] = this.upgrades.get_param(par_name)
            this.params[par_name] = this.upgrades.get_param(par_name)
        }
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

    earn_gold(gold){
        this.gold += gold
        this.game_state.log(`${this.name} получил ${gold} золота`)
    }

    after_move(game_state){
        super.after_move(game_state)
        for (let skill of this.skills){
            skill.cooldown_down()
        }
        this.earn_gold(1)
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

    after_moving(){
        this.cancel_skill()
    }

    on_kill(target){
        this.gold += target.gold_reward
        this.game_state.log(`${this.name} получил ${target.gold_reward} золота`)
    }
}

export {Hero}
