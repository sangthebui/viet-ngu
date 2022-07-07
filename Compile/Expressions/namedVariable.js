import OpCode from "../Types/OpCode.js";
import TokenType from "../Types/TokenType.js";
import parser from "../Objects/Parser.js";

import expression from "./expression.js";

const  namedVariable = (name, canAssign, env) =>{
    const {current} = env;
    let getOp , setOp ;
    let arg = current.resolveLocal(current , name); //TODO might refactor
    if ( arg !==  -1 ) {
        getOp = OpCode.OP_GET_LOCAL;
        setOp = OpCode.OP_SET_LOCAL;
    } else if ( (arg = current.resolveUpvalue(current, name)) !== -1 ) {
        getOp = OpCode.OP_GET_UPVALUE;
        setOp = OpCode.OP_SET_UPVALUE;
    } else {
        arg = current.closure.identifierConstant(name);
        getOp = OpCode.OP_GET_GLOBAL;
        setOp = OpCode.OP_SET_GLOBAL;
    }

    if (canAssign && parser.match(TokenType.TOKEN_EQUAL)){
        expression(env);
        current.closure.emitBytes(setOp, arg);
    }
    //handle post increment and decrement
    else if (parser.match(TokenType.TOKEN_INCREMENT)) {
        current.closure.emitBytes(getOp, arg);
        current.closure.emitConstant(1);
        current.closure.emitByte(OpCode.OP_ADD);
        current.closure.emitBytes(setOp, arg);
    }
    else if (parser.match(TokenType.TOKEN_DECREMENT)) {
        current.closure.emitBytes(getOp, arg);
        current.closure.emitConstant(1);
        current.closure.emitByte(OpCode.OP_SUBTRACT);
        current.closure.emitBytes(setOp, arg);
    }
    else
    {
        current.closure.emitBytes(getOp, arg);
    }
}

export default namedVariable;