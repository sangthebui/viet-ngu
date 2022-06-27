import stack from "./Stack.js";
import Frame, { FRAMES_MAX} from "./Frame.js";

import runtimeError from "./runtimeError.js";

const call = (closure, argCount, env) => {
    const {frames} = env;
    if (argCount !== closure.arity){
        runtimeError(`Expected ${closure.arity} arguments but got ${argCount}.`);
        return false;
    }

    //probably need to handle the max frame size ourselves
    if (frames.length === FRAMES_MAX){
        runtimeError('Stack Overflow.');
        return false;
    }

    //convert the call frames stack to a push and pop action
    let stackSlot = stack.length() - 1 - argCount;
    let frame = new Frame(closure, 0, stackSlot);
    frames.push(frame);
    env.frameCount++;

    return true;
}

export default call;