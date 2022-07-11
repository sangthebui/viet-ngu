import stack from "../Stack.js";
import InterpretResult from "../InterpretResult.js";
import call from "../call.js";
import runtimeError from "../runtimeError.js";

const invokeFromClass = (klass, methodName, argCount, env) => {
    let method = klass.methods[methodName];
    if (method === undefined || method === null){
        runtimeError(`Undefined property ${methodName}`);
        return false;
    }
    return call(method, argCount, env);
}

const opSuperInvoke = (env) => {
    let {frame, frames} = env;
    const method = frame.read_string();
    const argCount = frame.read_byte();
    const superClass = stack.pop();
    if (!invokeFromClass(superClass, method, argCount, env)){
        return InterpretResult.INTERPRET_RUNTIME_ERROR;
    }

    env.frame = frames[env.frameCount -1];//go back to the previous frame.
    return InterpretResult.NEXT_INSTRUCTION;
}

export default opSuperInvoke;