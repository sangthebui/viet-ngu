import parser from "../Parser.js";
import TokenType from "../TokenType.js";
import expression from "../expression.js";
import OpCode from "../OpCode.js";

import statement from "./statement.js";

const whileStatement = (env) => {
    const {current} = env;
    //start the while loop
    const loopStart = current.closure.code.length;
    //check the condition
    parser.consume(TokenType.TOKEN_LEFT_PAREN, 'Expect "(" after "while".');
    expression(env);
    parser.consume(TokenType.TOKEN_RIGHT_PAREN, 'Expect ")" after condition.');

    const exitJump = current.closure.emitJump(OpCode.OP_JUMP_IF_FALSE);
    current.closure.emitByte(OpCode.OP_POP);

    //execute the statement inside the loop
    statement(env);

    current.closure.emitLoop(loopStart);

    current.closure.patchJump(exitJump);
    current.closure.emitByte(OpCode.OP_POP);
}

export default whileStatement;