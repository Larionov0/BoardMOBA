import { GameState } from "../classes/game_state.js"


function make_hero_ref(hero){
    return {
        type: hero.is_hero ? 'hero' : 'minion',
        team: hero.team,
        index: hero.index,  // FIXME: do it before game starts
        id: hero.id
    }
}


function make_shield_mask(shield){
    var mask = {}

    for (let [key, value] of Object.entries(shield)){
        if (['hero', 'caster', 'game_state'].includes(key)) continue

        mask[key] = value
    }

    mask.hero = make_hero_ref(shield.hero)
    mask.caster = make_hero_ref(shield.caster)

    return mask
}


function make_skill_mask(skill){
    var mask = {}
    for (let [key, value] of Object.entries(skill)){
        if (['func'].includes(key)) continue

        mask[key] = value
    }

    return mask
}


function make_hero_mask(hero){
    var mask = {}

    for (let [key, value] of Object.entries(hero)){
        if (['effects', 'my_effects', 'shields', 'skills', 'game_state'].includes(key)) continue

        if (['html_link', 'cell_link', 'left_click_listener', 'dop_marks_generators'].includes(key)) continue

        mask[key] = value
    }

    mask.shields = []
    for (let shield of hero.shields){
        mask.shields.push(make_shield_mask(shield))
    }

    mask.skills = []
    for (let skill of hero.skills){
        mask.skills.push(make_skill_mask(skill))
    }

    return mask
}


function make_effect_mask(effect){
    var mask = {}

    for (let [key, value] of Object.entries(effect)){
        if (['hero', '_caster', 'game_state'].includes(key)) continue

        mask[key] = value
    }

    mask.hero = make_hero_ref(effect.hero)
    mask.caster = make_hero_ref(effect.caster)
    mask.class_name = effect.constructor.name
    return mask
}


function make_tower_mask(tower){
    var mask = {}

    for (let [key, value] of Object.entries(tower)){
        if (['game_state'].includes(key)) continue
        if (['html_link', 'cell_link', 'dop_marks_generators'].includes(key)) continue

        mask[key] = value
    }
    return mask
}


function make_minion_mask(minion){
    var mask = {}

    for (let [key, value] of Object.entries(minion)){
        if (['game_state', 'effects', 'shields'].includes(key)) continue
        if (['html_link', 'cell_link', 'dop_marks_generators'].includes(key)) continue

        mask[key] = value
    }

    mask.shields = []
    mask.effects = []
    return mask
}


function make_game_state_mask(game_state){
    var mask = {}

    for (let [key, value] of Object.entries(game_state)){
        if (['dom_helper', 'all_heroes', 'heroes1', 'heroes2', 'towers', 'minions', 'walls', 'n', 'm', 'root', 'keyboard_setupped'].includes(key)) continue

        mask[key] = value
    }
    return mask
}


function make_total_mask(game_state){
    var mask = {
        heroes: [],
        effects: [],
        towers: [],
        minions: [],
        game_state: make_game_state_mask(game_state)
    }

    for (let hero of game_state.all_heroes){
        mask.heroes.push(make_hero_mask(hero))
    }

    for (let hero of game_state.all_heroes){
        for (let effect of hero.effects){
            mask.effects.push(make_effect_mask(effect))
        }
    }

    for (let minion of game_state.minions){
        mask.minions.push(make_minion_mask(minion))
    }

    for (let minion of game_state.minions){
        for (let effect of minion.effects){
            mask.effects.push(make_effect_mask(effect))
        }
    }

    game_state.towers.forEach((tower)=>{
        mask.towers.push(make_tower_mask(tower))
    })

    return mask
}


export {make_total_mask}
