import stack from "../Stack.js";
import InterpretResult from "../InterpretResult.js";

const opNot = () => {
    let temp = stack.pop();
    stack.push(this.isFalsey(temp));
    return InterpretResult.NEXT_INSTRUCTION;
}

export default opNot;