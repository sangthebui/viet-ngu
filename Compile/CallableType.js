
const CallableType = Object.freeze({
    CLOSURE: Symbol('CLOSURE'),
    METHOD: Symbol('METHOD'),
    INITIALIZER: Symbol('INITIALIZER'),
    CLASS: Symbol('CLASS'),
    NATIVE_FUNCTION: Symbol('NATIVE_FUNCTION'),
});

export default CallableType;