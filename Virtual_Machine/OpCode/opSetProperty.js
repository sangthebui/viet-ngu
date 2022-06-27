import stack from "../Stack.js";
import {ValueType} from "../../Objects.js";
import InterpretResult from "../InterpretResult.js";
import runtimeError from "../runtimeError.js";

const opSetProperty = (env) => {
    const {frame} = env;
    let instance = stack.peek(1);
    if (instance.type !== ValueType.OBJECT){
        runtimeError("Only instances have properties.");
        return InterpretResult.INTERPRET_RUNTIME_ERROR;
    }
    let field = frame.read_string();
    instance.fields[field] = stack.peek(0);
    let value = stack.pop();
    stack.pop();
    stack.push(value);
    return InterpretResult.NEXT_INSTRUCTION;
}

export default opSetProperty;