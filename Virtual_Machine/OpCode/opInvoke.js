import InterpretResult from "../InterpretResult.js";
import {ValueType} from "../../Objects.js";
import runtimeError from "../runtimeError.js";
import callValue from "../callValue.js";
import call from "../call.js";
import stack from "../Stack.js";
import {newMethod} from "../../Objects.js"

const invoke = (methodName, argCount, env) =>{
    const instance = stack.peek(argCount);

    //check the fields before the method
    let field = instance.fields[methodName];
    if (field !== undefined && field !== null &&
        field.toString().indexOf('[native code]') === -1){ //JS hack to check against prototype code
        // this.stack = field
        return callValue(field, argCount, env);
    }

    if (instance.type !== ValueType.OBJECT){
        runtimeError("Only instances have methods.");
        return false;
    }

    let method = newMethod(instance.klass.methods[methodName]);
    if (method === undefined || method === null ||
        method.toString().indexOf('[native code]') !== -1){ //JS hack to check against prototype code
        runtimeError(`Undefined property ${methodName}`);
        return false;
    }
    return call(method, argCount, env);
}
const opInvoke = (env) => {
    const {frame} = env;
    const methodName = frame.read_string();
    const argCount = frame.read_byte(); //read
    if (!invoke(methodName, argCount, env)){
        return InterpretResult.INTERPRET_RUNTIME_ERROR;
    }
    env.frame = env.frames[env.frameCount -1];//go back to the previous frame.
    return InterpretResult.NEXT_INSTRUCTION;
}

export default opInvoke;