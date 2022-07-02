import parser from "../Objects/Parser.js";
import TokenType from "../Types/TokenType.js";
import OpCode from "../Types/OpCode.js";

const breakStatement = (env) => {
    //check if we are in a loop or a switch/case clause
    if (!(parser.insideLoop || parser.insideSwitchCase)) {
        parser.error("Must be inside a loop or switch/case statement to use 'break'.");
    }
    //Need to jump toward the end of the exitJump
    parser.innerMostFlowForBreak = env.current.closure.emitJump(OpCode.OP_JUMP);
    parser.detectBreak = true;
    parser.consume(TokenType.TOKEN_SEMICOLON, "Expect ';' after 'break'.");
}

export default breakStatement;