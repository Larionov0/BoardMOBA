function set_up_update_loop(get_and_apply_mask){
    setInterval(()=>{
        if (! window.game_state.my_turn){
            if (window.can_update)
                get_and_apply_mask()
        }
    }, 1000)
}


export {set_up_update_loop}