class Skill {
    constructor (name, img_src, cooldown, energy, description, func){
        this.name = name
        this.img_src = img_src
        this.cooldown = cooldown
        this.cur_cooldown = 0
        this.energy = energy
        this.description = description
        this.func = func  // функция запуска скилла
        this.chosen = false
    }

    cooldown_down(){
        if (this.cur_cooldown > 0) this.cur_cooldown -= 1
    }

    start (game_state, hero) {
        if (hero.energy >= this.energy && this.cur_cooldown == 0){
            this.chosen = true
            this.func(game_state, hero, this)
        }
    }

    standard_aftercast(game_state, hero){
        hero.energy -= this.energy
        hero.left_click_listener = null
        hero.cancel_skill(false)

        this.cur_cooldown = this.cooldown + 1
    }

    reduce_cooldown(game_state, hero, duration_amount){
        for (let i = 0; i < duration_amount; i++){
            if (this.cur_cooldown==0) return
            this.cooldown_down()
        }
    }
}


export {Skill}
