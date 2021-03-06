const InterpretResult  = Object.freeze({
    INTERPRET_OK: Symbol('INTERPRET_OK'),
    INTERPRET_COMPILE_ERROR: Symbol('INTERPRET_COMPILE_ERROR'),
    INTERPRET_RUNTIME_ERROR: Symbol('INTERPRET_RUNTIME_ERROR'),
    NEXT_INSTRUCTION: Symbol('NEXT_INSTRUCTION'),
});

export default InterpretResult;