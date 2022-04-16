import { DomHelper } from "../dom_helper.js"
import { getRandomInt } from "../tools/random.js"
import { Poison } from "../effects/poison.js"
import { Burning } from "../effects/burning.js"
import { Shield } from "./shield.js"
import { Bleeding } from "../effects/bleeding.js"
import { sub_loop } from "../for_back/main_sub_loops.js"
import { post_mask } from "../for_back/main_sub_loops.js"


class GameState {
    constructor(heroes1, heroes2, active_hero_index=0, n=12, m=16){
        this.dom_helper = new DomHelper(this)

        this.marks = []

        this.all_heroes = []
        this.heroes1 = heroes1
        this.heroes2 = heroes2
        this.active_hero_index = active_hero_index
        this.n = n
        this.m = m
        var root = document.querySelector(':root');
        root.style.setProperty('--n', n)
        root.style.setProperty('--m', m)

        this.logs = []
        this.keyboard_setupped = false
        window.game_state.push(this)
    }

    log(message){
        console.log(message);
        this.logs.push(message)
    }

    find_obj_by_coords(i, j){
        for (let obj of this.get_all_game_objects()){
            if (obj.i == i && obj.j == j) return obj
        }
        return null
    }

    find_hero_by_coords(i, j){
        for (let obj of this.all_heroes){
            if (obj.i == i && obj.j == j) return obj
        }
        return null
    }

    get_all_game_objects(){
        return [...this.all_heroes]
    }

    get_active_hero(){
        return this.all_heroes[this.active_hero_index]
    }

    start_game (){
        this.all_heroes = [...this.heroes1, ...this.heroes2]
        this.all_heroes = this.all_heroes.shuffle()
        this.all_heroes.forEach((hero)=>{hero.i = getRandomInt(0, this.n-1); hero.j = getRandomInt(0, this.m-1); hero.game_state=this})
        
        this.heroes1.forEach((hero, index)=>{hero.team=1; hero.color='rgba(0, 0, 255, 0.3)', hero.index=index})
        this.heroes2.forEach((hero, index)=>{hero.team=2; hero.color='rgba(255, 0, 0, 0.3)', hero.index=index})

        this.all_heroes.forEach((hero, index)=>{hero.global_index = index})
        // var target = this.heroes1[0]
        // target.effects.push(new Bleeding(target, this, this.heroes2[0], 5))

        this.active_hero_index = 0

        this.before_hero_move()
    }

    update_marks (){
        if (this.get_active_hero().team == window.team)
            this.marks = this.get_active_hero().gen_active_marks()
    }

    before_hero_move(){
        var hero = this.all_heroes[this.active_hero_index]
        if (! hero.is_alive){
            this.after_hero_move()
            return
        }
        hero.before_move(this)
        setTimeout(()=>{this.after_action()}, 200)
    }


    after_hero_move(){
        this.get_active_hero().after_move(this)
        this.active_hero_index += 1
        if (this.active_hero_index == this.all_heroes.length) this.active_hero_index = 0

        if (! this.check_my_turn())  this.before_hero_move()
    }

    cell_clicked(cell_html, i, j){
        console.log(`click on ${i} ${j}`)
        this.get_active_hero().cell_clicked(i, j, this)
    }

    cell_rightclicked(cell_html, i, j){
        console.log(`Right click on ${i} ${j}`)
        this.get_active_hero().cell_rightclicked(i, j, this)
    }

    wasd_pressed(key){
        this.get_active_hero().wasd_pressed(key, this)
    }

    after_action(){
        this.update_marks()
        this.dom_helper.redraw_all()
    }

    is_out_of_map(i, j){
        return i < 0 || j < 0 || i >= this.n || j >= this.m
    }

    // ----

    stop_my_turn(){
        clearInterval(window.mainloop)
        post_mask()
        sub_loop()
    }

    check_my_turn(){
        console.log('CHECKING!!!');
        if (this.get_active_hero().team != window.team){
            console.log('STOPPED TURN!')
            this.stop_my_turn()
            return true
        }
        return false
    }
}


export {GameState}
