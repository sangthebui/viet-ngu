import TokenType from "./Compile/TokenType.js";

import { ObjectLox, ValueType } from "./Objects.js";
import OpCode from "./Compile/OpCode.js";
import Precedence from "./Compile/Precedence.js";
import CompileType from "./Compile/CompileType.js";
import print from './print.js';
import Parser from "./Compile/Parser.js";

const UINT8_COUNT  = 255;

export default class Compiler {
    //the current parser
    parser = null;
    //TODO GC => object
    current = {
        arity: 0,
        locals: [{
            name: '<script>',
            depth: 0,
            isCaptured: false,
        }], //only compile locals
        code: [],
        lines: [],
        constants: [],
        ip: 0,
        enclosing: null,
        compileType: CompileType.CLOSURE,
        type: ValueType.CLOSURE,
        name: '<script>',
        scopeDepth: 0,
        localCount: 1,
        upvalueCount: 0,
        upvalues: [],

        frameUpvalues: {}, //for VM upvalues,
    };
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
        this.parser = new Parser(source);
    }


    //region  chunk manipulation and emitting bytecode
    //TODO need to convert
    synchronize(){
        if (this.parser.previous.type === TokenType.TOKEN_SEMICOLON) return;
        switch (this.parser.current.type) {
            case TokenType.TOKEN_CLASS:
            case TokenType.TOKEN_FUN:
            case TokenType.TOKEN_VAR:
            case TokenType.TOKEN_FOR:
            case TokenType.TOKEN_IF:
            case TokenType.TOKEN_WHILE:
            case TokenType.TOKEN_PRINT:
            case TokenType.TOKEN_RETURN:
                return;

            default:
                ; // Do nothing.
        }

        this.parser.advance();
    }
    addConstant(value){
        let count = this.current.constants.push(value);
        if (count > UINT8_COUNT){
            this.parser.error("Too many constants in one chunk.");
        }
        const index = count - 1;
        return index;
    }
    addLocal(name){
        if (this.current.localCount === UINT8_COUNT){
            this.parser.error("Too many local variables in function.");
        }
        //TODO GC => locals
        this.current.locals[this.current.localCount++] = {
            name,
            depth: -1,
            isCaptured: false,
        };
    }
    identifierConstant(identifierName){
        //TODO GC => Value
        // return this.addConstant(new Value(identifierName, ValueType.STRING));
        return this.addConstant(new ObjectLox(identifierName, ValueType.STRING))
    }
    writeChunk(byteCode, line){
        this.current.code.push(byteCode);
        this.current.lines.push(line);
    };
    emitByte (opcode) {
        this.writeChunk(opcode, this.parser.previous.line);
    };
    emitBytes(opCode1, opCode2) {
        this.emitByte(opCode1);
        this.emitByte(opCode2);
    };
    emitConstant(value){
        const constantIndex = this.addConstant(value);
        this.emitBytes(OpCode.OP_CONSTANT, constantIndex);
    }
    emitReturn() {
        if (this.current.type === ValueType.INITIALIZER){
            this.emitBytes(OpCode.OP_GET_LOCAL, 0);
        } else {
            this.emitByte(OpCode.OP_NIL);
        }
        this.emitByte(OpCode.OP_RETURN);
    };
    emitLoop(loopStart){
        this.emitByte(OpCode.OP_LOOP);
        // our jump only have one jump
        const oneJump = 1;
        const offset = this.current.code.length - loopStart + oneJump;
        if (offset > UINT8_COUNT){
            this.parser.error('Loop body too large.');
        }

        this.emitByte(offset);
    }
    emitJump(opCode){
        const oneJump = 1;

        this.emitByte(opCode);

        this.emitByte(OpCode.OP_EMPTY);

        const jump = this.current.code.length - oneJump;

        if (jump > UINT8_COUNT) {
            this.parser.error("Too much code to jump over.");
        }

        return jump;
    }
    patchJump(offset){
        const oneJump = 1;

        const jump = this.current.code.length - offset - oneJump;

        if (jump > UINT8_COUNT){
            this.parser.error('Too much code to jump over.');
        }
        this.current.code[offset] = jump;
    }
    parsePrecedence(precedence){
        this.parser.advance();

        //always a prefixRule
        const prefixRule = this.rules[this.parser.previous.type].prefix;
        if (prefixRule === null){
            this.parser.error('Expect expression.');
            return;
        }
        //only consume the equal if the expression is lower than the assignment
        const canAssign = precedence <= Precedence.PREC_ASSIGNMENT;
        prefixRule(canAssign);

        //parse anything that has less precedence than the current operator
        while(precedence <= this.rules[this.parser.current.type].precedence){
            this.parser.advance();

            const infixRule = this.rules[this.parser.previous.type].infix;
            infixRule(canAssign);
        }

        if (canAssign && this.parser.match(TokenType.TOKEN_EQUAL)){
            this.parser.error('Invalid assignment target.');
        }
    }
    //endregion

    //region all parsing functions only
    //When the user get or set an identifier
    resolveLocal(compiler, identifierName){
        for (let i = compiler.localCount - 1; i >= 0; i--){
            let local = compiler.locals[i];
            if (local.name === identifierName) {
                if (local.depth === -1){
                    this.parser.error("Can't read local variable in its own initializer.");
                }
                return i;
            }
        }
        return -1;
    }

    addUpvalue(compiler, index, isLocal){
        let upvalueCount = compiler.upvalueCount;

        for(let i = 0; i < upvalueCount; i++){
            let upvalue = compiler.upvalues[i];
            if (upvalue.index === index && upvalue.isLocal === isLocal){
                return i;
            }
        }

        if (upvalueCount === UINT8_COUNT){
            this.parser.error('Too many closure variables in function.');
            return 0;
        }
        //TODO GC => compiler upvalues
        compiler.upvalues[upvalueCount] = {
            isLocal,
            index,
        };
        return compiler.upvalueCount++;
    }

    resolveUpvalue(compiler, identifierName){
        if (compiler.enclosing === null) return -1;

        let local = this.resolveLocal(compiler.enclosing, identifierName);
        if (local !== -1){
            compiler.enclosing.locals[local].isCaptured = true;
            return this.addUpvalue(compiler, local, true);
        }

        let upvalue = this.resolveUpvalue(compiler.enclosing, identifierName);
        if (upvalue !== -1){
            return this.addUpvalue(compiler, upvalue, false);
        }

        return -1;
    }

    namedVariable(name, canAssign){
        let getOp , setOp ;
        let arg = this.resolveLocal(this.current , name);
        if ( arg !==  -1 ) {
            getOp = OpCode.OP_GET_LOCAL;
            setOp = OpCode.OP_SET_LOCAL;
        } else if ( (arg = this.resolveUpvalue(this.current, name)) !== -1 ) {
            getOp = OpCode.OP_GET_UPVALUE;
            setOp = OpCode.OP_SET_UPVALUE;
        } else {
            arg = this.identifierConstant(name);
            getOp = OpCode.OP_GET_GLOBAL;
            setOp = OpCode.OP_SET_GLOBAL;
        }

        if (canAssign && this.parser.match(TokenType.TOKEN_EQUAL)){
            this.expression();
            this.emitBytes(setOp, arg);
        } else {
            this.emitBytes(getOp, arg);
        }
    }

    identifier(canAssign){
        let identifierName = this.parser.previous.payload;
        this.namedVariable(identifierName, canAssign);
    }

    varDeclaration(){
        //Declaring a variable only adds it to the local scope.
        const errorMessage = 'Expect variable name.';
        this.parser.consume(TokenType.TOKEN_IDENTIFIER, errorMessage);
        const identifierName = this.parser.previous.payload;
        let identifierConstantIndex = this.identifierConstant(identifierName);

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
                    this.parser.error("Already a variable with this name in this scope.");
                }
            }

            //define the variable without existences
            this.addLocal(identifierName);

            //compile the initializer, either there is an expression or there is none
            //and we set it to NIL
            if(this.parser.match(TokenType.TOKEN_EQUAL)){
                //this will put a value on the stack, then at the end,
                // an OpCode will determine where that variable will live.
                this.expression();
            } else {
                //if there is no value, we set the variable to nil
                this.emitByte(OpCode.OP_NIL);
            }

            //defineVariable: mark the locals with the scopeDepth
            this.current.locals[ this.current.localCount - 1 ].depth = this.current.scopeDepth;

        } else {
            //compile the initializer, either there is an expression or there is none
            //and we set it to NIL
            if(this.parser.match(TokenType.TOKEN_EQUAL)){
                //this will put a value on the stack, then at the end,
                // an OpCode will determine where that variable will live.
                this.expression();
            } else {
                //if there is no value, we set the variable to nil
                this.emitByte(OpCode.OP_NIL);
            }
            //we are at global scope.
            this.emitBytes(OpCode.OP_DEFINE_GLOBAL, identifierConstantIndex);

        }

        this.parser.consume(TokenType.TOKEN_SEMICOLON, 'Expect ";" after variable declaration.');
    }

    number(){
        //payload is always a string
        const num = parseInt(this.parser.previous.payload);
        this.emitConstant(num);
    }
    string(){
        //TODO GC new Value
        this.emitConstant( new ObjectLox(this.parser.previous.payload, ValueType.STRING));
    }
    unary(){
        const operatorType = this.parser.previous.type;
        // Compile the operand

        //parse anything that has a higher precedence than it.
        this.parsePrecedence(Precedence.PREC_UNARY);

        //Emit the operator instruction.
        switch(operatorType){
            case TokenType.TOKEN_BANG: this.emitByte(OpCode.OP_NOT); break;
            case TokenType.TOKEN_MINUS: this.emitByte(OpCode.OP_NEGATE); break;
            default: return; // Unreachable
        }
    }
    binary(){
        //at this point, the first operand had already been parsed and pushed onto the stack.
        //get the operator
        const operator = this.parser.previous.type;
        const rule = this.rules[operator]; // get the rule for the operator
        //parse anything that has a rule that is greater than it first. Parse the
        //second operand before pushing the operator onto the stack.
        this.parsePrecedence(rule.precedence + 1);

        //then push the operator onto the stack
        switch(operator){
            case TokenType.TOKEN_BANG_EQUAL: this.emitBytes(OpCode.OP_EQUAL, OpCode.OP_NOT); break;
            case TokenType.TOKEN_EQUAL_EQUAL: this.emitByte(OpCode.OP_EQUAL); break;
            case TokenType.TOKEN_GREATER: this.emitByte(OpCode.OP_GREATER); break;
            case TokenType.TOKEN_GREATER_EQUAL: this.emitBytes(OpCode.OP_LESS, OpCode.OP_NOT); break;
            case TokenType.TOKEN_LESS: this.emitByte(OpCode.OP_LESS); break;
            case TokenType.TOKEN_LESS_EQUAL: this.emitBytes(OpCode.OP_GREATER, OpCode.OP_NOT); break;
            case TokenType.TOKEN_PLUS: this.emitByte(OpCode.OP_ADD); break;
            case TokenType.TOKEN_MINUS: this.emitByte(OpCode.OP_SUBTRACT); break;
            case TokenType.TOKEN_STAR: this.emitByte(OpCode.OP_MULTIPLY); break;
            case TokenType.TOKEN_SLASH: this.emitByte(OpCode.OP_DIVIDE); break;
            default: return; // Unreachable, should be error
        }
    }
    or_(){
        const elseJump = this.emitJump(OpCode.OP_JUMP_IF_FALSE);
        const endJump = this.emitJump(OpCode.OP_JUMP);

        this.patchJump(elseJump);
        this.emitByte(OpCode.OP_POP);

        this.parsePrecedence(Precedence.PREC_OR);
        this.patchJump(endJump);
    }
    and_(){
        const endJump = this.emitJump(OpCode.OP_JUMP_IF_FALSE);

        this.emitByte(OpCode.OP_POP);
        this.parsePrecedence(Precedence.PREC_AND);

        this.patchJump(endJump);
    }
    literal(){
        switch(this.parser.previous.type){
            case TokenType.TOKEN_FALSE: this.emitByte(OpCode.OP_FALSE); break;
            case TokenType.TOKEN_NIL: this.emitByte(OpCode.OP_NIL); break;
            case TokenType.TOKEN_TRUE: this.emitByte(OpCode.OP_TRUE); break;
            default: return; //Unreachable
        }
    }
    grouping(){
        this.expression();
        this.parser.consume(TokenType.TOKEN_RIGHT_PAREN, "Expect ')' after expression.");
    }
    dot(canAssign){
        this.parser.consume(TokenType.TOKEN_IDENTIFIER, 'Expect property name after ".".');
        const identifierName = this.parser.previous.payload;
        let identifierConstantIndex = this.identifierConstant(identifierName);

        if (canAssign && this.parser.match(TokenType.TOKEN_EQUAL)){
            this.expression();
            this.emitBytes(OpCode.OP_SET_PROPERTY, identifierConstantIndex);
        } else if (this.parser.match(TokenType.TOKEN_LEFT_PAREN)){
            //combine OP_GET_PROPERTY and OP_CALL
            let argCount = this.argumentList();
            //3 bytes
            this.emitBytes(OpCode.OP_INVOKE, identifierConstantIndex);
            this.emitByte(argCount);

        } else {
            this.emitBytes(OpCode.OP_GET_PROPERTY, identifierConstantIndex);
        }
    }
    this_(){
        if (this.currentClass === null){
            this.parser.error("can't use 'this' outside of a class.");
            return;
        }
        this.identifier(false);
    }
    super_(){
        if (this.currentClass === null){
            this.parser.error("can't user 'super' outside of a class.");
        } else if (!this.currentClass.hasSuperClass){
            this.parser.error("Can't use 'super' in a class with no superclass.");
        }
        this.parser.consume(TokenType.TOKEN_DOT , "Expect '.' after 'super'." );
        this.parser.consume(TokenType.TOKEN_IDENTIFIER , "Expect superclass method name." );
        let identifierName = this.parser.previous.payload;
        let identifierConstantIndex = this.identifierConstant(identifierName);


        this.namedVariable("this", false);

        if (this.parser.match(TokenType.TOKEN_LEFT_PAREN)) {
            let argCount = this.argumentList();
            this.namedVariable("super", false);
            this.emitBytes(OpCode.OP_SUPER_INVOKE, identifierConstantIndex);
            this.emitByte(argCount);
        } else {
            this.namedVariable("super", false);
            this.emitBytes(OpCode.OP_GET_SUPER, identifierConstantIndex);
        }
    }

    argumentList(){
        let argCount = 0;
        if (!this.parser.check(TokenType.TOKEN_RIGHT_PAREN)){
            do {
                this.expression();
                if (argCount === 255){
                    this.parser.error("Can't have more than 255 arguments.");
                }
                argCount++;
            } while (this.parser.match(TokenType.TOKEN_COMMA));
        }
        this.parser.consume(TokenType.TOKEN_RIGHT_PAREN, 'Expect ")" after arguments.');
        return argCount;
    }

    call(){
        //all the values to the argument are on the stack
        let argCount = this.argumentList();
        this.emitBytes(OpCode.OP_CALL, argCount);
    }

    funParameters(){
        if (!this.parser.check(TokenType.TOKEN_RIGHT_PAREN)) {
            do {
                this.current.arity++;
                if (this.current.arity > 255) {
                    this.parser.errorAtCurrent("Can't have more than 255 parameters.");
                }
                this.parser.consume(TokenType.TOKEN_IDENTIFIER, "Expect parameter name.");
                // const parameterName = this.parser.previous.payload;
                let identifierName = this.parser.previous.payload;
                let identifierConstantIndex = this.identifierConstant(identifierName);

                if (this.current.scopeDepth > 0){
                    //we are at the local
                    //check to see if that variable exist locally first by looking backward
                    for(let i = this.current.localCount - 1; i >= 0 ; i--) {
                        let local = this.current.locals[i];
                        if (local.depth !== -1 && local.depth < this.current.scopeDepth) {
                            break;
                        }

                        if (local.name === identifierName){
                            this.parser.error("Already a variable with this name in this scope.");
                        }
                    }

                    //define the variable without existences
                    this.addLocal(identifierName);

                    //markInitialized
                    this.current.locals[ this.current.localCount - 1 ].depth = this.current.scopeDepth;

                } else {
                    //defineVariable
                    this.emitBytes(OpCode.OP_DEFINE_GLOBAL, identifierConstantIndex);
                }

            } while (this.parser.match(TokenType.TOKEN_COMMA));
            //reverse the order the parameters are stored because of the order arguments are stored in the stack as last items are at the top
        }
    }

    funDeclaration(){
        //consume the identifier
        this.parser.consume(TokenType.TOKEN_IDENTIFIER, 'Expect function name.');
        const identifierName = this.parser.previous.payload;
        let identifierConstantIndex = this.identifierConstant(identifierName);
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
                    this.parser.error("Already a variable with this name in this scope.");
                }
            }
            //define the variable without existences
            this.addLocal(identifierName);

            //markInitialized
            this.current.locals[ this.current.localCount - 1 ].depth = this.current.scopeDepth;
        }
        //TODO GC Local
        // start to compile function body
        let firstLocal = {
            name: '',
            depth: 0,
            isCaptured: false,
        };
        //TODO GC Closure
        let closure = {
            arity: 0,
            locals: [firstLocal], //only compile locals
            code: [],
            lines: [],
            constants: [],
            ip: 0,
            enclosing: this.current,
            compileType: CompileType.CLOSURE,
            type: ValueType.CLOSURE,
            name: identifierName,
            scopeDepth: 0,
            localCount: 1,
            upvalueCount: 0,
            upvalues: [],

            frameUpvalues: {}, //for VM upvalues,
        };

        this.current = closure; // set the new compiler for this function

        this.beginScope(); // no end scope

        //change the current with a new Compiler block

        this.parser.consume(TokenType.TOKEN_LEFT_PAREN, 'Expect "(" after function name.');
        //handles parameters, add each parameter to the locals object
        this.funParameters();
        this.parser.consume(TokenType.TOKEN_RIGHT_PAREN, 'Expect ")" after parameters.');
        this.parser.consume(TokenType.TOKEN_LEFT_BRACE, 'Expect "{" before function body.');
        this.block();

        //set back the last scope
        const newClosure = this.endCompiler();

        this.emitBytes(OpCode.OP_CLOSURE, newClosure);


        //capture upvalues
        for (let i = 0; i < newClosure.upvalueCount; i++) {
            this.emitByte(closure.upvalues[i].isLocal ? 1 : 0);
            this.emitByte(closure.upvalues[i].index);
        }

        //define global variable at the end
        if (this.current.scopeDepth === 0){
            this.emitBytes(OpCode.OP_DEFINE_GLOBAL, identifierConstantIndex);
        }
    };

    method(){
        this.parser.consume(TokenType.TOKEN_IDENTIFIER, 'Expect method name.');
        const identifierName = this.parser.previous.payload;
        const identifierConstantIndex = this.identifierConstant(identifierName);

        //TODO GC Local
        // start to compile function body
        let firstLocal = {
            name: 'this',
            depth: 0,
            isCaptured: false,
        };

        //TODO GC Closure
        // compile the function body as a method
        let closure = {
            arity: 0,
            locals: [firstLocal], //only compile locals
            code: [],
            lines: [],
            constants: [],
            ip: 0,
            enclosing: this.current,
            compileType: CompileType.METHOD,
            type: ValueType.METHOD,
            name: identifierName,
            scopeDepth: 0,
            localCount: 1,
            upvalueCount: 0,
            upvalues: [],

            frameUpvalues: {}, //for VM upvalues,
        };

        //check if the method is an init
        if (identifierName === 'init'){
            closure.type = ValueType.INITIALIZER;
        }

        this.current = closure; // set the new compiler for this function

        this.beginScope();
        //change the current with a new Compiler block

        this.parser.consume(TokenType.TOKEN_LEFT_PAREN, 'Expect "(" after function name.');
        //handles parameters, add each parameter to the locals object
        this.funParameters();
        this.parser.consume(TokenType.TOKEN_RIGHT_PAREN, 'Expect ")" after parameters.');
        this.parser.consume(TokenType.TOKEN_LEFT_BRACE, 'Expect "{" before function body.');
        this.block();

        //set back the last scope
        const newClosure = this.endCompiler();

        this.emitBytes(OpCode.OP_CLOSURE, newClosure);

        //capture upvalues
        for (let i = 0; i < newClosure.upvalueCount; i++) {
            this.emitByte(closure.upvalues[i].isLocal ? 1 : 0);
            this.emitByte(closure.upvalues[i].index);
        }

        //the binding of methods happens at runtime
        this.emitBytes(OpCode.OP_METHOD, identifierConstantIndex);

    }

    classDeclaration(){
        this.parser.consume (TokenType.TOKEN_IDENTIFIER , "Expect class name." );
        const classIdentifier = this.parser.previous.payload;
        let classConstantIndex = this.identifierConstant(classIdentifier);

        //TODO GC Klass object
        let klass = {
            name: classIdentifier,
            type: ValueType.CLASS,
            methods: {},
            super: null,
        };

        this.emitBytes ( OpCode.OP_CLASS , klass );

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
                    this.parser.error("Already a variable with this name in this scope.");
                }
            }

            //define the variable without existences
            this.addLocal(classIdentifier);

            //markInitialized
            this.current.locals[ this.current.localCount - 1 ].depth = this.current.scopeDepth;

        } else {
            //defineVariable
            this.emitBytes(OpCode.OP_DEFINE_GLOBAL, classConstantIndex);
        }

        //TODO GC CompilerClass
        //handle methods
        const compilerClass = {
            enclosing: this.currentClass,
            hasSuperClass: false,
        };

        this.currentClass = compilerClass;

        //check for inheritance
        if (this.parser.match(TokenType.TOKEN_LESS)){
            this.parser.consume(TokenType.TOKEN_IDENTIFIER, 'Expect superclass name.');
            const superClassIdentifier = this.parser.previous.payload;
            //namedVariable check where the identifier is
            this.identifier(false);

            //check that the class and superclass are different
            if (classIdentifier === superClassIdentifier){
                this.parser.error("A class can't inherit from itself.");
            }

            this.beginScope();
            this.addLocal("super");
            //markInitialized
            this.current.locals[ this.current.localCount - 1 ].depth = this.current.scopeDepth;

            //namedVariable
            this.namedVariable(classIdentifier, false);

            this.emitByte(OpCode.OP_INHERIT);
            this.currentClass.hasSuperClass = true;
        }

        this.namedVariable(classIdentifier, false);

        this.parser.consume ( TokenType.TOKEN_LEFT_BRACE , "Expect '{' before class body." );

        while(!this.parser.check(TokenType.TOKEN_RIGHT_BRACE) && !this.parser.check(TokenType.TOKEN_EOF)){
            this.method();
        }

        this.parser.consume ( TokenType.TOKEN_RIGHT_BRACE , "Expect '}' after class body." );

        this.emitByte(OpCode.OP_POP);

        if (this.currentClass.hasSuperClass){
            this.endScope();
        }

        this.currentClass = this.currentClass.enclosing;
    }

    expression(){
        this.parsePrecedence(Precedence.PREC_ASSIGNMENT);
    }

    printStatement(){
        this.expression();
        this.parser.consume(TokenType.TOKEN_SEMICOLON, 'Expect ";" after value.');
        this.emitByte(OpCode.OP_PRINT);
    }

    breakStatement(){
        this.parser.consume(TokenType.TOKEN_SEMICOLON, 'Expect ";" after break.');

    }

    forStatement(){
        //Note, no braces within the for statement
        this.beginScope();

        this.parser.consume(TokenType.TOKEN_LEFT_PAREN, 'Expect "(" after "for".');

        //for initializer
        if (this.parser.match(TokenType.TOKEN_SEMICOLON)){
            //No initializer.
        } else if (this.parser.match(TokenType.TOKEN_VAR)){
            this.varDeclaration();
        } else {
            this.expressionStatement();
        }

        //
        let loopStart = this.current.code.length;

        let exitJump = -1;

        // for exit condition
        if (!this.parser.match(TokenType.TOKEN_SEMICOLON)){
            this.expression();
            this.parser.consume(TokenType.TOKEN_SEMICOLON, 'Expect ";" after loop condition.');

            // Jump out of the loop if the condition is false.
            exitJump = this.emitJump(OpCode.OP_JUMP_IF_FALSE);
            this.emitByte(OpCode.OP_POP); //condition
        }


        // for increment
        if (!this.parser.match(TokenType.TOKEN_RIGHT_PAREN)){
            const bodyJump = this.emitJump(OpCode.OP_JUMP);
            const incrementStart = this.current.code.length;
            this.expression();
            this.emitByte(OpCode.OP_POP);
            this.parser.consume(TokenType.TOKEN_RIGHT_PAREN, 'Expect ")" after for clauses.');

            this.emitLoop(loopStart);
            loopStart = incrementStart;
            this.patchJump(bodyJump);
        }

        // all the statements in for
        this.statement();
        this.emitLoop(loopStart);

        //exit jump
        if (exitJump !== -1){
            this.patchJump(exitJump);
            this.emitByte(OpCode.OP_POP);
        }
        this.endScope();
    }
    ifStatement(){
        this.parser.consume(TokenType.TOKEN_LEFT_PAREN, "Expect '(' after 'if'.");
        this.expression();
        this.parser.consume(TokenType.TOKEN_RIGHT_PAREN, "Expect ')' after condition."); // [paren]

        let thenJump = this.emitJump(OpCode.OP_JUMP_IF_FALSE);
        // pop-then
        this.emitByte(OpCode.OP_POP);
        //pop-then
        this.statement();

        // jump-over-else
        let elseJump = this.emitJump(OpCode.OP_JUMP);

        // jump-over-else
        this.patchJump(thenJump);

        // pop-end
        this.emitByte(OpCode.OP_POP);
        // pop-end
        // compile-else

        if (this.parser.match(TokenType.TOKEN_ELSE)) this.statement();
        // compile-else
        //patch-else
        this.patchJump(elseJump);
    }
    returnStatement(){
        if (this.current.name === '<script>'){
            this.parser.error("Can't return from top-level code.");
        }

        if(this.parser.match(TokenType.TOKEN_SEMICOLON)){
            this.emitReturn();
        } else {

            if (this.current.type === ValueType.INITIALIZER) {
                this.parser.error("Can't return a value from an initializer.");
            }

            this.expression();
            this.parser.consume(TokenType.TOKEN_SEMICOLON, 'Expect ";" after return value.');
            this.emitByte(OpCode.OP_RETURN);
        }
    }
    whileStatement(){
        //start the while loop
        const loopStart = this.current.code.length;
        //check the condition
        this.parser.consume(TokenType.TOKEN_LEFT_PAREN, 'Expect "(" after "while".');
        this.expression();
        this.parser.consume(TokenType.TOKEN_RIGHT_PAREN, 'Expect ")" after condition.');

        const exitJump = this.emitJump(OpCode.OP_JUMP_IF_FALSE);
        this.emitByte(OpCode.OP_POP);

        //execute the statement inside the loop
        this.statement();

        this.emitLoop(loopStart);

        this.patchJump(exitJump);
        this.emitByte(OpCode.OP_POP);
    }

    switchStatement(){
        const MAX_CASES = 256;
        this.parser.consume(TokenType.TOKEN_LEFT_PAREN, 'Expect "(" after "switch".');
        this.expression(); //push the switch value on the stack
        this.parser.consume(TokenType.TOKEN_RIGHT_PAREN, 'Expect ")" after value.');
        this.parser.consume(TokenType.TOKEN_LEFT_BRACE, 'Expect "{" before switch cases.');

        let state = 0;  //
        let caseEnds = [];
        let caseCount = 0; //the total number of cases
        let previousCaseSkip = -1;

        //we are still in the switch statement
        while (!this.parser.match(TokenType.TOKEN_RIGHT_BRACE) && !this.parser.check(TokenType.TOKEN_EOF)) {

            //parse the case or default
            if (this.parser.match(TokenType.TOKEN_CASE) || this.parser.match(TokenType.TOKEN_DEFAULT)) {
                let caseType = this.parser.previous.type;

                if (state === 2) {
                    this.parser.error("Can't have another case or default after the default case");
                }

                if (state === 1) {
                    //At the end of the previous case, jump over the others. tidy up last case
                    caseEnds[caseCount++] = this.emitJump(OpCode.OP_JUMP);

                    //Patch its condition to jump to the next case (this one).

                    this.patchJump(previousCaseSkip);
                    this.emitByte(OpCode.OP_POP);
                }

                if (caseType === TokenType.TOKEN_CASE) {
                    state = 1;

                    //See if the case is equal to the value.
                    this.emitByte(OpCode.OP_DUP);
                    this.expression();

                    this.parser.consume(TokenType.TOKEN_COLON, "Expect ':' after case value.");

                    this.emitByte(OpCode.OP_EQUAL);
                    previousCaseSkip = this.emitJump(OpCode.OP_JUMP_IF_FALSE);

                    // Pop the comparison result TODO?? look at this pop.
                    this.emitByte(OpCode.OP_POP);
                } else {
                    state = 2;
                    this.parser.consume(TokenType.TOKEN_COLON, "Expect ':' after default.");
                    previousCaseSkip = -1;
                }
            } else {
                //Otherwise, it's a statement inside the current case or default.
                if (state === 0) {
                    this.parser.error("Can't have statements before any case");
                }
                this.statement();
            }
        }

        // If we ended without a default case, patch its condition jump.
        if (state === 1){
            this.patchJump(previousCaseSkip);
            this.emitByte(OpCode.OP_POP);
        }

        //Patch all the case jumps to the end.
        for(let i = 0; i < caseCount; i++){
            this.patchJump(caseEnds[i]);
        }

        this.emitByte(OpCode.OP_POP); // pop the switch value

    }

    expressionStatement(){
        this.expression();
        this.parser.consume(TokenType.TOKEN_SEMICOLON, "Expect ';' after expression.");
        this.emitByte(OpCode.OP_POP);
    }

    beginScope(){
        this.current.scopeDepth++;
    }
    block (){
        while(!this.parser.check(TokenType.TOKEN_RIGHT_BRACE) && !this.parser.check(TokenType.TOKEN_EOF)){
            this.declaration();
        }
        this.parser.consume(TokenType.TOKEN_RIGHT_BRACE, 'Expect "}" after block.');
    };
    endScope(){
        this.current.scopeDepth--;
        //remove all the locals from the stack
        while( this.current.localCount > 0 &&
            this.current.locals[this.current.localCount - 1].depth >
            this.current.scopeDepth){

            if (this.current.locals[this.current.localCount - 1].isCaptured){
                this.emitByte(OpCode.OP_CLOSE_UPVALUE)
            } else {
                this.emitByte(OpCode.OP_POP);
            }

            this.current.localCount--;
        }
    }

    statement(){
        if (this.parser.match(TokenType.TOKEN_PRINT)) {
            this.printStatement();
        } else if (this.parser.match(TokenType.TOKEN_BREAK)){
            this.breakStatement();
        }else if (this.parser.match(TokenType.TOKEN_FOR)){
            this.forStatement();
        } else if (this.parser.match(TokenType.TOKEN_IF)){
            this.ifStatement();
        } else if (this.parser.match(TokenType.TOKEN_RETURN)){
            this.returnStatement();
        } else if (this.parser.match(TokenType.TOKEN_WHILE)){
            this.whileStatement();
        } else if (this.parser.match(TokenType.TOKEN_SWITCH)){
           this.switchStatement();
        } else if (this.parser.match(TokenType.TOKEN_LEFT_BRACE)){
            //for block statements
            this.beginScope();
            this.block();
            this.endScope();
        } else {
            this.expressionStatement();
        }
    }
    declaration(){
        if (this.parser.match(TokenType.TOKEN_CLASS)){
            this.classDeclaration();
        } else if (this.parser.match(TokenType.TOKEN_FUN)){
            this.funDeclaration();
        } else if (this.parser.match(TokenType.TOKEN_VAR)) {
            this.varDeclaration();
        } else {
            this.statement();
        }
        if (this.parser.panicMode) this.synchronize();
    };

    endCompiler(){
        //return to the outer function
        this.emitReturn();
        let closure = this.current; //return the function object
        // set the enclosing function to be this function, essentially pop this function off the stack
        this.current = this.current.enclosing;

        return closure;
    };
    //endregion

    compile() {
        this.parser.hadError = false;
        this.parser.panicMode = false;

        this.parser.advance();

        while (!this.parser.match(TokenType.TOKEN_EOF)){
            //each declaration is in charge of advancing the next token.
            this.declaration();
        }
        const closure = this.endCompiler();

        return this.parser.hadError ? null : closure;
    }
}