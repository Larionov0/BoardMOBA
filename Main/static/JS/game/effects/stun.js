import { DurableEffect } from "./effect.js";

class Stun extends DurableEffect{
    constructor (hero, game_state, duration, caster){
        super('оглушение', 'stun.png', hero, game_state, duration, caster)
    }

    after_target_move(){
        this.decrease_duration()
    }
}

export {Stun}