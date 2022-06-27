import stack from "../Stack.js";
import InterpretResult from "../InterpretResult.js";

const opSetLocal = (env) => {
    const {frame} = env;
    //stack effect = 0
    let key = frame.read_byte();
    const value = stack.peek(0);
    stack.set(key + frame.stackSlot, value);
    return InterpretResult.NEXT_INSTRUCTION;
}
export default opSetLocal;