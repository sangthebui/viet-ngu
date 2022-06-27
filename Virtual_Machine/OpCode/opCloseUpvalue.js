import stack from "../Stack.js";
import InterpretResult from "../InterpretResult.js";

export const closeUpvalues = (last, env) => {

    while (env.openUpvalues !== null && env.openUpvalues.location >= last) {
        let upvalue = env.openUpvalues;
        //capture the item on the stack
        let localFromStack = stack.get(upvalue.location);
        upvalue.location = localFromStack;
        upvalue.isCaptured = true;
        env.openUpvalues = upvalue.next;
    }
}

const opCloseUpvalue = (env) => {
    //TODO need to test out the block and break;
    //I know that it is all of the variables on top of the stack except the first function
    const locationOfLocals = stack.length() - 1;
    closeUpvalues(locationOfLocals, env);
    stack.pop();
    return InterpretResult.NEXT_INSTRUCTION;
}

export default opCloseUpvalue;