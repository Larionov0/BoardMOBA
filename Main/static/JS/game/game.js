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


window.game_state = []
on_first_open()
