import stack from "../Stack.js";
import {ValueType} from "../../Objects.js";
import InterpretResult from "../InterpretResult.js";
import runtimeError from "../runtimeError.js";
import CallableType from "../../Compile/Types/CallableType.js";

export const bindMethod = (klass, name) =>{
    if (!klass.methods[name]){
        runtimeError(`Undefined property in ${klass.name}`);
        return false;
    }

    const receiver = stack.peek(0);
    //TODO GC BoundMethod
    const boundMethod = {
        type: CallableType.BOUND_METHOD,
        receiver,
        method: klass.methods[name],
    };

    stack.pop(); //pop the instance off the stack and push the method
    stack.push(boundMethod);

    return true;
}

const opGetProperty = (env) => {
    const {frame} = env;
    let instance = stack.peek(0);
    if (instance.type !== ValueType.OBJECT){
        runtimeError("Only instances have properties.");
        return InterpretResult.INTERPRET_RUNTIME_ERROR;
    }
    let name = frame.read_string();

    //check if the field exists
    if (instance.fields[name] !== undefined) {
        let value = instance.fields[name];

        stack.pop();// instance
        stack.push(value);
    } else if (!bindMethod(instance.klass, name)){
        return runtimeError(`Cannot bind ${name} to ${instance.name}`);
    }
    return InterpretResult.NEXT_INSTRUCTION;
}

export default opGetProperty;