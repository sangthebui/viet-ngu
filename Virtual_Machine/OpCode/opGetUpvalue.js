import stack from "../Stack.js";
import InterpretResult from "../InterpretResult.js";

const opGetUpvalue = (env) => {
    const {frame} = env;
    const slot = frame.read_byte();
    const upValue = frame.closure.frameUpvalues[slot];

    if (upValue.isCaptured){
        stack.push(upValue.location);
    } else {
        stack.push(stack.get(upValue.location));
    }
    return InterpretResult.NEXT_INSTRUCTION;
}

export default opGetUpvalue;