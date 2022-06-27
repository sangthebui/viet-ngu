import {newKlass} from "../../Objects.js";
import stack from "../Stack.js";
import InterpretResult from "../InterpretResult.js";

const opClass = (env) => {
    const {frame} = env;
    //read byte gets from constant table, we need to create a new object
    const klass = newKlass(frame.read_byte());
    stack.push(klass);
    return InterpretResult.NEXT_INSTRUCTION;
}

export default opClass;