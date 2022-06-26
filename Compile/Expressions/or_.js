import OpCode from "../Types/OpCode.js";
import Precedence from "../Types/Precedence.js";
import parsePrecedence from "./parsePrecedence.js";

const or_ = (_, env) => {
    const { current} = env;
    const elseJump = current.closure.emitJump(OpCode.OP_JUMP_IF_FALSE);
    const endJump = current.closure.emitJump(OpCode.OP_JUMP);

    current.closure.patchJump(elseJump);
    current.closure.emitByte(OpCode.OP_POP);

    parsePrecedence(Precedence.PREC_OR, env);
    current.closure.patchJump(endJump);
}

export default or_;