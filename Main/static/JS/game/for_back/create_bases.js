import { GameState } from "../classes/game_state.js";
import { all_heroes } from "../heroes/all_heroes.js";
import { apply_main_map_maker } from "../map_makers/main_map.js";

function create_game_state_bases(heroes_names1, heroes_names2, map_name='main_map'){
    // Создаём сааамую основу, которая после получения апдейта со всеми масками будет знатно обновлена
    function find_hero(name, heroes){
        return heroes.filter((hero)=>hero().name==name)[0]()
    }
    function heroes_creator(names, heroes){
        return names.map((name)=>find_hero(name, heroes))
    }

    var game_state = new GameState(heroes_creator(heroes_names1, all_heroes), heroes_creator(heroes_names2, all_heroes))
    if (map_name == 'main_map'){
        apply_main_map_maker(game_state)
    }

    return game_state
}

export {create_game_state_bases}