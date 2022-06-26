import expression from "../expression.js";
import parser from "../Parser.js";
import TokenType from "../TokenType.js";
import OpCode from "../OpCode.js";

const expressionStatement = (env) => {
    const {current} = env;
    expression(env);
    parser.consume(TokenType.TOKEN_SEMICOLON, "Expect ';' after expression.");
    current.closure.emitByte(OpCode.OP_POP);
}

export default expressionStatement;