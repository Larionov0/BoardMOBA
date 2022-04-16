import { make_total_mask } from "./make_mask.js"
import { create_game_state_bases } from "./create_bases.js";
import { apply_mask } from "./apply_mask.js";
import { sstringify, sparse } from "../tools/json_parser.js";


function on_first_open_main(){
    window.main_game_state = create_game_state_bases(heroes_names[1], heroes_names[2])
    window.main_game_state.start_game()
    if (window.main_game_state.get_active_hero().team == window.team){
        console.log('On start MAIN LOOP started');
        main_loop()
    }
    else {
        post_mask()
        sub_loop()
    }
}


function on_first_open_sub(){
    window.main_game_state = create_game_state_bases(heroes_names[1], heroes_names[2])
    sub_loop()
}


function main_loop(){
    console.log('MAINLOOP STARTED');
    window.mainloop = setInterval(()=>{
        post_mask()
        console.log('post');
    }, 1000)
}


function post_mask(){
    fetch('/main/set_mask/', {
        method: 'POST',
        body: sstringify( make_total_mask(window.main_game_state) )
    })
}


function sub_loop(){
    console.log('SUBLOOP STARTED');

    window.mainloop = setInterval(()=>{
        console.log('get');
        fetch('/main/get_mask/', {}).then((resp)=>resp.json()).then((data)=>{
            var mask = sparse(data.mask)
            apply_mask(window.main_game_state, mask)
            window.main_game_state.after_action()
            if(window.main_game_state.get_active_hero().team == window.team){
                console.log("passive changed to ACTIVE")
                clearInterval(window.mainloop)
                window.main_game_state.before_hero_move()
                main_loop()
            }
        })
    }, 1000)
}


function on_first_open(){
    if(team==1) on_first_open_main()
    else on_first_open_sub()
}


export {on_first_open, on_first_open_main, on_first_open_sub, main_loop, sub_loop, post_mask}
