## Entity

Simple entity utility for uncle Bobs Clean Architecture
- structure for entity data
- schema validation

### How to use
** detail in the test file

sample key only schema with no validation

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


