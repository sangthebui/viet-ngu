import OpCode from "../Types/OpCode.js";
import Precedence from "../Types/Precedence.js";

import parsePrecedence from "./parsePrecedence.js";

const and_ = (_, env) => {
    const {current} = env;
    const endJump = current.closure.emitJump(OpCode.OP_JUMP_IF_FALSE);

    current.closure.emitByte(OpCode.OP_POP);
    parsePrecedence(Precedence.PREC_AND, env);

    current.closure.patchJump(endJump);
}

export default and_;