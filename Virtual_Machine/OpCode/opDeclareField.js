import stack from "../Stack.js";
import InterpretResult from "../InterpretResult.js";
import {ObjectLox, ValueType} from "../../Objects.js";

const opDeclareField = (env) => {
    const {frame} = env;
    const fieldName = frame.read_string();
    const klass = stack.peek(0); //we want the same klass on the stack, not a new copy
    klass.fields[fieldName] = new ObjectLox(null, ValueType.NIL);
    return InterpretResult.NEXT_INSTRUCTION;
}

export default opDeclareField;