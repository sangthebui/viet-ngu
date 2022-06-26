import expression from "../expression.js";
import parser from "../Parser.js";
import TokenType from "../TokenType.js";
import OpCode from "../OpCode.js";

//TODO change to a regular function call
const printStatement = (env) =>{
    const { current} = env;
    expression(env);
    parser.consume(TokenType.TOKEN_SEMICOLON, 'Expect ";" after value.');
    current.closure.emitByte(OpCode.OP_PRINT);
}

export default printStatement;