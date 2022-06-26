import parser from "../Parser.js";
import TokenType from "../TokenType.js";
import expression from "../expression.js";
import OpCode from "../OpCode.js";
import CompilerType from "../CompilerType.js";

const returnStatement = (env) =>{
    const {current} = env;
    if (current.type === CompilerType.SCRIPT){
        parser.error("Can't return from top-level code.");
    }

    if(parser.match(TokenType.TOKEN_SEMICOLON)){
        current.closure.emitReturn(current.type);
    } else {

        if (current.type === CompilerType.INITIALIZER) {
            parser.error("Can't return a value from an initializer.");
        }

        expression(env);
        parser.consume(TokenType.TOKEN_SEMICOLON, 'Expect ";" after return value.');
        current.closure.emitByte(OpCode.OP_RETURN);
    }
}

export default returnStatement;