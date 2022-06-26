import TokenType from "../TokenType.js";
import OpCode from "../OpCode.js";
import parser from "../Parser.js";

import statement from "./statement.js";
import expression from "../expression.js";

const ifStatement = (env) => {
    const {current} = env;
    parser.consume(TokenType.TOKEN_LEFT_PAREN, "Expect '(' after 'if'.");
    expression(env);
    parser.consume(TokenType.TOKEN_RIGHT_PAREN, "Expect ')' after condition."); // [paren]

    let thenJump = current.closure.emitJump(OpCode.OP_JUMP_IF_FALSE);
    // pop-then

    current.closure.emitByte(OpCode.OP_POP);
    //pop-then
    statement(env);

    // jump-over-else
    let elseJump = current.closure.emitJump(OpCode.OP_JUMP);

    // jump-over-else
    current.closure.patchJump(thenJump);

    // pop-end
    current.closure.emitByte(OpCode.OP_POP);
    // pop-end
    // compile-else

    if (parser.match(TokenType.TOKEN_ELSE)) statement(env);
    // compile-else
    //patch-else
    current.closure.patchJump(elseJump);
}

export default ifStatement;