import stack from "../Stack.js";
import InterpretResult from "../InterpretResult.js";
import isFalsey from "../isFalsey.js";

const opNot = () => {
    let temp = stack.pop();
    stack.push(isFalsey(temp));
    return InterpretResult.NEXT_INSTRUCTION;
}

export default opNot;