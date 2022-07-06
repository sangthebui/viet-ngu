import stack from "../Stack.js";
import InterpretResult from "../InterpretResult.js";

const opGetElement = (env) => {
    const instance = stack.peek(1);
    const index = stack.peek(0);
    stack.push(instance.elements[index]);

    return InterpretResult.NEXT_INSTRUCTION;
}

export default opGetElement;