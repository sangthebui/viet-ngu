import TokenType from "../Types/TokenType.js";
import CallableType from "../Types/CallableType.js";
import OpCode from "../Types/OpCode.js";

import namedVariable from "../Expressions/namedVariable.js";
import identifier from "../Expressions/identifier.js";
import Callable from "../Objects/Callable.js";
import Ledger from "../Objects/Ledger.js";
import blockStatement from "../Statements/blockStatement.js";
import { funParameters} from "./funDeclaration.js";
import CompilerType from "../Types/CompilerType.js";
import expression from "../Expressions/expression.js";

// a class method has the following signature identifier (
// field has the following signature identifier ; or identifier = expression ;
const method = (identifierName, env) =>{
    let {current, parser} = env;
    const identifierConstantIndex = current.closure.identifierConstant(identifierName);

    //TODO GC Closure
    // compile the function body as a method
    let closure = new Callable({parser});
    closure.name = identifierName;
    closure.type = CallableType.METHOD;
    let compiler = new Ledger({parser});
    compiler.setClosure(closure);
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

    //handles parameters, add each parameter to the locals object
    funParameters(env);
    parser.consume(TokenType.TOKEN_RIGHT_PAREN, 'Expect ")" after parameters.');
    parser.consume(TokenType.TOKEN_LEFT_BRACE, 'Expect "{" before function body.');
    blockStatement(env);

    //set back the last scope
    const newClosure = env.current.endCompiler(env);

    current.closure.emitBytes(OpCode.OP_CLOSURE, newClosure);

    //capture upvalues
    for (let i = 0; i < newClosure.upvalueCount; i++) {
        current.closure.emitByte(compiler.upvalues[i].isLocal ? 1 : 0);
        current.closure.emitByte(compiler.upvalues[i].index);
    }

    //the binding of methods happens at runtime
    current.closure.emitBytes(OpCode.OP_METHOD, identifierConstantIndex);
}

const classBody = (env) => {
    let {current, parser} = env;
    //TODO better error message
    if (!parser.match(TokenType.TOKEN_IDENTIFIER)){
        parser.error(`Syntax Error: ${parser.previous.payload}  not recognized in class.`);
        return false;
    }
    const identifierName = parser.previous.payload;

    if (parser.match(TokenType.TOKEN_LEFT_PAREN)){
        //we are a method
        method(identifierName, env);
    } else if (parser.match(TokenType.TOKEN_EQUAL)){
        //we are an expression
        expression(env);
        const identifierConstantIndex = current.closure.identifierConstant(identifierName);
        current.closure.emitBytes(OpCode.OP_SET_FIELD, identifierConstantIndex);
        parser.consume(TokenType.TOKEN_SEMICOLON, 'Expect semicolon after expression.');
    } else if (parser.match(TokenType.TOKEN_SEMICOLON)){
        //we are a declaration
        const identifierConstantIndex = current.closure.identifierConstant(identifierName);
        current.closure.emitBytes(OpCode.OP_DECLARE_FIELD, identifierConstantIndex);
    }

    return true;
}

const inheritance = (classIdentifier, env) => {
    const {currentClass, current, parser} = env;
    //check for inheritance
    if (parser.match(TokenType.TOKEN_EXTENDS)){
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
}

const classDeclaration = (env) => {
    let {current, currentClass, parser} = env;
    parser.consume (TokenType.TOKEN_IDENTIFIER , "Expect class name." );
    const classIdentifier = parser.previous.payload;
    let classConstantIndex = current.closure.identifierConstant(classIdentifier);

    //TODO GC Klass object
    let klass = {
        name: classIdentifier,
        type: CallableType.CLASS,
        methods: {},
        fields: {},//for instance field
        static: {}, // for static
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
    inheritance(classIdentifier, env);

    namedVariable(classIdentifier, false, env);

    parser.consume (TokenType.TOKEN_LEFT_BRACE , "Expect '{' before class body." );

    while(!parser.check(TokenType.TOKEN_RIGHT_BRACE) && !parser.check(TokenType.TOKEN_EOF)){
        if (!classBody(env)){
            break; //exit the infinite loop
        }
    }

    parser.consume(TokenType.TOKEN_RIGHT_BRACE , "Expect '}' after class body." );

    current.closure.emitByte(OpCode.OP_POP);

    if (env.currentClass.hasSuperClass){
        current.endScope();
    }

    env.currentClass = env.currentClass.enclosing;
}

export default classDeclaration;