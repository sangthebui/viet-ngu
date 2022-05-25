export const ValueType = Object.freeze({
    PRIMITIVE: Symbol('PRIMITIVE'),
    BLOCK: Symbol('BLOCK'),
    CLOSURE: Symbol('CLOSURE'),
    CLASS: Symbol('CLASS'),
    OBJECT: Symbol('OBJECT'),
    METHOD: Symbol('METHOD'),
    BOUND_METHOD: Symbol('BOUND_METHOD'),
    INITIALIZER: Symbol('INITIALIZER'),
});


export const makeClosure = (type, identifierName='<script>', enclosing=null) => {
    let closureObj = {
        arity: 0,
        code: [],
        lines: [],
        ip: 0,
        enclosing: enclosing,
        type: type,
        name: identifierName,
        slots: {},
    }
};

export default class Value {
    constructor(value, type=ValueType.PRIMITIVE){
        this.value = value;
        this.type = type;
    }

    get(){
        return this.value;
    }

    set(value){
        this.value = value;
    }
}