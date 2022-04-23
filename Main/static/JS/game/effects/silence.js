import { Modificator } from "../classes/modificator.js";
import { SummaryDurableEffect } from "./effect.js";


class Silence extends SummaryDurableEffect {
    constructor(hero, game_state, duration, caster){
        super('безмолвие', 'silence.png', hero, game_state, duration, caster)
    }

    gen_description(){
        return `Безмолвие (длительность = ${this.duration}) (наложено: ${this.caster.name})`
    }

    before_move(){
        this.decrease_duration()
    }

    gen_modificators(){
        return [new Modificator('silence', 1, true, 'after', 'set')]
    }
}

export {Silence}