import parser from "../Parser.js";
import TokenType from "../TokenType.js";
import expression from "../expression.js";
import OpCode from "../OpCode.js";

const varDeclaration = (env) => {
    const {current} = env;
    //Declaring a variable only adds it to the local scope.
    const errorMessage = 'Expect variable name.';
    parser.consume(TokenType.TOKEN_IDENTIFIER, errorMessage);
    const identifierName = parser.previous.payload;
    let identifierConstantIndex = current.closure.identifierConstant(identifierName);

    //We are in local scope
    if (current.scopeDepth > 0){
        //we are at the local scope.
        //we are not at the top level, define it locally
        //check to see if that variable exist locally first by looking backward
        for(let i = current.localCount - 1; i >= 0 ; i--) {
            let local = current.locals[i];
            if (local.depth !== -1 && local.depth < current.scopeDepth) {
                break;
            }

            if (local.name === identifierName){
                parser.error("Already a variable with this name in this scope.");
            }
        }

        //define the variable without existences
        current.addLocal(identifierName);

        //compile the initializer, either there is an expression or there is none
        //and we set it to NIL
        if(parser.match(TokenType.TOKEN_EQUAL)){
            //this will put a value on the stack, then at the end,
            // an OpCode will determine where that variable will live.
            expression(env);
        } else {
            //if there is no value, we set the variable to nil
            current.closure.emitByte(OpCode.OP_NIL);
        }

        //defineVariable: mark the locals with the scopeDepth
        current.locals[ current.localCount - 1 ].depth = current.scopeDepth;

    } else {
        //compile the initializer, either there is an expression or there is none
        //and we set it to NIL
        if(parser.match(TokenType.TOKEN_EQUAL)){
            //this will put a value on the stack, then at the end,
            // an OpCode will determine where that variable will live.
            expression(env);
        } else {
            //if there is no value, we set the variable to nil
            current.closure.emitByte(OpCode.OP_NIL);
        }
        //we are at global scope.
        current.closure.emitBytes(OpCode.OP_DEFINE_GLOBAL, identifierConstantIndex);

    }

    parser.consume(TokenType.TOKEN_SEMICOLON, 'Expect ";" after variable declaration.');
}

export default varDeclaration;