import TokenType from "./Compile/TokenType.js";
import { ObjectLox, ValueType } from "./Objects.js";
import OpCode from "./Compile/OpCode.js";
import Precedence from "./Compile/Precedence.js";
import ClosureType from "./Compile/ClosureType.js";
import CallableType from "./Compile/CallableType.js";
import parser from "./Compile/Parser.js";
import Callable from "./Compile/Callable.js";
import Compiler from "./Compile/Compiler.js";

import synchronize from "./Compile/synchronize.js";
import expression from "./Compile/expression.js";

//the current parser

export default class CompilerS {
    //TODO GC => object
    current = null;
    currentClass = null;
    rules = {
        [ TokenType.TOKEN_LEFT_PAREN ]    : { prefix: () => this.grouping(), infix: () => this.call() , precedence: Precedence.PREC_CALL },
        [ TokenType.TOKEN_RIGHT_PAREN ]   : { prefix: null, infix: null , precedence: Precedence.PREC_NONE },
        [ TokenType.TOKEN_LEFT_BRACE ]    : { prefix: null, infix: null , precedence: Precedence.PREC_NONE },
        [ TokenType.TOKEN_RIGHT_BRACE ]   : { prefix: null, infix: null , precedence: Precedence.PREC_NONE },
        [ TokenType.TOKEN_COMMA ]         : { prefix: null, infix: null , precedence: Precedence.PREC_NONE },
        [ TokenType.TOKEN_DOT ]           : { prefix: null, infix: (cA) => this.dot(cA) , precedence: Precedence.PREC_CALL },
        [ TokenType.TOKEN_MINUS ]         : { prefix: () => this.unary(), infix: () => this.binary(), precedence: Precedence.PREC_TERM },
        [ TokenType.TOKEN_PLUS ]          : { prefix: null, infix: () => this.binary() , precedence: Precedence.PREC_TERM },
        [ TokenType.TOKEN_SEMICOLON ]     : { prefix: null, infix: null , precedence: Precedence.PREC_NONE },
        [ TokenType.TOKEN_SLASH ]         : { prefix: null , infix: () => this.binary() , precedence: Precedence.PREC_FACTOR },
        [ TokenType.TOKEN_STAR ]          : { prefix: null , infix: () => this.binary() , precedence: Precedence.PREC_FACTOR },
        [ TokenType.TOKEN_BANG ]          : { prefix: () => this.unary(), infix: null , precedence: Precedence.PREC_NONE },
        [ TokenType.TOKEN_BANG_EQUAL ]    : { prefix: null , infix: () => this.binary() , precedence: Precedence.PREC_EQUALITY },
        [ TokenType.TOKEN_EQUAL ]         : { prefix: null , infix: null , precedence: Precedence.PREC_NONE },
        [ TokenType.TOKEN_EQUAL_EQUAL ]   : { prefix: null , infix: () => this.binary() , precedence: Precedence.PREC_EQUALITY},
        [ TokenType.TOKEN_GREATER ]       : { prefix: null , infix: () => this.binary() , precedence: Precedence.PREC_COMPARISON },
        [ TokenType.TOKEN_GREATER_EQUAL ] : { prefix: null , infix: () => this.binary() , precedence: Precedence.PREC_COMPARISON },
        [ TokenType.TOKEN_LESS ]          : { prefix: null , infix: () => this.binary() , precedence: Precedence.PREC_COMPARISON },
        [ TokenType.TOKEN_LESS_EQUAL ]    : { prefix: null , infix: () => this.binary() , precedence: Precedence.PREC_COMPARISON },
        [ TokenType.TOKEN_IDENTIFIER ]    : { prefix: (cA) => this.identifier(cA),
            infix: null , precedence: Precedence.PREC_NONE },

        [ TokenType.TOKEN_STRING ]        : { prefix: () => this.string() , infix: null , precedence: Precedence.PREC_NONE },
        [ TokenType.TOKEN_NUMBER ]        : { prefix: () => this.number(), infix: null , precedence: Precedence.PREC_NONE },
        [ TokenType.TOKEN_AND ]           : { prefix: null , infix: () => this.and_() , precedence: Precedence.PREC_AND },
        [ TokenType.TOKEN_CLASS ]         : { prefix: null , infix: null , precedence: Precedence.PREC_NONE },
        [ TokenType.TOKEN_ELSE ]          : { prefix: null , infix: null , precedence: Precedence.PREC_NONE },
        [ TokenType.TOKEN_FALSE ]         : { prefix: () => this.literal(),infix: null , precedence: Precedence.PREC_NONE },
        [ TokenType.TOKEN_FOR ]           : { prefix: null , infix: null , precedence: Precedence.PREC_NONE },
        [ TokenType.TOKEN_FUN ]           : { prefix: null , infix: null , precedence: Precedence.PREC_NONE },
        [ TokenType.TOKEN_IF ]            : { prefix: null , infix: null , precedence: Precedence.PREC_NONE },
        [ TokenType.TOKEN_NIL ]           : { prefix: () => this.literal(), infix: null , precedence: Precedence.PREC_NONE },
        [ TokenType.TOKEN_OR ]            : { prefix: null , infix: () => this.or_() , precedence: Precedence.PREC_OR },
        [ TokenType.TOKEN_PRINT ]         : { prefix: null , infix: null , precedence: Precedence.PREC_NONE },
        [ TokenType.TOKEN_RETURN ]        : { prefix: null , infix: null , precedence: Precedence.PREC_NONE },
        [ TokenType.TOKEN_SUPER ]         : { prefix: () => this.super_() , infix: null , precedence: Precedence.PREC_NONE },
        [ TokenType.TOKEN_THIS ]          : { prefix: () => this.this_() , infix: null , precedence: Precedence.PREC_NONE },
        [ TokenType.TOKEN_TRUE ]          : { prefix: () => this.literal() , infix: null , precedence: Precedence.PREC_NONE },
        [ TokenType.TOKEN_VAR ]           : { prefix: null , infix: null , precedence: Precedence.PREC_NONE },
        [ TokenType.TOKEN_WHILE ]         : { prefix: null , infix: null , precedence: Precedence.PREC_NONE },
        [ TokenType.TOKEN_ERROR ]         : { prefix: null , infix: null , precedence: Precedence.PREC_NONE },
        [ TokenType.TOKEN_EOF ]           : { prefix: null , infix: null , precedence: Precedence.PREC_NONE },
        [ TokenType.TOKEN_CASE ]          : { prefix: null , infix: null , precedence: Precedence.PREC_NONE },
        [ TokenType.TOKEN_COLON ]          : { prefix: null , infix: null , precedence: Precedence.PREC_NONE },
    };
    constructor(source){
        parser.setSource(source);
        //create the script current compiler
        let callable =  new Callable();
        this.current = new Compiler(callable);
        this.current.addLocal({
            name: '<script>',
            depth: 0,
            isCaptured: false,
        })
    }

    //region all parsing functions only

    varDeclaration(){
        //Declaring a variable only adds it to the local scope.
        const errorMessage = 'Expect variable name.';
        parser.consume(TokenType.TOKEN_IDENTIFIER, errorMessage);
        const identifierName = parser.previous.payload;
        let identifierConstantIndex = this.current.closure.identifierConstant(identifierName);

        //We are in local scope
        if (this.current.scopeDepth > 0){
            //we are at the local scope.
            //we are not at the top level, define it locally
            //check to see if that variable exist locally first by looking backward
            for(let i = this.current.localCount - 1; i >= 0 ; i--) {
                let local = this.current.locals[i];
                if (local.depth !== -1 && local.depth < this.current.scopeDepth) {
                    break;
                }

                if (local.name === identifierName){
                    parser.error("Already a variable with this name in this scope.");
                }
            }

            //define the variable without existences
            this.current.addLocal(identifierName);

            //compile the initializer, either there is an expression or there is none
            //and we set it to NIL
            if(parser.match(TokenType.TOKEN_EQUAL)){
                //this will put a value on the stack, then at the end,
                // an OpCode will determine where that variable will live.
                expression({currentClass: this.currentClass, current: this.current});
            } else {
                //if there is no value, we set the variable to nil
                this.current.closure.emitByte(OpCode.OP_NIL);
            }

            //defineVariable: mark the locals with the scopeDepth
            this.current.locals[ this.current.localCount - 1 ].depth = this.current.scopeDepth;

        } else {
            //compile the initializer, either there is an expression or there is none
            //and we set it to NIL
            if(parser.match(TokenType.TOKEN_EQUAL)){
                //this will put a value on the stack, then at the end,
                // an OpCode will determine where that variable will live.
                expression({currentClass: this.currentClass, current: this.current});
            } else {
                //if there is no value, we set the variable to nil
                this.current.closure.emitByte(OpCode.OP_NIL);
            }
            //we are at global scope.
            this.current.closure.emitBytes(OpCode.OP_DEFINE_GLOBAL, identifierConstantIndex);

        }

        parser.consume(TokenType.TOKEN_SEMICOLON, 'Expect ";" after variable declaration.');
    }
    funParameters(){
        if (!parser.check(TokenType.TOKEN_RIGHT_PAREN)) {
            do {
                this.current.closure.arity++;
                if (this.current.closure.arity > 255) {
                    parser.errorAtCurrent("Can't have more than 255 parameters.");
                }
                parser.consume(TokenType.TOKEN_IDENTIFIER, "Expect parameter name.");
                // const parameterName = parser.previous.payload;
                let identifierName = parser.previous.payload;
                let identifierConstantIndex = this.current.closure.identifierConstant(identifierName);

                if (this.current.scopeDepth > 0){
                    //we are at the local
                    //check to see if that variable exist locally first by looking backward
                    for(let i = this.current.localCount - 1; i >= 0 ; i--) {
                        let local = this.current.locals[i];
                        if (local.depth !== -1 && local.depth < this.current.scopeDepth) {
                            break;
                        }

                        if (local.name === identifierName){
                            parser.error("Already a variable with this name in this scope.");
                        }
                    }

                    //define the variable without existences
                    this.current.addLocal(identifierName);

                    //markInitialized
                    this.current.locals[ this.current.localCount - 1 ].depth = this.current.scopeDepth;

                } else {
                    //defineVariable
                    this.current.closure.emitBytes(OpCode.OP_DEFINE_GLOBAL, identifierConstantIndex);
                }

            } while (parser.match(TokenType.TOKEN_COMMA));
            //reverse the order the parameters are stored because of the order arguments are stored in the stack as last items are at the top
        }
    }
    funDeclaration(){
        //consume the identifier
        parser.consume(TokenType.TOKEN_IDENTIFIER, 'Expect function name.');
        const identifierName = parser.previous.payload;
        let identifierConstantIndex = this.current.closure.identifierConstant(identifierName);
        //check if the name has been created

        //determine where the variable lives
        if (this.current.scopeDepth > 0){
            //we are at the local scope.
            //check to see if that variable exist locally first by looking backward
            for(let i = this.current.localCount - 1; i >= 0 ; i--) {
                let local = this.current.locals[i];
                if (local.depth !== -1 && local.depth < this.current.scopeDepth) {
                    break;
                }

                if (local.name === identifierName){
                    parser.error("Already a variable with this name in this scope.");
                }
            }
            //define the variable without existences
            this.current.addLocal(identifierName);

            //markInitialized
            this.current.locals[ this.current.localCount - 1 ].depth = this.current.scopeDepth;
        }
        //TODO GC Local
        // start to compile function body
        let closure = new Callable();
        closure.name = identifierName;

        //TODO GC Closure
        let compiler = new Compiler(closure);
        compiler.addLocal({
            name: '',
            depth: 0,
            isCaptured: false,
        });
        compiler.enclosing = this.current;
        compiler.type = ClosureType.CLOSURE;

        this.current = compiler; // set the new compiler for this function

        this.current.beginScope(); // no end scope

        //change the current with a new Compiler block

        parser.consume(TokenType.TOKEN_LEFT_PAREN, 'Expect "(" after function name.');
        //handles parameters, add each parameter to the locals object
        this.funParameters();
        parser.consume(TokenType.TOKEN_RIGHT_PAREN, 'Expect ")" after parameters.');
        parser.consume(TokenType.TOKEN_LEFT_BRACE, 'Expect "{" before function body.');
        this.block();

        //set back the last scope
        const newClosure = this.endCompiler();

        this.current.closure.emitBytes(OpCode.OP_CLOSURE, newClosure);


        //capture upvalues
        for (let i = 0; i < newClosure.upvalueCount; i++) {
            this.current.closure.emitByte(compiler.upvalues[i].isLocal ? 1 : 0);
            this.current.closure.emitByte(compiler.upvalues[i].index);
        }

        //define global variable at the end
        if (this.current.scopeDepth === 0){
            this.current.closure.emitBytes(OpCode.OP_DEFINE_GLOBAL, identifierConstantIndex);
        }
    };
    method(){
        parser.consume(TokenType.TOKEN_IDENTIFIER, 'Expect method name.');
        const identifierName = parser.previous.payload;
        const identifierConstantIndex = this.current.closure.identifierConstant(identifierName);

        //TODO GC Local
        // start to compile function body
        let firstLocal = {
            name: 'this',
            depth: 0,
            isCaptured: false,
        };

        //TODO GC Closure
        // compile the function body as a method
        let closure = new Callable();
        closure.name = identifierName;
        closure.type = CallableType.METHOD;
        let compiler = new Compiler(closure);
        compiler.addLocal({
            name: 'this',
            depth: 0,
            isCaptured: false,
        });
        compiler.enclosing = this.current;
        compiler.type = ClosureType.METHOD;

        //check if the method is an init
        if (identifierName === 'init'){
            compiler.type = ValueType.INITIALIZER;
        }

        this.current = compiler; // set the new compiler for this function

        this.current.beginScope();
        //change the current with a new Compiler block

        parser.consume(TokenType.TOKEN_LEFT_PAREN, 'Expect "(" after function name.');
        //handles parameters, add each parameter to the locals object
        this.funParameters();
        parser.consume(TokenType.TOKEN_RIGHT_PAREN, 'Expect ")" after parameters.');
        parser.consume(TokenType.TOKEN_LEFT_BRACE, 'Expect "{" before function body.');
        this.block();

        //set back the last scope
        const newClosure = this.endCompiler();

        this.current.closure.emitBytes(OpCode.OP_CLOSURE, newClosure);

        //capture upvalues
        for (let i = 0; i < newClosure.upvalueCount; i++) {
            this.current.closure.emitByte(compiler.upvalues[i].isLocal ? 1 : 0);
            this.current.closure.emitByte(compiler.upvalues[i].index);
        }

        //the binding of methods happens at runtime
        this.current.closure.emitBytes(OpCode.OP_METHOD, identifierConstantIndex);

    }
    classDeclaration(){
        parser.consume (TokenType.TOKEN_IDENTIFIER , "Expect class name." );
        const classIdentifier = parser.previous.payload;
        let classConstantIndex = this.current.closure.identifierConstant(classIdentifier);

        //TODO GC Klass object
        let klass = {
            name: classIdentifier,
            type: CallableType.CLASS,
            methods: {},
            super: null,
        };

        this.current.closure.emitBytes(OpCode.OP_CLASS , klass);

        //determine where the variable lives
        if (this.current.scopeDepth > 0) {
            //we are at the local
            //check to see if that variable exist locally first by looking backward
            for (let i = this.current.localCount - 1; i >= 0; i--) {
                let local = this.current.locals[i];
                if (local.depth !== -1 && local.depth < this.current.scopeDepth) {
                    break;
                }

                if (local.name === classIdentifier) {
                    parser.error("Already a variable with this name in this scope.");
                }
            }

            //define the variable without existences
            this.current.addLocal(classIdentifier);

            //markInitialized
            this.current.locals[ this.current.localCount - 1 ].depth = this.current.scopeDepth;

        } else {
            //defineVariable
            this.current.closure.emitBytes(OpCode.OP_DEFINE_GLOBAL, classConstantIndex);
        }

        //TODO GC CompilerClass
        //handle methods
        const compilerClass = {
            enclosing: this.currentClass,
            hasSuperClass: false,
        };

        this.currentClass = compilerClass;

        //check for inheritance
        if (parser.match(TokenType.TOKEN_LESS)){
            parser.consume(TokenType.TOKEN_IDENTIFIER, 'Expect superclass name.');
            const superClassIdentifier = parser.previous.payload;
            //namedVariable check where the identifier is
            this.identifier(false);

            //check that the class and superclass are different
            if (classIdentifier === superClassIdentifier){
                parser.error("A class can't inherit from itself.");
            }

            this.current.beginScope();
            this.current.addLocal("super");
            //markInitialized
            this.current.locals[ this.current.localCount - 1 ].depth = this.current.scopeDepth;

            //namedVariable
            this.namedVariable(classIdentifier, false);

            this.current.closure.emitByte(OpCode.OP_INHERIT);
            this.currentClass.hasSuperClass = true;
        }

        this.namedVariable(classIdentifier, false);

        parser.consume ( TokenType.TOKEN_LEFT_BRACE , "Expect '{' before class body." );

        while(!parser.check(TokenType.TOKEN_RIGHT_BRACE) && !parser.check(TokenType.TOKEN_EOF)){
            this.method();
        }

        parser.consume ( TokenType.TOKEN_RIGHT_BRACE , "Expect '}' after class body." );

        this.current.closure.emitByte(OpCode.OP_POP);

        if (this.currentClass.hasSuperClass){
            this.current.beginScope();
        }

        this.currentClass = this.currentClass.enclosing;
    }

    printStatement(){
        expression({currentClass: this.currentClass, current: this.current});
        parser.consume(TokenType.TOKEN_SEMICOLON, 'Expect ";" after value.');
        this.current.closure.emitByte(OpCode.OP_PRINT);
    }
    breakStatement(){
        parser.consume(TokenType.TOKEN_SEMICOLON, 'Expect ";" after break.');

    }
    forStatement(){
        //Note, no braces within the for statement
        this.current.beginScope();

        parser.consume(TokenType.TOKEN_LEFT_PAREN, 'Expect "(" after "for".');

        //for initializer
        if (parser.match(TokenType.TOKEN_SEMICOLON)){
            //No initializer.
        } else if (parser.match(TokenType.TOKEN_VAR)){
            this.varDeclaration();
        } else {
            this.expressionStatement();
        }

        //
        let loopStart = this.current.closure.code.length;

        let exitJump = -1;

        // for exit condition
        if (!parser.match(TokenType.TOKEN_SEMICOLON)){
            expression({currentClass: this.currentClass, current: this.current});
            parser.consume(TokenType.TOKEN_SEMICOLON, 'Expect ";" after loop condition.');

            // Jump out of the loop if the condition is false.
            exitJump = this.current.closure.emitJump(OpCode.OP_JUMP_IF_FALSE);
            this.current.closure.emitByte(OpCode.OP_POP); //condition
        }


        // for increment
        if (!parser.match(TokenType.TOKEN_RIGHT_PAREN)){
            const bodyJump = this.current.closure.emitJump(OpCode.OP_JUMP);
            const incrementStart = this.current.closure.code.length;
            expression({currentClass: this.currentClass, current: this.current});
            this.current.closure.emitByte(OpCode.OP_POP);
            parser.consume(TokenType.TOKEN_RIGHT_PAREN, 'Expect ")" after for clauses.');

            this.current.closure.emitLoop(loopStart);
            loopStart = incrementStart;
            this.current.closure.patchJump(bodyJump);
        }

        // all the statements in for
        this.statement();
        this.current.closure.emitLoop(loopStart);

        //exit jump
        if (exitJump !== -1){
            this.current.closure.patchJump(exitJump);
            this.current.closure.emitByte(OpCode.OP_POP);
        }
        this.current.beginScope();
    }
    ifStatement(){
        parser.consume(TokenType.TOKEN_LEFT_PAREN, "Expect '(' after 'if'.");
        expression({currentClass: this.currentClass, current: this.current});
        parser.consume(TokenType.TOKEN_RIGHT_PAREN, "Expect ')' after condition."); // [paren]

        let thenJump = this.current.closure.emitJump(OpCode.OP_JUMP_IF_FALSE);
        // pop-then
        this.current.closure.emitByte(OpCode.OP_POP);
        //pop-then
        this.statement();

        // jump-over-else
        let elseJump = this.current.closure.emitJump(OpCode.OP_JUMP);

        // jump-over-else
        this.current.closure.patchJump(thenJump);

        // pop-end
        this.current.closure.emitByte(OpCode.OP_POP);
        // pop-end
        // compile-else

        if (parser.match(TokenType.TOKEN_ELSE)) this.statement();
        // compile-else
        //patch-else
        this.current.closure.patchJump(elseJump);
    }
    returnStatement(){
        if (this.current.type === ClosureType.SCRIPT){
            parser.error("Can't return from top-level code.");
        }

        if(parser.match(TokenType.TOKEN_SEMICOLON)){
            this.current.closure.emitReturn();
        } else {

            if (this.current.type === ClosureType.INITIALIZER) {
                parser.error("Can't return a value from an initializer.");
            }

            expression({currentClass: this.currentClass, current: this.current});
            parser.consume(TokenType.TOKEN_SEMICOLON, 'Expect ";" after return value.');
            this.current.closure.emitByte(OpCode.OP_RETURN);
        }
    }
    whileStatement(){
        //start the while loop
        const loopStart = this.current.closure.code.length;
        //check the condition
        parser.consume(TokenType.TOKEN_LEFT_PAREN, 'Expect "(" after "while".');
        expression({currentClass: this.currentClass, current: this.current});
        parser.consume(TokenType.TOKEN_RIGHT_PAREN, 'Expect ")" after condition.');

        const exitJump = this.current.closure.emitJump(OpCode.OP_JUMP_IF_FALSE);
        this.current.closure.emitByte(OpCode.OP_POP);

        //execute the statement inside the loop
        this.statement();

        this.current.closure.emitLoop(loopStart);

        this.current.closure.patchJump(exitJump);
        this.current.closure.emitByte(OpCode.OP_POP);
    }
    switchStatement(){
        const MAX_CASES = 256;
        parser.consume(TokenType.TOKEN_LEFT_PAREN, 'Expect "(" after "switch".');
        expression({currentClass: this.currentClass, current: this.current});
        parser.consume(TokenType.TOKEN_RIGHT_PAREN, 'Expect ")" after value.');
        parser.consume(TokenType.TOKEN_LEFT_BRACE, 'Expect "{" before switch cases.');

        let state = 0;  //
        let caseEnds = [];
        let caseCount = 0; //the total # of cases
        let previousCaseSkip = -1;

        //we are still in the switch statement
        while (!parser.match(TokenType.TOKEN_RIGHT_BRACE) && !parser.check(TokenType.TOKEN_EOF)) {

            //parse the case or default
            if (parser.match(TokenType.TOKEN_CASE) || parser.match(TokenType.TOKEN_DEFAULT)) {
                let caseType = parser.previous.type;

                if (state === 2) {
                    parser.error("Can't have another case or default after the default case");
                }

                if (state === 1) {
                    //At the end of the previous case, jump over the others. tidy up last case
                    caseEnds[caseCount++] = this.current.closure.emitJump(OpCode.OP_JUMP);

                    //Patch its condition to jump to the next case (this one).

                    this.current.closure.patchJump(previousCaseSkip);
                    this.current.closure.emitByte(OpCode.OP_POP);
                }

                if (caseType === TokenType.TOKEN_CASE) {
                    state = 1;

                    //See if the case is equal to the value.
                    this.current.closure.emitByte(OpCode.OP_DUP);
                    expression({currentClass: this.currentClass, current: this.current});

                    parser.consume(TokenType.TOKEN_COLON, "Expect ':' after case value.");

                    this.current.closure.emitByte(OpCode.OP_EQUAL);
                    previousCaseSkip = this.current.closure.emitJump(OpCode.OP_JUMP_IF_FALSE);

                    // Pop the comparison result TODO?? look at this pop.
                    this.current.closure.emitByte(OpCode.OP_POP);
                } else {
                    state = 2;
                    parser.consume(TokenType.TOKEN_COLON, "Expect ':' after default.");
                    previousCaseSkip = -1;
                }
            } else {
                //Otherwise, it's a statement inside the current case or default.
                if (state === 0) {
                    parser.error("Can't have statements before any case");
                }
                this.statement();
            }
        }

        // If we ended without a default case, patch its condition jump.
        if (state === 1){
            this.current.closure.patchJump(previousCaseSkip);
            this.current.closure.emitByte(OpCode.OP_POP);
        }

        //Patch all the case jumps to the end.
        for(let i = 0; i < caseCount; i++){
            this.current.closure.patchJump(caseEnds[i]);
        }

        this.current.closure.emitByte(OpCode.OP_POP); // pop the switch value

    }
    expressionStatement(){
        expression({currentClass: this.currentClass, current: this.current});
        parser.consume(TokenType.TOKEN_SEMICOLON, "Expect ';' after expression.");
        this.current.closure.emitByte(OpCode.OP_POP);
    }
    block (){
        while(!parser.check(TokenType.TOKEN_RIGHT_BRACE) && !parser.check(TokenType.TOKEN_EOF)){
            this.declaration();
        }
        parser.consume(TokenType.TOKEN_RIGHT_BRACE, 'Expect "}" after block.');
    };
    statement(){
        if (parser.match(TokenType.TOKEN_PRINT)) {
            this.printStatement();
        } else if (parser.match(TokenType.TOKEN_BREAK)){
            this.breakStatement();
        }else if (parser.match(TokenType.TOKEN_FOR)){
            this.forStatement();
        } else if (parser.match(TokenType.TOKEN_IF)){
            this.ifStatement();
        } else if (parser.match(TokenType.TOKEN_RETURN)){
            this.returnStatement();
        } else if (parser.match(TokenType.TOKEN_WHILE)){
            this.whileStatement();
        } else if (parser.match(TokenType.TOKEN_SWITCH)){
           this.switchStatement();
        } else if (parser.match(TokenType.TOKEN_LEFT_BRACE)){
            //for block statements
            this.current.beginScope();
            this.block();
            this.current.endScope();
        } else {
            this.expressionStatement();
        }
    }
    declaration(){
        if (parser.match(TokenType.TOKEN_CLASS)){
            this.classDeclaration();
        } else if (parser.match(TokenType.TOKEN_FUN)){
            this.funDeclaration();
        } else if (parser.match(TokenType.TOKEN_VAR)) {
            this.varDeclaration();
        } else {
            this.statement();
        }
        if (parser.panicMode) synchronize();
    };

    endCompiler(){
        //return to the outer function
        this.current.closure.emitReturn();
        let closure = this.current.closure; //return the function object
        // set the enclosing function to be this function, essentially pop this function off the stack
        this.current = this.current.enclosing;

        return closure;
    }
    //endregion

    compile() {
        parser.hadError = false;
        parser.panicMode = false;

        parser.advance();

        while (!parser.match(TokenType.TOKEN_EOF)){
            //each declaration is in charge of advancing the next token.
            this.declaration();
        }
        const closure = this.endCompiler();

        return parser.hadError ? null : closure;
    }
}