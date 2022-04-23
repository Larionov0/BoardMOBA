import { GameObject } from "../game_object.js";

class Wall extends GameObject {
    constructor(i, j){
        super(i, j, true, null, 'gray')
    }
}

export {Wall}
