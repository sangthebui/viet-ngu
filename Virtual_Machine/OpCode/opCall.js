import stack from "../Stack.js";
import InterpretResult from "../InterpretResult.js";

import callValue from "../callValue.js";

const opCall = (env) => {
    const {frame, frames} = env;
    const argCount = frame.read_byte();
    const callee = stack.peek(argCount);
    // const callee = value.value;
    if (!callValue(callee, argCount, env)){
        return InterpretResult.INTERPRET_RUNTIME_ERROR;
    }

    env.frame = frames[env.frameCount - 1];
    return InterpretResult.NEXT_INSTRUCTION;
}

export default opCall;