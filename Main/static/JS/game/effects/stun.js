import { DurableEffect } from "./effect.js";
import { Modificator } from "../classes/modificator.js";

class Stun extends DurableEffect{
    constructor (hero, game_state, duration, caster){
        super('оглушение', 'stun.png', hero, game_state, duration, caster)
    }

    gen_description(){
        return `Оглушение[${this.duration}] (наложено ${this.caster.name})`
    }

    after_target_move(){
        this.decrease_duration()
    }

    gen_modificators(){
        return [new Modificator('stun', 1, true, 'after', 'set')]
    }
}

export {Stun}