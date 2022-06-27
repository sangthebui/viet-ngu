import InterpretResult from "../InterpretResult.js";
import stack from "../Stack.js";
import runtimeError from "../runtimeError.js";

const opSetGlobal = (env) => {
    const {frame, globals} = env;
    const key = frame.read_string();
    //value should already exist in global
    if (globals[key] === undefined){
        runtimeError(`Undefined variable '${key}'`);
        return InterpretResult.INTERPRET_RUNTIME_ERROR;
    }
    const value = stack.peek(0);
    globals[key] = value;
    return InterpretResult.NEXT_INSTRUCTION;
}

export default opSetGlobal;