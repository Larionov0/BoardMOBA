class Upgrades {
    constructor ({max_hp, max_energy, power, armor, magic, attack_range, attack_cost}={}){
        this.params = {
            max_hp: max_hp,  // [{value: 40, cost:0}, {value: 50, cost: 10}] -> {level: 0, values: [{}, {}]}
            max_energy: max_energy,
            power: power,
            armor: armor,
            magic: magic,
            attack_range: attack_range,
            attack_cost: attack_cost
        }

        this.params_levels = {}
    }

    gen_string(param_name){
        var text = `${this.get_param(param_name)} `
        for (let i = this.params_levels[param_name] + 1; i < this.params[param_name].length; i++){
            let param = this.params[param_name][i]
            text += `--${param.cost}-> ${param.value} `
        }
        return text
    }

    set_default_levels(){
        for (const [key, value] of Object.entries(this.params)){
            this.params_levels[key] = 0
        }
    }

    get_param(param){
        return this.params[param][this.params_levels[param]]['value']
    }

    upgrade(param){
        this.params_levels[param] += 1
        return this.get_param(param)
    }

    can_upgrade(param){
        return this.params_levels[param] != this.params[param].length - 1
    }
}

export {Upgrades}