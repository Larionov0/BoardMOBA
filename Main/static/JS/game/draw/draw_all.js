import { draw_right_global } from "./draw_right_global.js";
import { draw_map } from "./draw_map.js";


function draw_all(game_state) {
    return `
    <div id="main">
        <div id="left_global">
            <div id="map">
                ${draw_map(game_state)}
            </div>
        </div>
        ${draw_right_global(game_state)}
    </div>
    `
}

export { draw_all }
