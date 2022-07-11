import TokenType from "../Types/TokenType.js";
import expression from "../Expressions/expression.js";
import OpCode from "../Types/OpCode.js";

import statement from "./statement.js";

const whileStatement = (env) => {
    const {current, parser} = env;
    //start the while loop
    parser.insideLoop = true;

    const loopStart = current.closure.code.length;
    //check the condition
    parser.consume(TokenType.TOKEN_LEFT_PAREN, 'Expect "(" after "while".');
    expression(env);
    parser.consume(TokenType.TOKEN_RIGHT_PAREN, 'Expect ")" after condition.');

    const exitJump = current.closure.emitJump(OpCode.OP_JUMP_IF_FALSE);
    current.closure.emitByte(OpCode.OP_POP);
    //loop start for continue
    parser.loopStart = current.closure.code.length
    statement(env);

    current.closure.emitLoop(loopStart);

    current.closure.patchJump(exitJump);

    //exit the while loop with break
    if (parser.detectBreak){
        //only patch the breakJump if break exist.
        current.closure.patchJump(parser.innerMostFlowForBreak);

        parser.detectBreak = false; //reset the break statement
        parser.innerMostFlowForBreak = -1;

    } else {
        //there is nothing to pop if we encounter a break statement.
        current.closure.emitByte(OpCode.OP_POP);
    }

    parser.resetLoopVariables();
}

export default whileStatement;