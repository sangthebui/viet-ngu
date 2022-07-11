import stack from "../Stack.js";
import InterpretResult from "../InterpretResult.js";
import {closeUpvalues} from "./opCloseUpvalue.js";

const opReturn = (env) => {
    const {frame, frames} = env;
    const value = stack.pop();
    //capture any necessary upvalues before the locals are discarded off the stack
    //I know that it is all of the variables on top of the stack except the first function
    const locationOfLocals = 1;
    closeUpvalues(locationOfLocals, env);
    env.frameCount--;
    frames.pop();
    //checking to see if we are at the end of the "script function"
    if (env.frameCount === 0){
        stack.pop();//pop the script (global) function
        return InterpretResult.INTERPRET_OK;
        //this works.
    }

    //remove the previous frame locals here
    //argCount + locals;
    const lastFunctionStack = stack.length() - frame.stackSlot;
    stack.popN(lastFunctionStack);
    stack.push(value);

    env.frame = frames[env.frameCount -1];//go back to the previous frame.
    return InterpretResult.NEXT_INSTRUCTION;
}

export default opReturn;