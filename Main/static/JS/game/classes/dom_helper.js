import { draw_all } from "../draw/draw_all.js"


function deepclone(obj){
    return Object.assign(Object.create(Object.getPrototypeOf(obj)), obj)
}


class DomHelper{
    constructor (game_state){
        this.keyboard_setupped = false
        this.game_state = game_state
        this.listeners = this.create_clear_listeners()
    }

    create_clear_listeners () {
        return {
            'hero': {},  // game_state, hero, card_html
            'skill': {}  // game_state, hero, skill, skill_html
        }
    }
 
    add_event_listener(for_, name, listener){
        this.listeners[for_][name] = listener
    }

    remove_event_listener(for_, name){
        delete this.listeners[for_][name]
    }

    link_heroes(){
        document.querySelectorAll('.heroes_row').forEach((row, row_i)=>{
            row.querySelectorAll('.hero_card').forEach((card, hero_i)=>{[this.game_state.heroes1, this.game_state.heroes2][row_i][hero_i].html_link=card})
        })

        document.querySelectorAll('.map_row').forEach((row, i)=>{
            row.querySelectorAll('.map_cell').forEach((cell, j)=>{
                for (let hero of this.game_state.all_heroes){
                    if (hero.i == i && hero.j == j) hero.cell_link = cell
                }

                for (let tower of this.game_state.alive_towers){
                    if ( tower.i <= i && i <= tower.end_i && tower.j <= j && j <= tower.end_j)  tower.cell_link = cell
                }

                for (let minion of this.game_state.minions){
                    if (minion.i == i && minion.j == j) minion.cell_link = cell
                }
            })
        })
    }

    set_up_end_btn_listener(){
        document.getElementById('end_turn_btn').addEventListener('click', (e)=>{this.game_state.after_hero_move()})
    }

    set_up_cells_listeners(){
        document.querySelectorAll('.map_row').forEach((row, i)=>{
            row.querySelectorAll('.map_cell').forEach((cell, j)=>{
                cell.addEventListener('click', ()=>{
                    this.game_state.cell_clicked(cell, i, j)
                })
                cell.oncontextmenu = ()=>{
                    this.game_state.cell_rightclicked(cell, i, j)
                    return false
                }
            })
        })
    }

    set_up_wasd_listeners(){
        if (! this.game_state.keyboard_setupped){
            if (window.keyboard_setupped)
            {
                document.removeEventListener('keydown', window.keyboard_listener)
            }

            var listener = (e)=>{
                if (['w', 'a', 's', 'd'].includes(e.key)){
                    this.game_state.wasd_pressed(e.key)
                }
            }
            document.addEventListener('keydown', listener)
            this.game_state.keyboard_setupped = true
            window.keyboard_setupped = true
            window.keyboard_listener = listener
        }
    }

    set_up_skills_listeners(){
        const hero = this.game_state.get_active_hero()
        hero.html_link.querySelectorAll('.skill').forEach((skill, i)=>{
            skill.addEventListener('click', (e)=>{hero.skill_clicked(i+1, this.game_state)})
        })
    }

    set_up_upgrades_listeners(){
        const hero = this.game_state.get_active_hero()
        var params = [{i: 1, j: 0, par: 'max_hp'}, {i: 1, j: 1, par: 'max_energy'}, {i: 1, j: 2, par: 'armor'}, 
                      {i: 3, j: 0, par: 'power'}, {i: 3, j: 1, par: 'magic'}, {i: 3, j: 2, par: 'attack_range'}]
        hero.html_link.querySelectorAll('.table_row').forEach((row, i)=>{
            row.querySelectorAll('.par_cell').forEach((par_cell, j)=>{
                let n_params = params.filter((param)=>param.i==i && param.j == j)
                if (n_params.length == 1){
                    let param = n_params[0]
                    par_cell.addEventListener('dblclick', ()=>{hero.try_to_upgrade_param(param.par)})
                }
            })
        })
    }

    set_up_event_listeners(){
        this.link_heroes()
        if (this.game_state.my_turn){
            console.log('LISTENERS SETTUPED')
            this.set_up_wasd_listeners()
            this.set_up_end_btn_listener()
            this.set_up_cells_listeners()
            this.set_up_skills_listeners()
            this.set_up_upgrades_listeners()
        } else {
            if (window.keyboard_setupped) {
                document.removeEventListener('keydown', window.keyboard_listener)
                window.keyboard_setupped = false
                this.game_state.keyboard_setupped = false
            }
        }
    }

    redraw_all (){
        var body = document.getElementsByTagName('body')[0]
        var new_html = draw_all(this.game_state)

        if (this.last_html != new_html){
            console.log(`REDRAW ALL`)
            body.innerHTML = new_html
            this.last_html = new_html
            this.set_up_event_listeners()
        }
    }

    clear_all_listeners () {
        this.listeners = this.create_clear_listeners()
    }

    // draw methods
}

export { DomHelper }
