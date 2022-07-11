import stack from "../Stack.js";
import InterpretResult from "../InterpretResult.js";

const opPop = (_) => {
    stack.pop();
    return InterpretResult.NEXT_INSTRUCTION;
}

export default opPop;