import InterpretResult from "../InterpretResult.js";

const opJump = (env) => {
    const {frame} = env;
    const offset = frame.read_byte();
    frame.ip += offset;
    return InterpretResult.NEXT_INSTRUCTION;
}

export default opJump;