import stack from "../Stack.js";
import InterpretResult from "../InterpretResult.js";
import {bindMethod} from "./opGetProperty.js";

const opGetSuper = (env) => {
    const {frame} = env;
    const name = frame.read_string();
    const superClass = stack.pop();

    if (!bindMethod(superClass, name)){
        return InterpretResult.INTERPRET_RUNTIME_ERROR;
    }
    return InterpretResult.NEXT_INSTRUCTION;
}

export default opGetSuper;