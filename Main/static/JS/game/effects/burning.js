import { Effect } from "./effect.js";

class Burning extends Effect{
    constructor(hero, game_state){
        super('горение', 'burning.png', hero, game_state)
    }

    gen_description(){
        return `Горение []`
    }
}


export {Burning}