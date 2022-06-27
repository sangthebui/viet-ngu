import stack from "../Stack.js";
import InterpretResult from "../InterpretResult.js";

const opNil = (_) => {
    stack.push(null);
    return InterpretResult.NEXT_INSTRUCTION;
}

export default opNil;