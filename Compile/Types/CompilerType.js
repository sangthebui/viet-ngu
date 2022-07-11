
const CompilerType = Object.freeze({
    CLOSURE: Symbol('CLOSURE'),
    METHOD: Symbol('METHOD'),
    INITIALIZER: Symbol('INITIALIZER'),
    SCRIPT: Symbol('SCRIPT'),
});

export default CompilerType;