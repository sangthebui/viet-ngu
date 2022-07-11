import {ObjectLox} from "../../Objects.js";
import stack from "../Stack.js";
import InterpretResult from "../InterpretResult.js";

const opGreater = (_) => {
    if (ObjectLox.isNumber(stack.peek(0)) &&
        ObjectLox.isNumber(stack.peek(1))){
        const a = stack.pop();
        const b = stack.pop();
        stack.push(b > a);
    } else {
        this.runtimeError("Operands must be numbers.");
        return InterpretResult.INTERPRET_RUNTIME_ERROR;
    }
    return InterpretResult.NEXT_INSTRUCTION;
}

export default opGreater;