import { Minion } from "../classes/game_objects/map_objects/minion.js"
import { Tower } from "../classes/game_objects/map_objects/tower.js"
import { Modificator } from "../classes/modificator.js"
import { Shield } from "../classes/shield.js"
import { Upgrades } from "../classes/upgrades.js"
import {Bleeding, Burning, DelayedDamage, Poison, Slowdown, Solidity, Stun, Toxicity, Silence } from '../effects/all_effects_types.js'

function get_hero_from_ref(game_state, ref){  // ref: {team: 1, index: 0}
    var team = ref.team==1 ? game_state.heroes1 : game_state.heroes2
    return team[ref.index]
}

function get_minion_from_ref(game_state, ref){
    return game_state.get_minion_by_id(ref.id)
}

function classic_mask_apply(obj, mask){
    for (let [key, value] of Object.entries(mask))
        obj[key] = value
}


function apply_heroes_indexes_and_sort(game_state, mask){
    game_state.all_heroes = Array(game_state.heroes1.length * 2).fill(null)

    for (let hero of game_state.heroes1){
        let hero_mask = mask.heroes.filter((hero_mask)=>hero_mask.team==1 && hero_mask.name == hero.name)[0]
        hero.index = hero_mask.index
        game_state.all_heroes[hero_mask.global_index] = hero
    }
    game_state.heroes1.sort((hero1, hero2)=>hero1.index<hero2.index)
    for (let hero of game_state.heroes2){
        let hero_mask = mask.heroes.filter((hero_mask)=>hero_mask.team==2 && hero_mask.name == hero.name)[0]
        hero.index = hero_mask.index
        game_state.all_heroes[hero_mask.global_index] = hero
    }
    game_state.heroes2.sort((hero1, hero2)=>hero1.index<hero2.index)
}


function apply_game_state_mask(game_state, mask){
    classic_mask_apply(game_state, mask['game_state'])
    game_state.aaaaaaaaaaaaaa = true
}


function apply_skill_mask(skill, skill_mask){
    classic_mask_apply(skill, skill_mask)
}

function create_shield_from_mask(game_state, shield_mask){
    var hero = get_hero_from_ref(game_state, shield_mask.hero)
    shield_mask.hero = hero
    var shield = Object.assign(new Shield(hero=shield_mask.hero), shield_mask)
    shield.caster = get_hero_from_ref(game_state, shield.caster)
    return shield
}

function create_modificator_from_mask(modificator_mask){
    return Object.assign(new Modificator(), modificator_mask)
}

function apply_hero_mask(hero, hero_mask, game_state){
    for (let [key, value] of Object.entries(hero_mask)){
        if (! ['skills', 'upgrades'].includes(key)) hero[key] = value
    }

    hero.upgrades = Object.assign(new Upgrades(), hero_mask.upgrades)

    hero.effects = []
    hero.my_effects = []

    hero.modificators = []
    for (let modificator of hero_mask.modificators){
        hero.modificators.push(create_modificator_from_mask(modificator))
    }

    hero.shields = []
    for (let shield of hero_mask.shields){
        hero.shields.push(create_shield_from_mask(game_state, shield))
    }

    hero.skills.forEach((skill, index)=>{
        apply_skill_mask(skill, hero_mask.skills[index])
    })

    hero.game_state = game_state
}

function apply_heroes_mask(game_state, mask){
    for (let hero of game_state.heroes1){
        apply_hero_mask(hero, mask.heroes.filter((hero_mask)=>hero_mask.team==1 && hero_mask.name == hero.name)[0], game_state)
    }
    for (let hero of game_state.heroes2){
        apply_hero_mask(hero, mask.heroes.filter((hero_mask)=>hero_mask.team==2 && hero_mask.name == hero.name)[0], game_state)
    }
}


function create_towers_from_mask(game_state, mask){
    game_state.towers = mask.towers.map((tower_mask)=>{
        tower_mask.game_state = game_state
        return Object.assign(new Tower(), tower_mask)
    })
}


function create_minions_from_mask(game_state, mask){
    game_state.minions = mask.minions.map((minion_mask)=>{
        minion_mask.game_state = game_state
        return Object.assign(new Minion(), minion_mask)
    })
}


function create_effect_from_mask(effect_mask, game_state){
    var caster = get_hero_from_ref(game_state, effect_mask.caster)
    var target
    if (effect_mask.hero.type == 'hero') target = get_hero_from_ref(game_state, effect_mask.hero)
    else if (effect_mask.hero.type == 'minion') target = get_minion_from_ref(game_state, effect_mask.hero)

    effect_mask.caster = caster
    effect_mask.hero = target
    effect_mask.game_state = game_state

    let Effect_type = eval(effect_mask.class_name)
    let effect = Object.assign(new Effect_type(), effect_mask)
    
    // caster.my_effects.push(effect)
    target.effects.push(effect)
    return effect    
}

function apply_effects_masks(game_state, mask){
    for (let effect_mask of mask['effects']){
        create_effect_from_mask(effect_mask, game_state)
    }
}


function apply_mask(game_state, mask){
    apply_heroes_indexes_and_sort(game_state, mask)
    apply_game_state_mask(game_state, mask)
    apply_heroes_mask(game_state, mask)

    create_towers_from_mask(game_state, mask)
    create_minions_from_mask(game_state, mask)

    apply_effects_masks(game_state, mask)
}

export {apply_mask}