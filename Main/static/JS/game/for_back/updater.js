function apply_mask_to_hero(hero_mask, hero){
    for (let [key, value] of Object.entries(hero_mask)){
        hero[key] = value
    }
}

function create_heroes_from_mask(mask){
    var GameState = window.GameState
    var all_heroes = window.all_heroes

    var all_obj_heroes = []
    for (let hero_mask of mask.heroes){
        var hero = all_heroes.filter((hero)=>hero().eng_name==hero_mask.eng_name)[0]()
        apply_mask_to_hero(hero_mask, hero)
        all_obj_heroes.push(hero)
    }
    return all_obj_heroes
}

function apply_mask_to_game_state(mask, game_state){
    for (let [key, value] of Object.entries(mask.game_state)){
        game_state[key] = value
    }
}

function create_game_state_from_mask(mask){  // mask -> game_state
    // console.log(mask);
    var GameState = window.GameState
    var all_heroes = window.all_heroes


    var all_heroes = create_heroes_from_mask(mask)
    var heroes = {
        1: Array(mask.heroes.length / 2).fill(null),
        2: Array(mask.heroes.length / 2).fill(null)
    }
    
    var new_all_heroes = Array(mask.heroes.length).fill(null)

    for (let hero of all_heroes){
        heroes[hero.team][hero.index] = hero
        new_all_heroes[hero.global_index] = hero
    }

    const game_state = new GameState(heroes[1], heroes[2], new_all_heroes, mask.my_turn)
    game_state.update_n_m(mask.game_state.map.n, mask.game_state.map.m)
    game_state.dop_marks = mask.dop_marks
    apply_mask_to_game_state(mask, game_state)

    window.team = mask.team
    game_state.marks = mask.marks
    return game_state
}


function apply_ui_action(mask, ui_action){
    if (ui_action.type == 'redraw'){
        console.log('redraw');
        let game_state = create_game_state_from_mask(mask)
        window.game_state = game_state
        game_state.dom_helper.redraw_all()
    } else if (ui_action.type == 'damage'){
        console.log('damage')
        let target = window.game_state.find_creature_by_id(ui_action.target_id)
        target.be_attacked_animation()
    }
}


function on_mask_get(mask){
    if (mask.blank === true){ console.log(window.update_id); console.log('mask is blank'); return }
    
    window.update_id = mask.update_id
    window.can_update = false

    var base_timeout = 0
    for (let ui_action of mask.ui_actions){
        setTimeout(()=>apply_ui_action(mask, ui_action), base_timeout * 1000)
        base_timeout += ui_action.duration
    }

    setTimeout(()=>{window.can_update = true}, base_timeout * 1000)
}

function get_and_apply_mask(){
    fetch('/main/get_mask/', {
        method: 'POST',
        headers: {'X-CSRF-TOKEN': csrf_token},
        body: JSON.stringify({'update_id': window.update_id})
    }).then((response)=>response.json()).then(on_mask_get)
}

export {get_and_apply_mask }