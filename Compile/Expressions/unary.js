import Precedence from "../Types/Precedence.js";
import TokenType from "../Types/TokenType.js";
import OpCode from "../Types/OpCode.js";
import parsePrecedence from "./parsePrecedence.js";

//prefix unary
const unary = (_, env) =>{
    const {current, parser} = env;
    const operatorType = parser.previous.type;
    // Compile the operand

    //parse anything that has a higher precedence than it.
    parsePrecedence(Precedence.PREC_UNARY, {current, parser});

    //Emit the operator instruction.
    switch(operatorType){
        case TokenType.TOKEN_BANG: current.closure.emitByte(OpCode.OP_NOT); break;
        case TokenType.TOKEN_MINUS: current.closure.emitByte(OpCode.OP_NEGATE); break;
        case TokenType.TOKEN_INCREMENT: {
            let name = parser.previous.payload;
            current.closure.emitConstant(1);
            current.closure.emitByte(OpCode.OP_ADD);
            //set the variable back.
            let setOp;
            let arg = current.resolveLocal(current , name); //TODO might refactor
            if ( arg !==  -1 ) {
                setOp = OpCode.OP_SET_LOCAL;
            } else if ( (arg = current.resolveUpvalue(current, name)) !== -1 ) {
                setOp = OpCode.OP_SET_UPVALUE;
            } else {
                arg = current.closure.identifierConstant(name);
                setOp = OpCode.OP_SET_GLOBAL;
            }
            current.closure.emitBytes(setOp, arg);
            break;
        }
        case TokenType.TOKEN_DECREMENT: {
            let name = parser.previous.payload;
            current.closure.emitConstant(1);
            current.closure.emitByte(OpCode.OP_SUBTRACT);
            //set the variable back.
            let setOp;
            let arg = current.resolveLocal(current , name); //TODO might refactor
            if ( arg !==  -1 ) {
                setOp = OpCode.OP_SET_LOCAL;
            } else if ( (arg = current.resolveUpvalue(current, name)) !== -1 ) {
                setOp = OpCode.OP_SET_UPVALUE;
            } else {
                arg = current.closure.identifierConstant(name);
                setOp = OpCode.OP_SET_GLOBAL;
            }
            current.closure.emitBytes(setOp, arg);
            break;
        }
        default: return; // Unreachable
    }
}

export default unary;