import { GameState } from "../classes/game_state.js"


function make_hero_ref(hero){
    return {
        team: hero.team,
        index: hero.index  // FIXME: do it before game starts
    }
}


function make_shield_mask(shield){
    var mask = {}

    for (let [key, value] of Object.entries(shield)){
        if (['hero', 'caster'].includes(key)) continue

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


function make_game_state_mask(game_state){
    var mask = {}

    for (let [key, value] of Object.entries(game_state)){
        if (['dom_helper', 'all_heroes', 'heroes1', 'heroes2', 'n', 'm', 'root', 'keyboard_setupped'].includes(key)) continue

        mask[key] = value
    }
    return mask
}


function make_total_mask(game_state){
    var mask = {
        heroes: [],
        effects: [],
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

    return mask
}


export {make_total_mask}
