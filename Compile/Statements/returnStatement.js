import TokenType from "../Types/TokenType.js";
import expression from "../Expressions/expression.js";
import OpCode from "../Types/OpCode.js";
import CompilerType from "../Types/CompilerType.js";

const returnStatement = (env) =>{
    const {current, parser} = env;
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