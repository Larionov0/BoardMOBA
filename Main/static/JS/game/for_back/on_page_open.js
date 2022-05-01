import { get_and_apply_mask } from "./updater.js";
import { GameState } from "../classes/game_state.js";
import { all_heroes } from "../heroes/all_heroes.js";
import { set_up_update_loop } from "./update_loop.js";


function on_first_open(){
    window.GameState = GameState
    window.all_heroes = all_heroes
    get_and_apply_mask()
    set_up_update_loop(get_and_apply_mask)
}


export {on_first_open}
