class Effect{
    constructor(name, img_src, hero, game_state, caster){
        this.name = name
        this.img_src = img_src
        this.hero = hero
        this.game_state = game_state
        this.is_alive = true
        this.caster = caster
    }

    get caster(){return this._caster}
    set caster(val){
        if (typeof val === 'object' && val.constructor.name=='Hero'){
            this._caster = val
            this._caster.my_effects.push(this)
        }
    }

    gen_description () {
        return `Effect`
    }

    on_getting(){
        // при накладывании
    }

    before_move() {

    }

    after_move() {

    }

    before_target_move(){

    }

    after_target_move(){
        
    }

    gen_modificators(){
        // нужен одноходовый модификатор
        return []
    }
}


class DurableEffect extends Effect {
    constructor (name, img_src, hero, game_state, duration, caster){
        super(name, img_src, hero, game_state, caster)
        this.duration = duration
    }

    decrease_duration (){
        this.duration -= 1
        if (this.duration <=0 ){
            this.is_alive = false
        }
    }
}


export {Effect, DurableEffect}