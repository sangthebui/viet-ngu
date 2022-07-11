
import stack from "../Stack.js";
import InterpretResult from "../InterpretResult.js";

const opConstant = (env) => {
    const {frame} = env;
    const constant = frame.read_constant();
    stack.push(constant);
    return InterpretResult.NEXT_INSTRUCTION;
}

export default opConstant;