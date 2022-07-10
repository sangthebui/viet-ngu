import OpCode from "../Types/OpCode.js";

import argumentList from "./argumentList.js";

const call = (_, env) => {
    const {current, parser} = env;
    //all the values to the argument are on the stack
    let argCount = argumentList(env);
    current.closure.emitBytes(OpCode.OP_CALL, argCount);
}

export default call;