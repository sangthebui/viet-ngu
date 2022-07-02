const OpCode = Object.freeze({
    OP_CONSTANT: Symbol('OP_CONSTANT'),
    OP_NIL: Symbol('OP_NIL'),
    OP_TRUE: Symbol('OP_TRUE'),
    OP_FALSE: Symbol( 'OP_FALSE'),
    OP_POP: Symbol( 'OP_POP'),
    OP_GET_LOCAL: Symbol( 'OP_GET_LOCAL'),
    OP_SET_LOCAL: Symbol( 'OP_SET_LOCAL'),
    OP_DEFINE_GLOBAL: Symbol('OP_DEFINE_GLOBAL'),
    OP_SET_GLOBAL: Symbol('OP_SET_GLOBAL'),
    OP_GET_GLOBAL: Symbol('OP_GET_GLOBAL'),
    OP_GET_UPVALUE: Symbol( 'OP_GET_UPVALUE'),
    OP_SET_UPVALUE: Symbol( 'OP_SET_UPVALUE'),
    OP_GET_PROPERTY: Symbol('OP_GET_PROPERTY'),
    OP_SET_PROPERTY: Symbol( 'OP_SET_PROPERTY'),
    OP_EQUAL: Symbol( 'OP_EQUAL'),
    OP_GET_SUPER: Symbol( 'OP_GET_SUPER'),
    OP_GREATER: Symbol( 'OP_GREATER'),
    OP_LESS: Symbol( 'OP_LESS'),
    OP_ADD: Symbol( 'OP_ADD'),
    OP_SUBTRACT: Symbol( 'OP_SUBTRACT'),
    OP_MULTIPLY: Symbol( 'OP_MULTIPLY'),
    OP_DIVIDE: Symbol( 'OP_DIVIDE'),
    OP_NOT: Symbol( 'OP_NOT'),
    OP_NEGATE: Symbol( 'OP_NEGATE'),
    OP_PRINT: Symbol( 'OP_PRINT'),
    OP_JUMP: Symbol( 'OP_JUMP'),
    OP_JUMP_IF_FALSE: Symbol('OP_JUMP_IF_FALSE'),
    OP_LOOP: Symbol( 'OP_LOOP'),
    OP_CALL: Symbol( 'OP_CALL'),
    OP_INVOKE: Symbol('OP_INVOKE'),
    OP_SUPER_INVOKE: Symbol( 'OP_SUPER_INVOKE'),
    OP_CLOSURE: Symbol( 'OP_CLOSURE'),
    OP_CLOSE_UPVALUE: Symbol('OP_CLOSE_UPVALUE'),
    OP_RETURN: Symbol( 'OP_RETURN'),
    OP_CLASS: Symbol( 'OP_CLASS'),
    OP_INHERIT: Symbol( 'OP_INHERIT'),
    OP_METHOD: Symbol( 'OP_METHOD'),
    OP_DUP: Symbol('OP_DUP'),
    //add-on
    OP_EMPTY: Symbol('OP_EMPTY'),

});

export default OpCode;