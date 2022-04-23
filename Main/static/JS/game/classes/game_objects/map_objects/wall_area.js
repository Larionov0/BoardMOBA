import { Wall } from "./wall.js"

class WallsArea {
    constructor (start_i, start_j, end_i, end_j) {
        this.start_i = start_i
        this.start_j = start_j
        this.end_i = end_i
        this.end_j = end_j
    }

    create_walls (){
        var walls = []
        for (let i = this.start_i; i<=this.end_i; i++){
            for (let j = this.start_j; j <= this.end_j; j++){
                walls.push(new Wall(i, j))
            }
        }
        return walls
    }
}

export {WallsArea}