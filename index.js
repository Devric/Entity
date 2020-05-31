// Entity
// create basic entity method and class
// - contains immutable data list
// - contains stores entity schema
// - contains entity schema validation method
class Entity {
    constructor(schema, validator) {
        // stores immutable data,
        this._data = {}
        // stores entity schema
        this._schema = schema
        // stores validation function
        this._validator = validator
        // stores metadata,
        this.metadata = {}

        this._entityName = ""

        // add name for trace
        Object.defineProperty(this, "_entityName", {value: name});

        for (const key in schema) {
            Object.defineProperty(this, key, {
                get: () => {
                    return this._data[key]
                },
                set: (val) => {
                    var newData = Object.assign({}, this._data)
                    newData[key] = val

                    // replace this._data
                    this._data = newData
                    Object.freeze(this._data)
                }
            })
        }

        // do now allow to add new object here
        // only let you to update existing value
        Object.seal(this)
        Object.freeze(this._data)
        Object.freeze(this._schema)
        Object.freeze(this._validator)
    }

    // set entire object
    // this merge/ovrride with existing object if key is given
    set(data) {
        for (var i in data) {
            try {
                this[i] = data[i]
            } catch(e) {
                console.warn(`${i} is not a property of ${this._entityName}`)
            }
        }
        return this._data
    }

    // validate entire entity with _data
    validate() {
        if (this._validator) {
            // note, _validator should not be => fat arrow functions, it needs to be generic function expression to take effect of call/bind/apply
            return this._validator.call(this)
        } else {
            return true
        }
    }
}

Entity.createConstant = (list) => {
    var constants = {}
    if (list && list.length > 0) {
        for (var i =0; i < list.length; i++) {
            var item = list[i].toString().toUpperCase()
            constants[item] = item
        }
    }
    return constants
}

module.exports =  Entity
