import OpCode from "./OpCode.js";
import Precedence from "./Precedence.js";

import parsePrecedence from "./parsePrecedence.js";

const and_ = (_, {current, parser}) => {
    const endJump = current.closure.emitJump(OpCode.OP_JUMP_IF_FALSE);

    current.closure.emitByte(OpCode.OP_POP);
    parsePrecedence(Precedence.PREC_AND, {current, parser});

    current.closure.patchJump(endJump);
}

export default and_;