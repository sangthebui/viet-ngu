import stack from "../Stack.js";
import InterpretResult from "../InterpretResult.js";

const opTrue = (_) => {
    stack.push(true);
    return InterpretResult.NEXT_INSTRUCTION;
}

export default opTrue;