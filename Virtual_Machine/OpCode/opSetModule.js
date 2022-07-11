import stack from "../Stack.js";
import InterpretResult from "../InterpretResult.js";

const opSetModule = (env) => {
    const {frame} = env;
    const value = stack.pop();
    const key = frame.read_byte();
    env.modules[key] = value;

    return InterpretResult.NEXT_INSTRUCTION;
}

export default opSetModule;