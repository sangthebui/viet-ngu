import TokenType from "../Types/TokenType.js";
import OpCode from "../Types/OpCode.js";

import namedVariable from "./namedVariable.js";
import parser from "../Objects/Parser.js";

const super_ = (_, env) =>{
    const {currentClass, current} = env
    if (currentClass === null){
        parser.error("can't user 'super' outside of a class.");
    } else if (!currentClass.hasSuperClass){
        parser.error("Can't use 'super' in a class with no superclass.");
    }
    parser.consume(TokenType.TOKEN_DOT , "Expect '.' after 'super'." );
    parser.consume(TokenType.TOKEN_IDENTIFIER , "Expect superclass method name." );
    let identifierName = parser.previous.payload;
    let identifierConstantIndex = current.closure.identifierConstant(identifierName);


    namedVariable("this", false, env);

    if (parser.match(TokenType.TOKEN_LEFT_PAREN)) {
        let argCount = this.argumentList();
        namedVariable("super", false, env);
        current.closure.emitBytes(OpCode.OP_SUPER_INVOKE, identifierConstantIndex);
        current.closure.emitByte(argCount);
    } else {
        namedVariable("super", false, env);
        current.closure.emitBytes(OpCode.OP_GET_SUPER, identifierConstantIndex);
    }
}

export default super_;