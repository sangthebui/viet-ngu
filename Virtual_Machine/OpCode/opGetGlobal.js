import InterpretResult from "../InterpretResult.js";
import stack from "../Stack.js";
import runtimeError from "../runtimeError.js";

const opGetGlobal = (env) => {
    const {frame, globals} = env;
    const key = frame.read_string();
    const value = globals[key];
    if (!value){
        runtimeError(`Undefined variable ${key}`);
        return InterpretResult.INTERPRET_RUNTIME_ERROR;
    }
    stack.push(value);
    return InterpretResult.NEXT_INSTRUCTION;
}

export default opGetGlobal;