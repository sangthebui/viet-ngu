import expression from "../Expressions/expression.js";
import parser from "../Objects/Parser.js";
import TokenType from "../Types/TokenType.js";
import OpCode from "../Types/OpCode.js";

//TODO change to a regular function call
const printStatement = (env) =>{
    const { current} = env;
    expression(env);
    parser.consume(TokenType.TOKEN_SEMICOLON, 'Expect ";" after value.');
    current.closure.emitByte(OpCode.OP_PRINT);
}

export default printStatement;