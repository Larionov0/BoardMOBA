import { draw_hero } from "./draw_hero.js";


function draw_logs(game_state){
    return game_state.logs.slice(0).reverse().map((log)=>`<div class='log'>${log}</div>`).join(' ')
}


function draw_right_global(game_state) {
    var heroes1 = game_state.heroes1.map((hero)=>draw_hero(hero, game_state))
    var heroes2 = game_state.heroes2.map((hero)=>draw_hero(hero, game_state))
    return `
        <div id="right_global">
            <div id="heroes">
                <div class="heroes_row">
                    ${heroes1.join(' ')}
                </div>
                <div class="heroes_row">
                    ${heroes2.join(' ')}
                </div>
            </div>
            <div id="down_panel">
                <div id="first_down_col">
                    <button id='end_turn_btn'>End turn</button>
                </div>
                <div id='second_down_col'>
                    <div id="logs_panel">
                        ${draw_logs(game_state)}
                    </div>
                </div>
            </div>
        </div>
    `
}


export {draw_right_global}
