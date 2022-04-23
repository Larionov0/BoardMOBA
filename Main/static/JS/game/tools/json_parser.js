class ObjectRebuilder
{
    // We need this so we can instantiate objects from class name strings
    // static classList() {
    //     return {
    //         Page: Page,
    //         PageSection: PageSection
    //     }
    // }

    // Checks if passed variable is object.
    // Returns true for arrays as well, as intended
    static isObject(varOrObj) {
        return varOrObj !== null && typeof varOrObj === 'object';
    }

    static restoreObject(obj) {
        let newObj = obj;

        // if (obj.hasOwnProperty("__className")) {
        //     // let list = ObjectRebuilder.classList();

        //     // // Instantiate object of the correct class
        //     // newObj = new (list[obj["__className"]]);

        //     // Copy all of current object's properties
        //     // to the newly instantiated object
        //     let class_ = eval(obj.__className)
        //     newObj = Object.assign(new class_, obj);

        //     // Run the makeshift constructor, if the
        //     // new object has one
        //     if (newObj.__initialize === 'function') {
        //         newObj.__initialize();
        //     }
        // }
        
        for (let prop of Object.keys(newObj)) {
            if (ObjectRebuilder.isObject(newObj[prop])) {
                newObj[prop] = ObjectRebuilder.restoreObject(newObj[prop]);
            }
        }

        return newObj;
    }
}

let replacer = (key, value)=>{
    if (typeof value ==="function"){
        return "/Function(" + value.toString() + ")/";
    }
    if (typeof value ==="object"){
        if (value !== null && value.constructor !== null)
            if (value.constructor.name != 'Object')
                value.__className = value.constructor.name
    }
    return value
}

let reviver = function(key, value) {
  if (typeof value === "string" &&
      value.startsWith("/Function(") &&
      value.endsWith(")/")) {
    value = value.substring(10, value.length - 2);
    return (0, eval)("(" + value + ")");
  }
  return value;
}

function sstringify(obj){
    return JSON.stringify(obj, replacer)
}

function sparse(json){
    return ObjectRebuilder.restoreObject(JSON.parse(json, reviver))
}


export {sstringify, sparse}
