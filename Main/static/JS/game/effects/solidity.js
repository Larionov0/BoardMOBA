import { SummaryDurableEffect } from "./effect.js";
import { Modificator } from "../classes/modificator.js";

class Solidity extends SummaryDurableEffect{
    constructor(hero, game_state, duration, caster){
        super('стойкость', 'solidity.png', hero, game_state, duration, caster)
        this.description = 'Герой игнорирует весь урон от первого удара по нему.'
    }

    gen_description(){
        return `Стойкость[${this.duration}] (наложено ${this.caster.name})`
    }

    before_move(){
        this.decrease_duration()
    }

    gen_modificators(){
        return [new Modificator('solidity', 1, true, 'after', 'set')]
    }
}

export {Solidity}