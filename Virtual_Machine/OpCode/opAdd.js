import {ObjectLox, ValueType} from "../../Objects.js";
import stack from "../Stack.js";
import InterpretResult from "../InterpretResult.js";
import runtimeError from "../runtimeError.js";

const opAdd = (_) => {
    if (ObjectLox.isString(stack.peek(0)) &&
        ObjectLox.isString(stack.peek(1)) ){
        const a = stack.pop();
        const b = stack.pop();
        //TODO GC Value
        stack.push(new ObjectLox(b.value + a.value, ValueType.STRING));
    } else if (ObjectLox.isNumber(stack.peek(0)) &&
        ObjectLox.isNumber(stack.peek(1))){
        const a = stack.pop();
        const b = stack.pop();
        stack.push(b + a);
    } else {
        runtimeError("Operands must be two numbers or two strings.");
        return InterpretResult.INTERPRET_RUNTIME_ERROR;
    }
    return InterpretResult.NEXT_INSTRUCTION;
}

export default opAdd;