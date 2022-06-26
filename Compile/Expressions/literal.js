import TokenType from "../Types/TokenType.js";
import OpCode from "../Types/OpCode.js";
import parser from "../Objects/Parser.js";

const literal = (_, env) => {
    const { current } = env;
    switch(parser.previous.type){
        case TokenType.TOKEN_FALSE: current.closure.emitByte(OpCode.OP_FALSE); break;
        case TokenType.TOKEN_NIL: current.closure.emitByte(OpCode.OP_NIL); break;
        case TokenType.TOKEN_TRUE: current.closure.emitByte(OpCode.OP_TRUE); break;
        default: return; //Unreachable
    }
}

export default literal;