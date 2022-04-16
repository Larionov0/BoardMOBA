class Modificator{
    // Модификаторы базовых параметров героя, например, временное увеличение брони или атаки

    constructor(param_name, duration, value, when, type='sum', before_names=[]){
        this.param_name = param_name
        this.duration = duration
        this.value = value
        this.when = when  // before / after
        this.type = type
        this.is_alive = true
        this.before_names = before_names  // если нужно менять что-то в словаре в словаре
    }

    modify(params){
        var razdel = params
        for (let name of this.before_names){
            razdel = razdel[name]
        }

        if (this.type=='sum')
            razdel[this.param_name] += this.value
        
        if (this.type=='mult')
            razdel[this.param_name] *= this.value
    }

    decrease(){
        this.duration -= 1
        if (this.duration == 0)
            this.is_alive = false
    }
}

export {Modificator}