import { DurableEffect } from "./effect.js";


class Poison extends DurableEffect {
    constructor(hero, game_state, caster, power, duration){
        super('Отравление', 'poison.png', hero, game_state, duration, caster)
        this.power = power
    }

    gen_description(){
        return `Отравление [${this.power}] на ${this.duration} ходов (наложено ${this.caster.name})`
    }

    before_move(){
        this.game_state.log(`${this.hero.name} отравлен и потерял ${this.power} hp`)
        this.hero.loose_hp(this.power, this.caster)
        this.decrease_duration()
        this.hero.be_attacked_animation()
    }
}


export { Poison }