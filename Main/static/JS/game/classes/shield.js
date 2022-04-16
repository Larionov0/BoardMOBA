class Shield {
    constructor (hero, duration, value, armor, caster){
        this.hero = hero
        this.game_state = hero.game_state
        this.duration = duration
        this.value = value
        this.max_value = value
        this.armor = armor
        this.caster = caster
        this.is_alive = true
    }

    get_damage(damage){
        // returns remaining damage
        this.value -= (damage-this.armor)
        this.game_state.log(`Щит на герое ${this.hero.name} получил ${damage - this.armor} урона. Осталось ${this.value}/${this.max_value}`)
        if (this.value > 0) return 0
        return -this.value
    }

    decrease_duration(){
        this.duration -= 1
        if (this.duration == 0){
            this.is_alive = false
        }
    }

    gen_description(){
        return `Щит [${this.value}/${this.max_value}] | броня ${this.armor} | длит ${this.duration} `
    }
}

export {Shield}