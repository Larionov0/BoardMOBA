function set_up_update_loop(get_and_apply_mask){
    setInterval(()=>{
        console.log('Loop works')
        if (! window.game_state.my_turn){
            get_and_apply_mask()
        }
    }, 1000)
}


export {set_up_update_loop}