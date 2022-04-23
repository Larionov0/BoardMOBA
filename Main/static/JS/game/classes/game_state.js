import { DomHelper } from "./dom_helper.js"
import { getRandomInt } from "../tools/random.js"
import { sub_loop } from "../for_back/main_sub_loops.js"
import { post_mask } from "../for_back/main_sub_loops.js"
import { distance } from "../tools/math_tools.js"
import { Minion } from "./game_objects/map_objects/minion.js"


class GameState {
    constructor(heroes1, heroes2, active_hero_index=0, n=12, m=16, turn_number=0){
        this.dom_helper = new DomHelper(this)

        this.marks = []

        this.walls = []
        this.towers = []
        this.minions = []

        this.all_heroes = []
        this.heroes1 = heroes1
        this.heroes2 = heroes2
        this.active_hero_index = active_hero_index

        this.update_n_m(n, m)

        this.logs = []
        this.keyboard_setupped = false
        window.game_state.push(this)

        this.turn_number = turn_number
        this.minions_spawn_points = []  // [{i, j, type}]
        this.heroes_spawn_points = {1: [], 2: []}
    }

    get alive_heroes(){ return this.all_heroes.filter((obj)=>obj.is_alive) }
    get alive_towers(){ return this.towers.filter((obj)=>obj.is_alive) }
    get alive_minions(){ return this.minions.filter((obj)=>obj.is_alive) }
    get alive_tower_parts(){ 
        var tower_parts = []
        this.alive_towers.forEach((tower)=>{
            tower_parts.push(...tower.make_parts())
        })
        return tower_parts
    }

    get_minion_by_id(id){
        for (let minion of this.minions){
            if (minion.id == id) return minion
        }
        return null
    }

    get_sorted_minions(){
        return this.alive_minions.sort((min1, min2)=>{
            if (min1.type != min2.type){
                if (min1.type == 'warrior') return -1
                else return 1
            }

            else if (min1.team != min2.team){
                return min1.team - min2.team
            }

            else {
                if (min1.i != min2.i) return min1.i - min2.i
                else return min1.j - min2.j
            }
        })
    }

    update_n_m(n, m){
        var root = document.querySelector(':root');
        this.n = n
        this.m = m
        root.style.setProperty('--n', n)
        root.style.setProperty('--m', m)
    }

    log(message){
        console.log(message);
        this.logs.push(message)
    }

    find_obj_by_coords(i, j, creature=false){
        for (let obj of this.get_all_game_objects()){
            if (obj.i == i && obj.j == j && (! creature || obj.is_creature)) return obj
        }
        // for (let tower of this.towers){
        //     if (tower.i <= i  && i <= tower.end_i  && tower.j <= j && j <= tower.end_j) return tower
        // }
        return null
    }

    find_solid_obj_by_coords(i, j){
        for (let obj of this.get_all_game_objects()){
            if (obj.i == i && obj.j == j && obj.is_solid) return obj
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
        return [...this.all_heroes, ...this.walls, ...this.alive_tower_parts, ...this.alive_minions]
    }

    get_active_hero(){
        return this.all_heroes[this.active_hero_index]
    }

    get_all_objects_in_range(i, j, range, predicat=(obj)=>true){
        return this.get_all_game_objects().filter((obj)=>{
            if (distance(obj.coords, [i, j]) <= range) {
                if (predicat(obj)) return true
            }
            return false
        })
    }


    spawn_hero(hero){
        for (let point of this.heroes_spawn_points[hero.team]){
            if (this.find_hero_by_coords(point[0], point[1])==null){
                hero.i = point[0]
                hero.j = point[1]
                return
            }
        }
    }

    start_game (){
        this.all_heroes = [...this.heroes1, ...this.heroes2]
        this.all_heroes = this.all_heroes.shuffle()
        
        this.heroes1.forEach((hero, index)=>{hero.team=1; hero.color='rgba(0, 0, 255, 0.3)', hero.index=index})
        this.heroes2.forEach((hero, index)=>{hero.team=2; hero.color='rgba(255, 0, 0, 0.3)', hero.index=index})

        this.all_heroes.forEach((hero)=>{this.spawn_hero(hero); hero.game_state=this})
        this.all_heroes.forEach((hero, index)=>{hero.global_index = index})

        this.active_hero_index = 0

        this.all_heroes.forEach((hero)=>{ hero.on_game_start(this) })
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

    gen_new_minion_id(){
        var max_id = 0
        this.minions.forEach((minion)=>{
            if (minion.id > max_id) max_id = minion.id
        })

        return max_id + 1
    }

    spawn_minions(){
        this.minions_spawn_points.forEach((spawn)=>{
            this.minions.push(Minion.spawn_from_spawn_point(this, spawn))
        })
    }

    end_turn(after_f){
        for (let tower of this.alive_towers){
            tower.my_turn()
        }

        var end_turn_part2 = ()=>{
            // alert('END')
            this.turn_number += 1
            if (this.turn_number % 8 == 1) this.spawn_minions()
    
            this.towers = this.towers.filter((tower)=>tower.is_alive)
            this.minions = this.minions.filter((minion)=>minion.is_alive)

            
            this.active_hero_index = 0
            after_f()
        }

        var iter = (minions, i=0) => {
            if (i >= minions.length) return end_turn_part2()
            let minion = minions[i]
            minion.my_turn()
            this.after_action()
            setTimeout(()=>{iter(minions, i+1)}, 300)
        }

        iter(this.get_sorted_minions())
    }

    after_hero_move(){
        this.get_active_hero().after_move(this)

        if (this.active_hero_index + 1 == this.all_heroes.length) this.end_turn(()=>{
            if (! this.check_my_turn())  this.before_hero_move()
        })
        else { this.active_hero_index += 1
            if (! this.check_my_turn())  this.before_hero_move() }
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

    check_my_turn_alternative(){
        console.log('CHECKING!!!');
        var hero = this.all_heroes[this.active_hero_index+1]
        if (hero.team != window.team){
            console.log('STOPPED TURN!')
            this.active_hero_index += 1
            this.stop_my_turn()
            return true
        } else {
            this.active_hero_index += 1
        }
        return false
    }
}


export {GameState}
