import {newMethod} from "../../Objects.js";
import stack from "../Stack.js";
import InterpretResult from "../InterpretResult.js";

const opMethod = (env) => {
    const {frame} = env;
    const methodName = frame.read_string();
    //TODO maybe create a Method class
    const method = newMethod(stack.peek(0)); //we want a cop of the new method.
    const klass = stack.peek(1); //we want the same klass on the stack, not a new copy
    klass.methods[methodName] = method;
    stack.pop();
    return InterpretResult.NEXT_INSTRUCTION;
}

export default opMethod;