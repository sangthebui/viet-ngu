import stack from "../Stack.js";
import isFalsey from "../isFalsey.js";
import InterpretResult from "../InterpretResult.js";

const opJumpIfFalse = (env) => {
    const {frame} = env;
    const offset = frame.read_byte();
    const value = stack.peek(0);
    const isFalse = isFalsey(value);
    if(isFalse) {
        frame.ip += offset;
    }
    return InterpretResult.NEXT_INSTRUCTION;
}

export default opJumpIfFalse;