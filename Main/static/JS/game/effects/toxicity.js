import { Modificator } from "../classes/modificator.js";
import { DurableEffect } from "./effect.js";

class Toxicity extends DurableEffect{
    constructor(hero, game_state, duration, caster, value, poison_duration, value_generator=null){
        super('ядовитость', 'toxicity.png', hero, game_state, duration, caster)
        this.value = value
        this.value_generator = value_generator
        this.poison_duration = poison_duration
    }

    get_value(){
        if (this.value_generator !== null) return this.value_generator(this)
        return this.value
    }

    gen_description(){
        return `Токсичность[${this.get_value()}-${this.poison_duration}] (длительность: ${this.duration})`
    }

    gen_modificators(){
        let value = this.value
        if (this.value_generator !== null){
            value = this.value_generator(this)
        }
        return [new Modificator('toxicity_value', 1, value, 'after', 'sum', ['autoattack_effects']),
                new Modificator('toxicity_duration', 1, this.poison_duration, 'after', 'sum', ['autoattack_effects'])]
    }

    after_move(){
        this.decrease_duration()
    }
}


export {Toxicity}