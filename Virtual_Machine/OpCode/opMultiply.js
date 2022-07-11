import {ObjectLox} from "../../Objects.js";
import stack from "../Stack.js";
import InterpretResult from "../InterpretResult.js";
import runtimeError from "../runtimeError.js";

const opMultiply = (_) => {
    if (ObjectLox.isNumber(stack.peek(0)) &&
        ObjectLox.isNumber(stack.peek(1))){
        const a = stack.pop();
        const b = stack.pop();
        stack.push(a * b);
    } else {
        runtimeError("Operands must be numbers.");
        return InterpretResult.INTERPRET_RUNTIME_ERROR;
    }
    return InterpretResult.NEXT_INSTRUCTION;
}

export default opMultiply;