import { Effect } from "./effect.js";

class Solidity extends Effect{
    constructor(hero, game_state, value, caster){
        super('стойкость', 'solidity.png', hero, game_state, caster)
        this.description = 'Герой игнорирует весь урон от первого удара по нему.'
        this.value = value
    }

    decrease(){
        this.value -= 1
        if (this.value <= 0) this.is_alive = false
    }

    before_move(){
        this.decrease()
    }
}

export {Solidity}