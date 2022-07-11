import stack from "../Stack.js";
import InterpretResult from "../InterpretResult.js";

const opSetElement = (env) => {
    const instance = stack.peek(2);
    const index = stack.peek(1);
    const value = stack.peek(0);
    instance.elements[index] = value;

    return InterpretResult.NEXT_INSTRUCTION;
}

export default opSetElement;