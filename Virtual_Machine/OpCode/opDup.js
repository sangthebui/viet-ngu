import stack from "../Stack.js";
import InterpretResult from "../InterpretResult.js";

const opDup = () => {
    stack.push(stack.peek(0));
    return InterpretResult.NEXT_INSTRUCTION;
}
export default opDup;