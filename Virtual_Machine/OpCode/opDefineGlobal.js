import stack from "../Stack.js";
import InterpretResult from "../InterpretResult.js";

const opDefineGlobal = (env) => {
    const {frame, globals} = env;
    const key = frame.read_string();
    let value = stack.pop();
    //check if it is a callable and create a new one
    globals[key] = value;
    return InterpretResult.NEXT_INSTRUCTION;
}

export default opDefineGlobal;