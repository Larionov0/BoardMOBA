import { DurableEffect, Effect } from "./effect.js";


class Bleeding extends Effect {
    constructor(hero, game_state, caster, value){
        super('кровотечение', 'bleeding.png', hero, game_state, caster)
        this.value = value
    }

    gen_description(){
        return `Кровотечение [${this.value}] (наложено ${this.caster.name})`
    }

    on_getting(){
        var sum_value = 0
        for (let effect of this.hero.effects){
            if (effect.name=='кровотечение'){
                sum_value += effect.value
                effect.is_alive = false
            }
        }
        
        this.is_alive = true
        this.value = sum_value
    }

    decrease(){
        this.value -= 1
        if (this.value == 0){
            this.is_alive = false
        }
    }

    before_target_move(){
        this.game_state.log(`${this.hero.name} кровоистекает. Он потерял ${this.value} hp`)
        this.hero.loose_hp(this.value, this.caster)
        this.decrease()
        this.hero.be_attacked_animation()
    }
}


export {Bleeding}