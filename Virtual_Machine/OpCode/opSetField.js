import stack from "../Stack.js";
import InterpretResult from "../InterpretResult.js";

const opSetField = (env) => {
    const {frame} = env;
    const fieldName = frame.read_string();
    const value  = stack.peek(0);
    const klass = stack.peek(1); //we want the same klass on the stack, not a new copy
    klass.fields[fieldName] = value;
    stack.pop(); //pop the value off the stack,
    return InterpretResult.NEXT_INSTRUCTION;
}

export default opSetField;