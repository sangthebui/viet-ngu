import parser from "../Objects/Parser.js";
import TokenType from "../Types/TokenType.js";
import CallableType from "../Types/CallableType.js";
import OpCode from "../Types/OpCode.js";

import namedVariable from "../Expressions/namedVariable.js";
import identifier from "../Expressions/identifier.js";
import Callable from "../Objects/Callable.js";
import Compiler from "../Objects/Compiler.js";
import blockStatement from "../Statements/blockStatement.js";
import { funParameters} from "./funDeclaration.js";
import endCompiler from "../Objects/endCompiler.js";
import CompilerType from "../Types/CompilerType.js";

const method = (env) =>{
    let {current} = env;
    parser.consume(TokenType.TOKEN_IDENTIFIER, 'Expect method name.');
    const identifierName = parser.previous.payload;
    const identifierConstantIndex = current.closure.identifierConstant(identifierName);

    //TODO GC Closure
    // compile the function body as a method
    let closure = new Callable();
    closure.name = identifierName;
    closure.type = CallableType.METHOD;
    let compiler = new Compiler(closure);
    compiler.addLocal('this', 0);
    compiler.enclosing = current;
    compiler.type = CompilerType.METHOD;

    //check if the method is an init
    if (identifierName === 'init'){
        compiler.type = CompilerType.INITIALIZER;
    }

    env.current = compiler; // set the new compiler for this function

    env.current.beginScope();
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

    //the binding of methods happens at runtime
    current.closure.emitBytes(OpCode.OP_METHOD, identifierConstantIndex);
}

const classDeclaration = (env) => {
    let {current, currentClass} = env;
    parser.consume (TokenType.TOKEN_IDENTIFIER , "Expect class name." );
    const classIdentifier = parser.previous.payload;
    let classConstantIndex = current.closure.identifierConstant(classIdentifier);

    //TODO GC Klass object
    let klass = {
        name: classIdentifier,
        type: CallableType.CLASS,
        methods: {},
        super: null,
    };

    current.closure.emitBytes(OpCode.OP_CLASS , klass);

    //determine where the variable lives
    if (current.scopeDepth > 0) {
        //we are at the local
        //check to see if that variable exist locally first by looking backward
        for (let i = current.localCount - 1; i >= 0; i--) {
            let local = current.locals[i];
            if (local.depth !== -1 && local.depth < current.scopeDepth) {
                break;
            }

            if (local.name === classIdentifier) {
                parser.error("Already a variable with this name in this scope.");
            }
        }

        //define the variable without existences
        current.addLocal(classIdentifier);

        //markInitialized
        current.locals[ current.localCount - 1 ].depth = current.scopeDepth;

    } else {
        //defineVariable
        current.closure.emitBytes(OpCode.OP_DEFINE_GLOBAL, classConstantIndex);
    }

    //TODO GC CompilerClass
    //handle methods
    const compilerClass = {
        enclosing: currentClass,
        hasSuperClass: false,
    };

    env.currentClass = compilerClass;

    //check for inheritance
    if (parser.match(TokenType.TOKEN_LESS)){
        parser.consume(TokenType.TOKEN_IDENTIFIER, 'Expect superclass name.');
        const superClassIdentifier = parser.previous.payload;
        //namedVariable check where the identifier is
        identifier(false, env);

        //check that the class and superclass are different
        if (classIdentifier === superClassIdentifier){
            parser.error("A class can't inherit from itself.");
        }

        current.beginScope();
        current.addLocal("super");
        //markInitialized
        current.locals[ current.localCount - 1 ].depth = current.scopeDepth;

        //namedVariable
        namedVariable(classIdentifier, false, env);

        current.closure.emitByte(OpCode.OP_INHERIT);
        currentClass.hasSuperClass = true;
    }

    namedVariable(classIdentifier, false, env);

    parser.consume (TokenType.TOKEN_LEFT_BRACE , "Expect '{' before class body." );

    while(!parser.check(TokenType.TOKEN_RIGHT_BRACE) && !parser.check(TokenType.TOKEN_EOF)){
        method(env);
    }

    parser.consume(TokenType.TOKEN_RIGHT_BRACE , "Expect '}' after class body." );

    current.closure.emitByte(OpCode.OP_POP);

    if (env.currentClass.hasSuperClass){
        current.beginScope();
    }

    env.currentClass = env.currentClass.enclosing;
}

export default classDeclaration;