import { draw_all } from "./draw/draw_all.js";
import { GameState } from "./classes/game_state.js";

import { tester_hero } from "./heroes/tester.js";
import { karl } from "./heroes/karl.js";
import { arny } from "./heroes/arny.js";
import { emma } from "./heroes/emma.js";
import { make_total_mask } from "./for_back/make_mask.js";
import { apply_mask } from "./for_back/apply_mask.js";
import { Poison } from "./effects/poison.js";
import { create_game_state_bases } from "./for_back/create_bases.js";
import { sstringify } from "./tools/json_parser.js";
import { on_first_open } from "./for_back/main_sub_loops.js";

function deepclone(obj){
    return Object.assign(Object.create(Object.getPrototypeOf(obj)), obj)
}

// var heroes1 = [emma, arny]
// var heroes2 = [tester_hero.clone(), karl]
// var game_state = new GameState(heroes1, heroes2, 0, 12, 12)

window.game_state = []
on_first_open()

// var game_state_orig = create_game_state_bases(['арни', 'tester'], ['эмма', "карл"])
// game_state_orig.start_game()


// var mask = JSON.stringify(make_total_mask(game_state_orig))

// var game_state2 = create_game_state_bases(['арни', 'tester'], ['эмма', "карл"])
// apply_mask(game_state2, JSON.parse(mask))

// var body = document.getElementsByTagName('body')[0]
// body.replaceWith(body.cloneNode(true))
// game_state2.after_action()
// game_state2.before_hero_move()
