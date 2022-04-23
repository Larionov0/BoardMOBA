import { Tower } from "../classes/game_objects/map_objects/tower.js"
import { WallsArea } from "../classes/game_objects/map_objects/wall_area.js"

var apply_main_map_maker = (game_state)=>{
    var n = 34
    var m = 22
    game_state.walls = []
    game_state.minions = []
    game_state.towers = []

    game_state.update_n_m(n, m)
    
    var walls_areas = [
        new WallsArea(5, 0, 28, 7),
        new WallsArea(5, 15, 28, 22)
    ]
    for (let walls_area of walls_areas){
        game_state.walls.push(...walls_area.create_walls())
    }

    game_state.towers.push(
        new Tower(game_state, 1, 'башня 2', 'tower 2', 6, 13, 2, 2, 200, 1, 20, [5, 7, 6, 8]),
        new Tower(game_state, 1, 'башня 1', 'tower 1', 0, 10, 2, 2, 300, 1, 25, [22, 7, 6, 8]),
        new Tower(game_state, 2, 'башня 2', 'tower 2', 26, 8, 2, 2, 200, 1, 20, [22, 7, 6, 8]),
        new Tower(game_state, 2, 'башня 1', 'tower 1', 32, 10, 2, 2, 300, 1, 25, [22, 7, 6, 8])
    )

    game_state.minions_spawn_points = [
        {i: 2, j: 10, type: 'archer', team: 1},
        {i: 2, j: 11, type: 'archer', team: 1},
        {i: 3, j: 10, type: 'warrior', team: 1},
        {i: 3, j: 11, type: 'warrior', team: 1},

        {i: 31, j: 10, type: 'archer', team: 2},
        {i: 31, j: 11, type: 'archer', team: 2},
        {i: 30, j: 10, type: 'warrior', team: 2},
        {i: 30, j: 11, type: 'warrior', team: 2},
    ] 

    game_state.heroes_spawn_points = {
        1: [[0, 8], [0, 9], [0, 12], [0, 13]],
        2: [[33, 8], [33, 9], [33, 12], [33, 13]].reverse()
    }
}

export {apply_main_map_maker}