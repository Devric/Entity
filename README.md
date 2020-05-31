## Entity

Basic entity utility for uncle Bobs Clean Architecture
Providing simple Entity manipulations with the benefit of
- consistency in entity structure for entity data
- choose your own schema methods
- create your own validator

### How to use
* detail in the test file *

##### Basic Usage
An example how it is used, follow Extended Usage for practical use

```javascript

// create schema, basic or your library of choice i.e Joi
var schema = {name: ""}
var joiSchema = {name: Joi.string()}

// create your validator method or follow Extended usage for Joi validator
var validator = () => {
    if (this._data.name !== '') throw new Error("Name is required")
    return true
}

var simpleEntity = new Entity(
    schema,
    validator
)

// populate the entity
simpleEntity.name = "Some Name"
simpleEntity.validate()

// use data from entity
someDatabase.create(simpleEntity._data)
    .then((result)=>{
        myAccount.set(result.data)
    })

```

#### Extended Usage
creating your own entity type, and helper methods for the entity

```javascript
// Create your entity
class AccountEntity extends Entity {
    constructor(data) {
        // sample validator
        function validator() {
            if (this._data.firstName !== 'john') throw new Error()
            return true
        }

        // sample joi validator
        function JoiValidate() {
            var result = Joi.object(this._schema).validate(this._data)
            if (result.error) throw new Error(result.error)
            else return true
        }

        var schema = { firstName: "", lastName: "" }
        // or using Joi to validate value
        // { name: Joi.string().min(3).max(5) }
        super(schema, validator)

        // provide the name of 
        this._entityName = "AccountEntity"

        if (data) { this.set(data) }
    }

    getFullname () {
        return this.firstName + this.lastName
    }
}
AccountEntity.constants = Entity.createConstant(["RED","BLUE","GREEN"])


// create entity
var myAccount = new AccountEntity()
// access property on the entity level, however getter/setter are in _data
myAccount.firstName = "john"
myAccount.lastName = AccountEntity.constants.BLUE
myAccount.validate()

// use data
someDatabase.create(myAccount._data)
    .then((result)=>{
        myAccount.set(result.data)
    })
```

### structure
- _name         entity name, for trace, error, warning, you can use it for your validator
- _data         place to keep private data, can not modify directly, only through entity
- _schema       how the data structure look like, this creates 'freeze' property of entity and _data
- _validator    stores the function of the validator, default to return true or throw error
- _metadata     stores any extra data, this is not validated


### API
Static
- createConstant @param [string] create key value pair of each string in array

Instance
- validate()    validate with the validator against _data and _schema, you'll need to create the validator method
- set(data)     set/update new data, will ignore and throw warning for any property that dont belong to the schema

### TODO
- Allow overide default property getters
- Allow overide default property setters, this gives ability to set default values such as date/time, id, or any generated fields

