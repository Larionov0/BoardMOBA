class GameObject {
    constructor (i, j, is_solid, token_img_src, color){
        this.i = i
        this.j = j
        this.is_solid = is_solid
        this.token_img_src = token_img_src
        this.color = color
        this.is_creature = false
    }

    get coords(){
        return [this.i, this.j]
    }
}

export {GameObject}