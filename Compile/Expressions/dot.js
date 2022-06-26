import TokenType from "../Types/TokenType.js";
import OpCode from "../Types/OpCode.js";
import parser from "../Objects/Parser.js";
import expression from "./expression.js";
import argumentList from "./argumentList.js";

const dot = (canAssign, env) =>{
    const {current} = env;
    parser.consume(TokenType.TOKEN_IDENTIFIER, 'Expect property name after ".".');
    const identifierName = parser.previous.payload;
    let identifierConstantIndex = current.closure.identifierConstant(identifierName);

    if (canAssign && parser.match(TokenType.TOKEN_EQUAL)){
        expression(env);
        current.closure.emitBytes(OpCode.OP_SET_PROPERTY, identifierConstantIndex);
    } else if (parser.match(TokenType.TOKEN_LEFT_PAREN)){
        //combine OP_GET_PROPERTY and OP_CALL
        let argCount = argumentList(env);
        //3 bytes
        current.closure.emitBytes(OpCode.OP_INVOKE, identifierConstantIndex);
        current.closure.emitByte(argCount);

    } else {
        current.closure.emitBytes(OpCode.OP_GET_PROPERTY, identifierConstantIndex);
    }
}

export default dot;