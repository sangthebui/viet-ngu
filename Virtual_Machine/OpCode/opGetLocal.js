import stack from "../Stack.js";
import InterpretResult from "../InterpretResult.js";

const opGetLocal = (env) => {
    const {frame} = env;
    //stack effect = - 1
    const key = frame.read_byte();
    const value = stack.get(key + frame.stackSlot);
    stack.push(value);
    return InterpretResult.NEXT_INSTRUCTION;
}

export default opGetLocal;