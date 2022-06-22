const CompileType = Object.freeze({
    BLOCK: Symbol('BLOCK'),
    CLOSURE: Symbol('CLOSURE'),
    METHOD: Symbol('METHOD'),
    FOR_STATEMENT: Symbol('FOR_STATEMENT'),
    WHILE_STATEMENT: Symbol('WHILE_STATEMENT'),
});

export default CompileType;