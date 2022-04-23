import { draw_hero } from "./draw_hero.js";


function draw_logs(game_state){
    return game_state.logs.slice(0).reverse().map((log)=>`<div class='log'>${log}</div>`).join(' ')
}


function draw_right_global(game_state) {
    var heroes1 = game_state.heroes1.map((hero)=>draw_hero(hero, game_state))
    var heroes2 = game_state.heroes2.map((hero)=>draw_hero(hero, game_state))

    var dop_row_classes = ['', '']
    dop_row_classes[window.team - 1] = 'my_hero_row'
    var team_color = window.team == 1 ? 'blue' : 'red'

    var  mark_cur_hero = (heroes, game_state)=>{ heroes[game_state.active_hero_index] = `<b>${heroes[game_state.active_hero_index]}</b>` ; return heroes }

    return `
        <div id="right_global">
            <div id="heroes">
                <div class="heroes_row ${dop_row_classes[0]}">
                    ${heroes1.join(' ')}
                </div>
                <div class="heroes_row ${dop_row_classes[1]}">
                    ${heroes2.join(' ')}
                </div>
            </div>
            <div id="down_panel">
                <div id="first_down_col">
                    <button id='end_turn_btn'>Закончить ход</button>
                    <div id='info_panel' class='${team_color}'>
                        <p>Вы игрок ${window.team} (${window.team==1?'синие':'красные'})</p>
                        ${game_state.get_active_hero().team==window.team?'<p><b>Сейчас ваш ход</b></p>':''}
                        <p>Поочередность ходов: ${ mark_cur_hero(game_state.all_heroes.map((hero)=>hero.name), game_state).join(' -> ') } </p>
                    </div>
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
