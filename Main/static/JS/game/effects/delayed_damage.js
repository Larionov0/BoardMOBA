import { distance } from "../tools/math_tools.js";
import { Effect } from "./effect.js";

class DelayedDamage extends Effect{
    constructor(game_state, hero, caster, damage, duration, canlelers=[], max_distance=1000, effects=[], additional_func=(delayed_damage)=>{}){
        super('отложенный урон', 'delayed_damage.png', hero, game_state, caster)
        this.cancelers = canlelers  // ['stun', 'move'] for example
        this.damage = damage
        this.duration = duration
        this.effects = effects
        this.max_distance = max_distance
        this.additional_func = additional_func  // f(delayed_damage)
    }

    gen_description(){
        return `Отложенный урон [${this.damage}] (длительность: ${this.duration}) (наложено by ${this.caster.name})`
    }

    before_move(){
        this.duration -= 1
        if (this.duration == 0){
            if (distance(this.hero.coords, this.caster.coords)>this.max_distance){
                this.game_state.log(`Отложенный урон на ${this.hero.name} не удался из-за разрыва дистанции c ${this.caster.name}`)
            } else {
                this.run()
            }
            this.is_alive = false
        }
    }

    run(){
        this.hero.get_damage(this.damage, this.caster)
        this.hero.be_attacked_animation()
        this.effects.forEach((effect)=>{this.hero.get_effect(effect)})
        this.additional_func(this)
    }
}

export {DelayedDamage}