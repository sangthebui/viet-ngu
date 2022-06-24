import TokenType from "./TokenType.js";
import CallableType from "./CallableType.js";
import OpCode from "./OpCode.js";


const classDeclaration = ({current, parser}) => {
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
        addLocal(classIdentifier);

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

    currentClass = compilerClass;

    //check for inheritance
    if (parser.match(TokenType.TOKEN_LESS)){
        parser.consume(TokenType.TOKEN_IDENTIFIER, 'Expect superclass name.');
        const superClassIdentifier = parser.previous.payload;
        //namedVariable check where the identifier is
        identifier(false);

        //check that the class and superclass are different
        if (classIdentifier === superClassIdentifier){
            parser.error("A class can't inherit from itself.");
        }

        beginScope();
        addLocal("super");
        //markInitialized
        current.locals[ current.localCount - 1 ].depth = current.scopeDepth;

        //namedVariable
        namedVariable(classIdentifier, false);

        current.closure.emitByte(OpCode.OP_INHERIT);
        currentClass.hasSuperClass = true;
    }

    namedVariable(classIdentifier, false);

    parser.consume ( TokenType.TOKEN_LEFT_BRACE , "Expect '{' before class body." );

    while(!parser.check(TokenType.TOKEN_RIGHT_BRACE) && !parser.check(TokenType.TOKEN_EOF)){
        method();
    }

    parser.consume ( TokenType.TOKEN_RIGHT_BRACE , "Expect '}' after class body." );

    current.closure.emitByte(OpCode.OP_POP);

    if (currentClass.hasSuperClass){
        endScope();
    }

    currentClass = currentClass.enclosing;
}

export default classDeclaration;