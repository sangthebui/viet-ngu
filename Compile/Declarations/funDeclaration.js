import parser from "../Parser.js";
import TokenType from "../TokenType.js";
import Callable from "../Callable.js";
import Compiler from "../Compiler.js";
import OpCode from "../OpCode.js";
import blockStatement from "../Statements/blockStatement.js";

import endCompiler from "../endCompiler.js";
import CompilerType from "../CompilerType.js";

export const funParameters = (env) => {
    const {current} = env;
    if (!parser.check(TokenType.TOKEN_RIGHT_PAREN)) {
        do {
            current.closure.arity++;
            if (current.closure.arity > 255) {
                parser.errorAtCurrent("Can't have more than 255 parameters.");
            }
            parser.consume(TokenType.TOKEN_IDENTIFIER, "Expect parameter name.");
            // const parameterName = parser.previous.payload;
            let identifierName = parser.previous.payload;
            let identifierConstantIndex = current.closure.identifierConstant(identifierName);

            if (current.scopeDepth > 0){
                //we are at the local
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

                //markInitialized
                current.locals[ current.localCount - 1 ].depth = current.scopeDepth;

            } else {
                //defineVariable
                current.closure.emitBytes(OpCode.OP_DEFINE_GLOBAL, identifierConstantIndex);
            }

        } while (parser.match(TokenType.TOKEN_COMMA));
        //reverse the order the parameters are stored because of the order arguments are stored in the stack as last items are at the top
    }
}

const funDeclaration = (env) => {
    let {current} = env;
    //consume the identifier
    parser.consume(TokenType.TOKEN_IDENTIFIER, 'Expect function name.');
    const identifierName = parser.previous.payload;
    let identifierConstantIndex = current.closure.identifierConstant(identifierName);
    //check if the name has been created

    //determine where the variable lives
    if (current.scopeDepth > 0){
        //we are at the local scope.
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

        //markInitialized
        current.locals[ current.localCount - 1 ].depth = current.scopeDepth;
    }
    //TODO GC Local
    // start to compile function body
    let closure = new Callable();
    closure.name = identifierName;

    //TODO GC Closure
    let compiler = new Compiler(closure);
    compiler.addLocal("", 0);
    compiler.enclosing = current;
    compiler.type = CompilerType.CLOSURE;

    env.current = compiler; // set the new compiler for this function

    env.current.beginScope(); // no end scope

    //change the current with a new Compiler block

    parser.consume(TokenType.TOKEN_LEFT_PAREN, 'Expect "(" after function name.');
    //handles parameters, add each parameter to the locals object
    funParameters(env);
    parser.consume(TokenType.TOKEN_RIGHT_PAREN, 'Expect ")" after parameters.');
    parser.consume(TokenType.TOKEN_LEFT_BRACE, 'Expect "{" before function body.');
    blockStatement(env);

    //set back the last scope
    const newClosure = endCompiler(env);

    current.closure.emitBytes(OpCode.OP_CLOSURE, newClosure);


    //capture upvalues
    for (let i = 0; i < newClosure.upvalueCount; i++) {
        current.closure.emitByte(compiler.upvalues[i].isLocal ? 1 : 0);
        current.closure.emitByte(compiler.upvalues[i].index);
    }

    //define global variable at the end
    if (current.scopeDepth === 0){
        current.closure.emitBytes(OpCode.OP_DEFINE_GLOBAL, identifierConstantIndex);
    }
};

export default funDeclaration;