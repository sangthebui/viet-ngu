import expression from "../Expressions/expression.js";
import parser from "../Objects/Parser.js";
import TokenType from "../Types/TokenType.js";
import OpCode from "../Types/OpCode.js";

const printStatement = (env) =>{
    const { current} = env;
    parser.consume(TokenType.TOKEN_LEFT_PAREN, 'Expect "(" left paren before print.');
    expression(env);
    parser.consume(TokenType.TOKEN_RIGHT_PAREN, 'Expect ")" right paren after print parameter.');
    parser.consume(TokenType.TOKEN_SEMICOLON, 'Expect ";" after value.');
    current.closure.emitByte(OpCode.OP_PRINT);
}

export default printStatement;