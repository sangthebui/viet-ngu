import Precedence from "../Types/Precedence.js";
import TokenType from "../Types/TokenType.js";
import OpCode from "../Types/OpCode.js";
import parser from "../Objects/Parser.js";
import parsePrecedence from "./parsePrecedence.js";


const unary = (_, env) =>{
    const {current} = env;
    const operatorType = parser.previous.type;
    // Compile the operand

    //parse anything that has a higher precedence than it.
    parsePrecedence(Precedence.PREC_UNARY, {current, parser});

    //Emit the operator instruction.
    switch(operatorType){
        case TokenType.TOKEN_BANG: current.closure.emitByte(OpCode.OP_NOT); break;
        case TokenType.TOKEN_MINUS: current.closure.emitByte(OpCode.OP_NEGATE); break;
        default: return; // Unreachable
    }
}

export default unary;