import stack from "../Stack.js";
import InterpretResult from "../InterpretResult.js";

const opFalse = (_) => {
    stack.push(false);
    return InterpretResult.NEXT_INSTRUCTION;
}

export default opFalse;