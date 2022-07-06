import CallableType from "../Compile/Types/CallableType.js";
import stack from "./Stack.js";
import {newInstance, newMethod} from "../Objects.js";

import call from "./call.js";
import runtimeError from "./runtimeError.js";
const callValue = (callee, argCount, env) =>{

    switch(callee.type){
        case CallableType.BOUND_METHOD: {
            //binding this to each method by putting the receiver on the stack
            let location = stack.length() - argCount - 1;
            stack.set(location, callee.receiver);

            return call(callee.method, argCount, env);
        }
        case CallableType.CLASS: {
            const instance =  newInstance(callee);
            //push onto the stack before all the arguments
            const position = stack.length ()- 1 - argCount;
            stack.set(position, instance);//put the object where the class before the arguments

            let initializer = newMethod(callee.methods['init']);

            if (initializer !== undefined && initializer !== null){
                //binding this to each method
                return call(initializer, argCount, env);

            } else if (argCount !== 0){
                runtimeError(`Expected 0 arguments but got ${argCount}`);
                return false;
            }

            return true;
        }
        case CallableType.CLOSURE: {
            //we are calling function
            return call(callee, argCount, env);
        }
        case CallableType.NATIVE_FUNCTION: {
            const slice = stack.length() - argCount;
            const values = stack.slice(slice, stack.length());
            const result = callee.closure(argCount, values);
            stack.slice(0, argCount + 1); // remove the argCount and the function
            stack.push(result);
            return true;
        }
        default: break;
    }
    runtimeError('Can only call functions and classes');
    return false;
}
export default callValue;