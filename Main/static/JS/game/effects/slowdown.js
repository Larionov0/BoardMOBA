import { Modificator } from "../classes/modificator.js";
import { DurableEffect } from "./effect.js";


class Slowdown extends DurableEffect {
    constructor(hero, game_state, duration, caster, value){
        super('замедление', 'slowdown.png', hero, game_state, duration, caster)
        this.value=value
    }

    gen_description(){
        return `Замедление[${this.value}]  (длительность = ${this.duration}) (наложено: ${this.caster.name})`
    }

    before_move(){
        this.decrease_duration()
    }

    gen_modificators(){
        return [new Modificator('slowdown', 1, this.value, 'after', 'sum')]
    }
}

export {Slowdown}