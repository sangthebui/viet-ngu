import stack from "../Stack.js";
import InterpretResult from "../InterpretResult.js";

const opSetUpvalue = (env) => {
    const {frame} = env;
    const slot = frame.read_byte();
    const value = stack.peek(0);
    frame.closure.frameUpvalues[slot].location = value;
    return InterpretResult.NEXT_INSTRUCTION;
}

export default opSetUpvalue;