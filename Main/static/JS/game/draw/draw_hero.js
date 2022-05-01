function draw_skill(skill, hero) {
    let dop_class = ''
    if (skill.chosen) dop_class = 'skill_chosen'
    if (skill.cur_cooldown>0 || skill.energy > hero.energy) dop_class = 'unaccessible_skill'
    // debugger
    return `
    <div class="skill ${dop_class}">
        <div class="skill_name">${skill.name}</div>
        <div class="skill_image_div"><img src='/static/IMG/heroes/${hero.eng_name}/${skill.img_src}'></div>
        <div class="skill_description">${skill.description}</div>
        <div class="skill_params">
            <div class='skill_param param_left' title='осталось до перезарядки'>${skill.cur_cooldown}</div>
            <div class='skill_param' title='перезарядка'>${skill.cooldown}</div>
            <div class='skill_param param_right' title='энергия'>${skill.energy}</div>
        </div>
    </div>
    `
    // <div class="skill_params">${skill.cur_cooldown}/${skill.cooldown}  -  ${skill.energy}</div>
}


function draw_effect(effect){
    return `<img src='/static/IMG/effects/${effect.img_src}' alt=${effect.name} class='effect_token' title='${effect.gen_description()}'>`
}

function draw_effects(effects){
    return effects.map(draw_effect).join(' ')
}


function insert_img(filename){
    return `<img class='par_icon' src='/static/IMG/icons/${filename}.png'>`
}

function draw_shield(shield){
    return `<img src='/static/IMG/icons/armor.png' class='effect_token' title='${shield.gen_description()}'>`
}

function draw_shields(shields){
    return shields.map(draw_shield).join(' ')
}


function draw_hero(hero, game_state){
    var skills_html = hero.skills.map((skill)=>draw_skill(skill, hero))
    var dop_class = ''
    if (game_state.get_active_hero() == hero) dop_class = 'chosen'

    var gen_par_cells_values = (params)=>{  // [{par: 'max_hp', value: `${hero.hp}/${hero.max_hp}`}]
        return params.map((param)=>`<div class='par_cell' title='' >${param.value}</div>`).join('\n')
    }
    return `
    <div class="hero_card ${dop_class}">
        <div class="hero_first_row">
            <div class="first_row_part effects_zone">${ draw_effects(hero.alive_effects) }</div>
            <div class="first_row_part hero_name">${hero.name}</div>
            <div class="first_row_part effects_zone">${ draw_shields(hero.alive_shields) }</div>
        </div>
        <div class="hero_second_row">
            <div class="hero_image_div">
                <img class="hero_image" src="/static/IMG/heroes/${hero.img_src}" alt="">
            </div>
            <div class="hero_params">
                <div class='params_table'>
                    <div class='table_row'>
                        <div class='par_cell' title='HP'>${insert_img('heart')}</div>
                        <div class='par_cell' title='energy'>${insert_img('energy')}</div>
                        <div class='par_cell' title='armor'>${insert_img('armor')}</div>
                        <div class='par_cell' title='gold'>${insert_img('energy')}</div>
                    </div>
                    <div class='table_row'>
                        ${gen_par_cells_values([
                            {par: 'max_hp', value: `${hero.hp}/${hero.max_hp}`},
                            {par: 'max_energy', value: `${hero.energy}/${hero.max_energy}`},
                            {par: 'armor', value: `${hero.armor}`},
                            {par: 'gold', value: `${hero.gold}`},
                        ])}
                    </div>
                    <div class='table_row'>
                        <div class='par_cell' title='power'>${insert_img('power')}</div>
                        <div class='par_cell' title='magic'>${insert_img('magic')}</div>
                        <div class='par_cell' title='attack range'>${insert_img('attack_range')}</div>
                        <div class='par_cell' title=''></div>
                    </div>
                    <div class='table_row'>
                        ${gen_par_cells_values([
                            {par: 'power', value: `${hero.power}`},
                            {par: 'magic', value: `${hero.magic}`},
                            {par: 'attack_range', value: `${hero.attack_range}`},
                            {par: '', value: ''},
                        ])}
                    </div>
                </div>
            </div>    
        </div>
        <div class="skills_zone">
            ${skills_html.join(' ')}
        </div>
    </div>
    `
}

export {draw_hero}
