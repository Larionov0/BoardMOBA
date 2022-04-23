function get_map_matrix(game_state){
    var matrix = Array(game_state.n).fill().map(()=>Array(game_state.m).fill())  // gen matrix filled undefined
    
    function set_el(matrix, i, j, value){
        if (matrix[i][j] == undefined)
            matrix[i][j] = []
        matrix[i][j].push(value)
    }

    game_state.marks.forEach((mark)=>{
        if (0<=mark.i && mark.i<game_state.n  &&  0<=mark.j && mark.j < game_state.m)
            set_el(matrix, mark.i, mark.j, `<div class='mark' style='background-color: ${mark.color}'>`)
    })

    game_state.walls.forEach((wall)=>{
        if (0<=wall.i && wall.i<game_state.n  &&  0<=wall.j && wall.j < game_state.m)
            set_el(matrix, wall.i, wall.j, `<div class='wall'>`)
    })

    game_state.alive_towers.forEach((tower)=>{
        for (let i = tower.i; i <= tower.end_i; i++){
            for (let j = tower.j; j <= tower.end_j; j++){
                set_el(matrix, i, j, `<div class='tower' title='${tower.hp}/${tower.max_hp}' style='background-color: ${tower.color}'>`)
            }
        }
    })

    game_state.alive_minions.forEach((minion)=>{
        set_el(matrix, minion.i, minion.j, `<div class='minion' title='${minion.hp}/${minion.max_hp}' style='background-color: ${minion.color}'>`)
    })

    game_state.all_heroes.forEach((hero)=>{
        if (hero.is_alive)
            set_el(matrix, hero.i, hero.j,`<div class='hero_token' style='background-color: ${hero.color}'><img src='/static/IMG/heroes/${hero.eng_name}/${hero.token_img_src}'>` )
    })

    return matrix
}


function draw_map(game_state){
    var matrix = get_map_matrix(game_state)
    var html_map = ``
    matrix.forEach((row)=>{
        html_map += `<div class='map_row'>`
        row.forEach((el)=>{
            let html_inside = ''
            if (el != undefined){
                if (Array.isArray(el)){
                    html_inside = ''
                    for (let part of el){
                        html_inside += part
                    }
                    for (let part of el){
                        html_inside += '</div>'
                    }
                } else {html_inside = el}
            }
            html_map += `<div class='map_cell'>${html_inside}</div>`
        })
        html_map += `</div>`
    })
    return html_map
}


export {draw_map}