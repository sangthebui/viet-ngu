import expression from "../Expressions/expression.js";
import parser from "../Objects/Parser.js";
import TokenType from "../Types/TokenType.js";
import OpCode from "../Types/OpCode.js";

const expressionStatement = (env) => {
    const {current} = env;
    expression(env);
    parser.consume(TokenType.TOKEN_SEMICOLON, "Expect ';' after expression.");
    current.closure.emitByte(OpCode.OP_POP);
}

export default expressionStatement;