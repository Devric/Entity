var Entity = require("./")
var Joi = require('joi')

describe("Unit Testing", () => {
    describe("Unit Testing Entity basic with no arguments", () => {
        var entity
        beforeEach(()=>{
            entity = new Entity()
        })
        test("Able to create new entity with basic no data", () => {
            expect(entity).toEqual({
                "_data": {},
                "_schema": undefined,
                "_validator": undefined,
                "_entityName": "",
                "metadata": {}
            })
        })
        test("not allow to add properties", ()=> {
            entity.newProp = "new property"
            expect(entity.newProp).toBeUndefined()
        })
        test("not allow to manipulate _data directly", ()=> {
            entity._data.someProp = "new property"
            expect(entity._data).toEqual({})
        })
        test("Allow to trigger validate function", ()=> {
            expect(entity.validate()).toBeTruthy()
        })
    })

    describe("Unit Testing Entity basic with simple schema and validator", () => {
        // simple schema only cares about keys, not the value or value type
        var entity
        beforeEach(()=>{
            entity = new Entity({name:"",gender:""})
        })
        test("Able to create new entity with basic no data", () => {
            expect(entity).toEqual({
                "_data": {},
                "_schema": {
                    "name":"",
                    "gender": ""
                },
                "_entityName":"",
                "metadata" : {},
                "_validator": undefined
            })
        })
        test("Able to update schema properties", () => {
            entity.name = "john"
            entity.gender = "m"

            expect(entity.name).toBe("john")
            expect(entity.gender).toBe("m")

            expect(entity._data).toEqual({
                "name":"john",
                "gender": "m"
            })

            entity.name = "ben"
            expect(entity.name).toBe("ben")
        })
        test("Not allow to modify _data directly", () => {
            entity.name = "john"
            entity._data.name = "ben"
            expect(entity.name).toBe("john")
        })
        test("Allow to use set data method", ()=>{
            var newName = "my new name"
            entity.set({
                name: newName,
                gender: "t",
            })
            expect(entity.name).toBe(newName)
            expect(entity.gender).toBe("t")
        })
        test("Not allow to use set new propderty method", ()=>{
            var newName = "my new name"
            // _entityName This is use for tracing warnings / errors
            // should be set when extending this class not during instancing
            entity._entityName = "Entity"
            entity.set({
                name: newName,
                gender: "t",
                newProp: "invalid"
            })
            expect(entity.newProp).toBeUndefined()
        })
    })
    describe("Unit Testing Entity basic with JOI schema and validator", () => {
        var schema = {
            name: Joi.string().alphanum().min(3).max(10).required(),
            email: Joi.string().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } })
        }
        // note this needs to be generic function express instead of fat arrow to bind 'this'
        function validator() {
            var result = Joi.object(this._schema).validate(this._data)
            if (result.error) throw new Error(result.error)
            else return true
        }
        var entity
        beforeEach(()=>{
            entity = new Entity(schema, validator)
        })
        test("Add valid data", ()=>{
            entity.name = "john"
            expect(entity.validate()).toBeTruthy()
        })
        test("Able to report invalid entity without required data", ()=>{
            expect(() => entity.validate()).toThrow(Error)
        })
        test("Able to report invalid entity with invalid data", ()=>{
            entity.name = "x"
            expect(() => entity.validate()).toThrow(Error)
        })
    })
    describe("Unit testing for createConstant", ()=> {
        var CONSTANT = Entity.createConstant(["red","blue",15])

        test("Able to create constant", ()=>{
            expect(CONSTANT.RED).toBe("RED")
            expect(CONSTANT.BLUE).toBe("BLUE")
            expect(CONSTANT[15]).toBe("15")
        })

        test("Able to Create empty constant", ()=>{
            expect(Entity.createConstant()).toEqual({})
        })
    })
}) // end unit testing

describe("Use Case Testing", () => {
    class UserEntity extends Entity {
        constructor(extendableSchema = {}) {
            var baseSchema = {
                "type": Joi.number(),
                "name": Joi.string().min(3).max(10).required()
            }
            super({
                ...baseSchema,
                ...extendableSchema
            })
            this.metadata.types = {
                "hero": 0,
                "npc": 1,
                "enemy": 2
            }
            this._entityName = "UserEntity"
        }

        // String val: UserEntity.types.hero
        getType() {
            return this.type
        }
    }
    UserEntity.constants = {
        "hero":"hero",
        "npc":"npc",
        "enemy":"enemy"
    }
    describe("Use Case Testing Entity is extendable as EntityBase", () => {
        var hero
        beforeEach(()=>{
            hero = new UserEntity()
        })
        test("Can create a instance of extended Entity Cllass ", () => {
            expect(hero instanceof UserEntity).toBeTruthy()
        })
        test("Can use extend methods", () => {
            hero.type = hero.metadata.types[UserEntity.constants.hero]
            hero.name = "TheLegned"
            expect( hero.validate()).toBeTruthy()
            expect(hero.getType()).toBe(0)
        })
    })

    describe("Use Case Testing EntityBase Enhancement", () => {
        class EnemyEntity extends UserEntity{
            constructor() {
                super({
                    "damage": Joi.number()
                })
                this._entityName = "EnemyEntity"
            }
            attack() {
                return "attack " + this.damage
            }
        }

        var bat = new EnemyEntity()
        bat.type = bat.metadata.types[UserEntity.constants.enemy]
        bat.name = "Batrider"
        bat.damage = 20
        test("Able to call entended method", () => {
            expect(bat.attack()).toBe("attack 20")
        })
        test("able to call base class method", () => {
            expect(bat.getType()).toBe(2)
        })
    })
})

