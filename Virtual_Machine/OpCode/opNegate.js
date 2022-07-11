import stack from "../Stack.js";
import {ObjectLox} from "../../Objects.js";
import InterpretResult from "../InterpretResult.js";
import runtimeError from "../runtimeError.js";

const opNegate = () => {
    let value = stack.peek(0);
    if (!ObjectLox.isNumber(value)){
        runtimeError("Operand must be a number.");
        return InterpretResult.INTERPRET_RUNTIME_ERROR;
    }
    value = stack.pop();
    stack.push(-value);
    return InterpretResult.NEXT_INSTRUCTION;
}

export default opNegate;