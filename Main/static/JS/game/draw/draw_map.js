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