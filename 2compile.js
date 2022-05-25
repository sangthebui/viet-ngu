
import Scanner, { TokenType } from "./1scanner.js";

import Value, { ValueType } from './Value.js';


let print = console.log;


export const CompileType = Object.freeze({
    BLOCK: Symbol('BLOCK'),
    CLOSURE: Symbol('CLOSURE'),
    METHOD: Symbol('METHOD'),
    FOR_STATEMENT: Symbol('FOR_STATEMENT'),
    WHILE_STATEMENT: Symbol('WHILE_STATEMENT'),
});

export const OpCode = Object.freeze({
    OP_CONSTANT: Symbol('OP_CONSTANT'),
    OP_NIL: Symbol('OP_NIL'),
    OP_TRUE: Symbol('OP_TRUE'),
    OP_FALSE: Symbol( 'OP_FALSE'),
    OP_POP: Symbol( 'OP_POP'),
    OP_GET_LOCAL: Symbol( 'OP_GET_LOCAL'),
    OP_SET_LOCAL: Symbol( 'OP_SET_LOCAL'),
    OP_GET_PARAMETER: Symbol('OP_GET_PARAMETER'),
    OP_SET_PARAMETER:Symbol('OP_SET_PARAMETER'),
    OP_DEFINE_GLOBAL: Symbol('OP_DEFINE_GLOBAL'),
    OP_SET_GLOBAL: Symbol('OP_SET_GLOBAL'),
    OP_GET_GLOBAL: Symbol('OP_GET_GLOBAL'),
    OP_GET_UPVALUE: Symbol( 'OP_GET_UPVALUE'),
    OP_SET_UPVALUE: Symbol( 'OP_SET_UPVALUE'),
    OP_GET_PROPERTY: Symbol('OP_GET_PROPERTY'),
    OP_SET_PROPERTY: Symbol( 'OP_SET_PROPERTY'),
    OP_EQUAL: Symbol( 'OP_EQUAL'),
    OP_GET_SUPER: Symbol( 'OP_GET_SUPER'),
    OP_GREATER: Symbol( 'OP_GREATER'),
    OP_LESS: Symbol( 'OP_LESS'),
    OP_ADD: Symbol( 'OP_ADD'),
    OP_SUBTRACT: Symbol( 'OP_SUBTRACT'),
    OP_MULTIPLY: Symbol( 'OP_MULTIPLY'),
    OP_DIVIDE: Symbol( 'OP_DIVIDE'),
    OP_NOT: Symbol( 'OP_NOT'),
    OP_NEGATE: Symbol( 'OP_NEGATE'),
    OP_PRINT: Symbol( 'OP_PRINT'),
    OP_JUMP: Symbol( 'OP_JUMP'),
    OP_JUMP_IF_FALSE: Symbol('OP_JUMP_IF_FALSE'),
    OP_LOOP: Symbol( 'OP_LOOP'),
    OP_CALL: Symbol( 'OP_CALL'),
    OP_INVOKE: Symbol('OP_INVOKE'),
    OP_SUPER_INVOKE: Symbol( 'OP_SUPER_INVOKE'),
    OP_CLOSURE: Symbol( 'OP_CLOSURE'),
    OP_RETURN: Symbol( 'OP_RETURN'),
    OP_CLASS: Symbol( 'OP_CLASS'),
    OP_INHERIT: Symbol( 'OP_INHERIT'),
    OP_METHOD: Symbol( 'OP_METHOD'),
    OP_EMPTY: Symbol( 'OP_EMPTY'),
    OP_DEFINE_VAR: Symbol('OP_DEFINE_VAR'),
    OP_BEGIN_BLOCK: Symbol('OP_BEGIN_BLOCK'),
    OP_END_BLOCK: Symbol('OP_END_BLOCK'),

});

export const Precedence = Object.freeze({
    PREC_NONE:  0, //literals and nulls
    PREC_ASSIGNMENT: 1,  // =
    PREC_OR: 2,          // or
    PREC_AND: 3,         // and
    PREC_EQUALITY: 4,    // == !=
    PREC_COMPARISON:  5,  // < > <= >=
    PREC_TERM: 6,        // + -
    PREC_FACTOR: 7,      // * /
    PREC_UNARY:  8,       // ! -
    PREC_CALL: 9,        // . ()
    PREC_PRIMARY: 10,
});

const MAX_LOCAL = 100000000;
const MAX_CONSTANTS = MAX_LOCAL;


const closure = {
    arity: 0,
    locals: [], //for compiler
    parameters: [],
    code: [],
    lines: [],
    constants: [],
    ip: 0,
    enclosing: null,
    compileType: CompileType.CLOSURE,
    type: ValueType.CLOSURE,
    name: '',
    frameUpvalues: {}, //for VM
};

const klass = {
    name: '',
    type: ValueType.CLASS,
    methods: {},
    super: null,
};

const ClassCompiler = {
    enclosing: null,
};

export default class Compiler {
    //the current parser
    parser = {
        current: null,
        previous: null,
        hadError: false,
        panicMode: false,
    };
    // the scanner that is doing the parsing
    scanner = null;
    allTokens = [];

    current = closure;

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
    };

    constructor(source){
        this.scanner = new Scanner(source);
        //starts out with the top level function
        this.current = {
            arity: 0,
            locals: [], //only compile locals
            code: [],
            lines: [],
            constants: [],
            ip: 0,
            enclosing: null,
            compileType: CompileType.CLOSURE,
            type: ValueType.CLOSURE,
            name: '<script>',
            frameUpvalues: {}, //for VM upvalues,
            slots:{}, // for VM locals

        };

    }

    //region error handling and parsing stuff
    // chunk manipulation and emitting bytecode
    errorAtCurrent(message){
        print(message);
    };

    advance(){
        this.parser.previous = this.parser.current;

        for (;;) {
            this.parser.current = this.scanner.scanToken();
            //TODO remove debug later.
            this.allTokens.push(this.parser.current);
            if (this.parser.current.type !== TokenType.TOKEN_ERROR) break;

            this.errorAtCurrent(this.parser.current.payload);
        }
    };

    consume(type, message){
        if (this.parser.current.type === type) {
            this.advance();
            return;
        }
        this.errorAtCurrent(message);
    };

    check(type){
        return this.parser.current.type === type;
    };

    match(type) {
        if (!this.check(type)) return false;
        this.advance();
        return true;
    };

    addConstant(value){
        let count = this.current.constants.push(value);
        const index = count - 1;
        return index;
    }

    identifierConstant(identifierName){
        return this.addConstant(new Value(identifierName));
    }

    writeChunk(byteCode, line){
        this.current.code.push(byteCode);
        this.current.lines.push(line);
    };

    emitByte (opcode) {
        //TODO think about how to emit Opcode for just transpiling
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
        if (this.current.type !== ValueType.INITIALIZER){
        //     this.emitByte(OpCode.OP_PUSH_THIS);
        // } else {
            this.emitByte(OpCode.OP_NIL);
        }
        this.emitByte(OpCode.OP_RETURN);
    };

    parsePrecedence(precedence){
        //consume the first token
        this.advance();

        //always a prefixRule
        const prefixRule = this.rules[this.parser.previous.type].prefix;
        if (prefixRule === null){
            this.errorAtCurrent('Expect expression.');
            return;
        }
        //only consume the equal if the expression is lower than the assignment
        const canAssign = precedence <= Precedence.PREC_ASSIGNMENT;
        prefixRule(canAssign);

        //parse anything that has less precedence than the current operator
        while(precedence <= this.rules[this.parser.current.type].precedence){
            this.advance();

            const infixRule = this.rules[this.parser.previous.type].infix;
            infixRule(canAssign);
        }

        if (canAssign && this.match(TokenType.TOKEN_EQUAL)){
            this.errorAtCurrent('Invalid assignment target.');
        }
    }
    //endregion

    //region all parsing functions only
    //When the user get or set an identifier
    resolveLocal(compiler, identifierName){
        for (let i = 0; i < compiler.locals.length; i ++){
            if (compiler.locals[i].name === identifierName) {
                return i;
            }
        }

        return -1;
    }

    identifier(canAssign){
        // this.namedVariable(this.parser.previous.payload, canAssign);
        let identifierName = this.parser.previous.payload;
        let identifierConstantIndex = this.identifierConstant(identifierName);

        //check where the identifier is
        let getOp, setOp;

        //the arg is the location inside the locals array
        let key = this.resolveLocal(this.current, identifierName);

        if (key !== -1) {
            //look for local variables inside this block
            getOp = OpCode.OP_GET_LOCAL;
            setOp = OpCode.OP_SET_LOCAL;

        } else if ( this.current.name === '<script>'){
            //we are at the global
            getOp = OpCode.OP_GET_GLOBAL;
            setOp = OpCode.OP_SET_GLOBAL;
        }
        else {
            getOp = OpCode.OP_GET_UPVALUE;
            setOp = OpCode.OP_SET_UPVALUE;
        }

        if (canAssign && this.match(TokenType.TOKEN_EQUAL)){
            this.expression();
            this.emitBytes(setOp, identifierConstantIndex);
        } else {
            this.emitBytes(getOp, identifierConstantIndex);
        }

    }

    varDeclaration(){
        //Declaring a variable only adds it to the local scope.
        const errorMessage = 'Expect variable name.';
        this.consume(TokenType.TOKEN_IDENTIFIER, errorMessage);
        const identifierName = this.parser.previous.payload;
        let identifierConstantIndex = this.identifierConstant(identifierName);

        //check where we are

        if (this.current.name === "<script>"){

            //compile the initializer, either there is an expression or there is none
            //and we set it to NIL
            if(this.match(TokenType.TOKEN_EQUAL)){
                //this will put a value on the stack, then at the end,
                // an OpCode will determine where that variable will live.
                this.expression();
            } else {
                //if there is no value, we set the variable to nil
                this.emitByte(OpCode.OP_NIL);
            }
            //we are at global scope.
            this.emitBytes(OpCode.OP_DEFINE_GLOBAL, identifierConstantIndex);

            // this.emitBytes(OpCode.OP_SET_GLOBAL, identifierConstantIndex);

        } else {
            //we are at the local scope.
            //we are not at the top level, define it locally
            //TODO check to see if that variable exist locally first

            //define the variable without existences
            this.current.locals.push({
                name: identifierName,
            });

            //compile the initializer, either there is an expression or there is none
            //and we set it to NIL
            if(this.match(TokenType.TOKEN_EQUAL)){
                //this will put a value on the stack, then at the end,
                // an OpCode will determine where that variable will live.
                this.expression();
            } else {
                //if there is no value, we set the variable to nil
                this.emitByte(OpCode.OP_NIL);
            }

            this.emitBytes(OpCode.OP_SET_LOCAL, identifierConstantIndex);

        }

        this.consume(TokenType.TOKEN_SEMICOLON, 'Expect ";" after variable declaration.');
    }

    number(){
        //payload is always a string
        const num = parseInt(this.parser.previous.payload);
        this.emitConstant(new Value(num));
    }
    string(){
        this.emitConstant( new Value(this.parser.previous.payload));
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

    this_(){

        if (this.currentClass === null){
            this.errorAtCurrent("can't use 'this' outside of a class.");
            return;
        }

        const identifierName = this.parser.previous.payload;
        let identifierConstantIndex = this.identifierConstant(identifierName);

        //namedVariable check where the identifier is
        let getOp;

        //the arg is the location inside the locals array
        let key = this.resolveLocal(this.current, identifierName);

        if (key !== -1) {
            //look for local variables inside this block
            getOp = OpCode.OP_GET_LOCAL;

        }
        else {
            getOp = OpCode.OP_GET_UPVALUE;
        }
        this.emitBytes(getOp, identifierConstantIndex);
    }

    super_(){
        if (this.currentClass === null){
            this.errorAtCurrent("can't user 'super' outside of a class.");
        } else if (!this.currentClass.hasSuperClass){
            this.errorAtCurrent("Can't use 'super' in a class with no superclass.");
        }
        this.consume(TokenType.TOKEN_DOT , "Expect '.' after 'super'." );
        this.consume(TokenType.TOKEN_IDENTIFIER , "Expect superclass method name." );
        let identifierName = this.parser.previous.payload;
        let identifierConstantIndex = this.identifierConstant(identifierName);


        //find 'this' and push it onto the stack
        let getOp;
        //TODO missing upvalue
        if ( this.current.name === '<script>'){
            //we are at the global
            getOp = OpCode.OP_GET_GLOBAL;
        } else {
            getOp = OpCode.OP_GET_LOCAL;
        }

        let thisConstantIndex = this.identifierConstant('this');

        this.emitBytes(getOp, thisConstantIndex);

        if (this.match(TokenType.TOKEN_LEFT_PAREN)){
            //combine OP_GET_SUPER and OP_CALL
            //parameterList()
            let argCount = 0;
            if (!this.check(TokenType.TOKEN_RIGHT_PAREN)){
                do {
                    this.expression();
                    if (argCount === 255){
                        this.errorAtCurrent("Can't have more than 255 arguments.");
                    }
                    argCount++;
                } while (this.match(TokenType.TOKEN_COMMA));
            }
            this.consume(TokenType.TOKEN_RIGHT_PAREN, 'Expect ")" after arguments.');
            //end parameterList()

            //find 'super' and push it onto the stack
            let superConstantIndex = this.identifierConstant('super');

            //TODO missing upvalue
            if ( this.current.name === '<script>'){
                //we are at the global
                this.emitBytes(OpCode.OP_GET_GLOBAL, superConstantIndex);

            } else {
                this.emitBytes(OpCode.OP_GET_LOCAL, superConstantIndex);
            }

            //3 bytes
            this.emitBytes(OpCode.OP_SUPER_INVOKE, identifierConstantIndex);
            this.emitByte(argCount);

        } else {
            //find 'super' and push it onto the stack
            let superConstantIndex = this.identifierConstant('super');

            //TODO missing upvalue
            if ( this.current.name === '<script>'){
                //we are at the global
                this.emitBytes(OpCode.OP_GET_GLOBAL, superConstantIndex);

            } else {
                this.emitBytes(OpCode.OP_GET_LOCAL, superConstantIndex);
            }

            //push the name of the method that gets call
            this.emitBytes(OpCode.OP_GET_SUPER, identifierConstantIndex);
        }

    }

    call(){
        //all the values to the argument are on the stack
        let argCount = 0;
        if (!this.check(TokenType.TOKEN_RIGHT_PAREN)){
            do {
                this.expression();
                if (argCount === 255){
                    this.errorAtCurrent("Can't have more than 255 arguments.");
                }
                argCount++;
            } while (this.match(TokenType.TOKEN_COMMA));
        }
        this.consume(TokenType.TOKEN_RIGHT_PAREN, 'Expect ")" after arguments.');

        this.emitBytes(OpCode.OP_CALL, argCount);
    }

    funParameters(){
        if (!this.check(TokenType.TOKEN_RIGHT_PAREN)) {
            do {
                this.current.arity++;
                if (this.current.arity > 255) {
                    this.errorAtCurrent("Can't have more than 255 parameters.");
                    //TODO compile error
                }
                this.consume(TokenType.TOKEN_IDENTIFIER, "Expect parameter name.");
                // const parameterName = this.parser.previous.payload;
                let identifierName = this.parser.previous.payload;
                let identifierConstantIndex = this.identifierConstant(identifierName);

                if (this.current.name === '<script>'){
                    //we are at the global
                    this.emitBytes(OpCode.OP_DEFINE_GLOBAL, identifierConstantIndex);
                } else {
                    this.current.locals.push({
                        name: identifierName,
                    })
                }


            } while (this.match(TokenType.TOKEN_COMMA));
            //reverse the order the parameters are stored because of the order arguments are stored in the stack as last items are at the top
        }
    }

    funDeclaration(){
        //consume the identifier
        this.consume(TokenType.TOKEN_IDENTIFIER, 'Expect function name.');
        const identifierName = this.parser.previous.payload;
        let identifierConstantIndex = this.identifierConstant(identifierName);
        //check if the name has been created

        //determine where the variable lives
        if (this.current.name === '<script>'){
            //we are at the top level
            this.emitBytes(OpCode.OP_DEFINE_GLOBAL, identifierConstantIndex);
        } else {
            //we are at the local
            this.current.locals.push({
                name: identifierName
            });
        }



        let closure = {
            arity: 0,
            code: [],
            lines: [],
            constants: [],
            ip: 0,
            enclosing: this.current,
            compileType: CompileType.CLOSURE,
            type: ValueType.CLOSURE,
            name: identifierName,
            locals: [{name: identifierName}],
            frameUpvalues: {},
            slots:{},

        };

        this.current = closure; // set the new compiler for this function

        //change the current with a new Compiler block

        this.consume(TokenType.TOKEN_LEFT_PAREN, 'Expect "(" after function name.');
        //handles parameters, add each parameter to the locals object
        this.funParameters();
        this.consume(TokenType.TOKEN_RIGHT_PAREN, 'Expect ")" after parameters.');
        this.consume(TokenType.TOKEN_LEFT_BRACE, 'Expect "{" before function body.');
        this.block();

        //if there is no return, we add one
        //HACK!!! check if there is a return, if not, then add a empty one
        if (this.current.code[this.current.code.length - 1] !== OpCode.OP_RETURN){
            this.emitReturn();
        }
        //
        //set back the last scope
        this.current = this.current.enclosing;

        this.emitBytes(OpCode.OP_CLOSURE, closure);



        //set the closure where we could find them
        //we are at the local
        if (this.current.name === '<script>'){
            this.emitBytes(OpCode.OP_SET_GLOBAL, identifierConstantIndex);
        } else {
            this.emitBytes(OpCode.OP_SET_LOCAL, identifierConstantIndex);
        }
    };

    //TODO not done yet, had to go back and figure out upvalues
    method(){
        this.consume(TokenType.TOKEN_IDENTIFIER, 'Expect method name.');
        const identifierName = this.parser.previous.payload;
        const identifierConstantIndex = this.identifierConstant(identifierName);

        // compile the function body as a method
        let closure = {
            arity: 0,
            code: [],
            lines: [],
            constants: [],
            ip: 0,
            enclosing: this.current,
            compileType: CompileType.METHOD,
            type: ValueType.METHOD,
            name: identifierName,
            locals: [{name: 'this'}],
            frameUpvalues: {},
            slots:{},

        };

        //check if the method is an init
        if (identifierName === 'init'){
            closure.type = ValueType.INITIALIZER;
        }

        // this.current.locals.push({
        //     name: identifierName,
        // })

        this.current = closure; // set the new compiler for this function

        //change the current with a new Compiler block

        this.consume(TokenType.TOKEN_LEFT_PAREN, 'Expect "(" after function name.');
        //handles parameters, add each parameter to the locals object
        this.funParameters();
        this.consume(TokenType.TOKEN_RIGHT_PAREN, 'Expect ")" after parameters.');
        this.consume(TokenType.TOKEN_LEFT_BRACE, 'Expect "{" before function body.');
        this.block();

        //if there is no return, we add one
        //HACK!!! check if there is a return, if not, then add a empty one
        if (this.current.code[this.current.code.length - 1] !== OpCode.OP_RETURN){
            this.emitReturn();
        }
        //
        //set back the last scope
        this.current = this.current.enclosing;

        this.emitBytes(OpCode.OP_CLOSURE, closure);



        //the binding of methods happens at runtime
        this.emitBytes(OpCode.OP_METHOD, identifierConstantIndex);
    }

    //TODO not done yet, had to go back and figure out upvalues
    classDeclaration(){
        this.consume (TokenType.TOKEN_IDENTIFIER , "Expect class name." );
        const classIdentifier = this.parser.previous.payload;
        let classConstantIndex = this.identifierConstant(classIdentifier);


        let klass = {
            name: classIdentifier,
            type: ValueType.CLASS,
            methods: {},
            super: null,
        };

        this.emitBytes ( OpCode.OP_CLASS , klass );

        //determine where the variable lives
        if (this.current.name === '<script>'){
            //we are at the top level
            this.emitBytes(OpCode.OP_DEFINE_GLOBAL, classConstantIndex);
        } else {
            //we are at the local
            this.current.locals.push({
                name: classIdentifier
            });
        }


        //handle methods

        //namedVariable check where the identifier is
        let getOp;
        //TODO missing upvalue
        if ( this.current.name === '<script>'){
            //we are at the global
            getOp = OpCode.OP_GET_GLOBAL;
        } else {
            getOp = OpCode.OP_GET_LOCAL;
        }

        this.emitBytes(getOp, classConstantIndex);

        const compilerClass = {
            enclosing: this.currentClass,
            hasSuperClass: false,
        };

        this.currentClass = compilerClass;

        //check for inheritance
        if (this.match(TokenType.TOKEN_LESS)){
            this.consume(TokenType.TOKEN_IDENTIFIER, 'Expect superclass name.');
            //variable(false)//push the superclass name and push it onto the stack
            const superClassIdentifier = this.parser.previous.payload;
            let superClassConstantIndex = this.identifierConstant(superClassIdentifier);

            if ( this.current.name === '<script>'){
                //we are at the global
                this.emitBytes(OpCode.OP_GET_GLOBAL, superClassConstantIndex);
            } else {
                this.emitBytes(OpCode.OP_GET_LOCAL, superClassConstantIndex);
            }

            //check that the class and superclass are different
            if (classIdentifier === superClassIdentifier){
                this.errorAtCurrent("A class can't inherit from itself.");
            }

            //namedVariable(classname, false) //then load the subclass on the stack
            if ( this.current.name === '<script>'){
                //we are at the global
                this.emitBytes(OpCode.OP_GET_GLOBAL, classConstantIndex);
            } else {
                this.emitBytes(OpCode.OP_GET_LOCAL, classConstantIndex);
            }
            this.emitByte(OpCode.OP_INHERIT);
            this.currentClass.hasSuperClass = true;
        }


        this.consume ( TokenType.TOKEN_LEFT_BRACE , "Expect '{' before class body." );

        while(!this.check(TokenType.TOKEN_RIGHT_BRACE) && !this.check(TokenType.TOKEN_EOF)){
            this.method();
        }

        this.consume ( TokenType.TOKEN_RIGHT_BRACE , "Expect '}' after class body." );

        this.emitByte(OpCode.OP_POP);
        this.currentClass = this.currentClass.enclosing;
    }

    or_(){
    }

    and_(){
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
        this.consume(TokenType.TOKEN_RIGHT_PAREN, "Expect ')' after expression.");
    }

    dot(canAssign){
        this.consume(TokenType.TOKEN_IDENTIFIER, 'Expect property name after ".".');
        const identifierName = this.parser.previous.payload;
        let identifierConstantIndex = this.identifierConstant(identifierName);

        if (canAssign && this.match(TokenType.TOKEN_EQUAL)){
            this.expression();
            this.emitBytes(OpCode.OP_SET_PROPERTY, identifierConstantIndex);
        } else if (this.match(TokenType.TOKEN_LEFT_PAREN)){
            //combine OP_GET_PROPERTY and OP_CALL
            let argCount = 0;
            if (!this.check(TokenType.TOKEN_RIGHT_PAREN)){
                do {
                    this.expression();
                    if (argCount === 255){
                        this.errorAtCurrent("Can't have more than 255 arguments.");
                    }
                    argCount++;
                } while (this.match(TokenType.TOKEN_COMMA));
            }
            this.consume(TokenType.TOKEN_RIGHT_PAREN, 'Expect ")" after arguments.');

            //3 bytes
            this.emitBytes(OpCode.OP_INVOKE, identifierConstantIndex);
            this.emitByte(argCount);

        } else {
            this.emitBytes(OpCode.OP_GET_PROPERTY, identifierConstantIndex);
        }
    }

    expression(){
        this.parsePrecedence(Precedence.PREC_ASSIGNMENT);
    }

    printStatement(){
        this.expression();
        this.consume(TokenType.TOKEN_SEMICOLON, 'Expect ";" after value.');
        this.emitByte(OpCode.OP_PRINT);
    }

    expressionStatement(){
        this.expression();
        this.consume(TokenType.TOKEN_SEMICOLON, "Expect ';' after expression.");
        this.emitByte(OpCode.OP_POP);
    }

    returnStatement(){
        if (this.current.name === '<script>'){
            this.errorAtCurrent("Can't return from top-level code.");
        }

        if(this.match(TokenType.TOKEN_SEMICOLON)){
            this.emitReturn();
        } else {

            if (this.current.type === ValueType.INITIALIZER) {
                this.errorAtCurrent("Can't return a value from an initializer.");
            }

            this.expression();
            this.consume(TokenType.TOKEN_SEMICOLON, 'Expect ";" after return value.');
            this.emitByte(OpCode.OP_RETURN);
        }
    }

    beginBlockScope(){
        let block = {
            arity: 0,
            code: [],
            lines: [],
            constants: [],
            ip: 0,
            enclosing: this.current,
            compileType: CompileType.BLOCK,
            type: ValueType.BLOCK,
            name: 'block',
            locals: [],
            frameUpvalues: {},
            slots:{},

        };
        //the equivalent of a call for a block
        this.emitBytes(OpCode.OP_BEGIN_BLOCK, block);

        this.current = block;
    }

    endBlockScope(){
        //the equivalent of a return statement for block
        this.emitBytes(OpCode.OP_END_BLOCK);

        this.current = this.current.enclosing;
    }

    statement(){
        if (this.match(TokenType.TOKEN_PRINT)) {
            this.printStatement();
        } else if (this.match(TokenType.TOKEN_LEFT_BRACE)){
            //for block statements
            this.beginBlockScope();
            this.block();
            this.endBlockScope();

        } else if (this.match(TokenType.TOKEN_RETURN)){
            this.returnStatement();
        }
        else {
            this.expressionStatement();
        }
    }

    block (){
        while(!this.check(TokenType.TOKEN_RIGHT_BRACE) && !this.check(TokenType.TOKEN_EOF)){
            this.declaration();
        }
        this.consume(TokenType.TOKEN_RIGHT_BRACE, 'Expect "}" after block.');
    };

    declaration(){
        if (this.match(TokenType.TOKEN_CLASS)){
            this.classDeclaration();
        } else if (this.match(TokenType.TOKEN_FUN)){
            this.funDeclaration();
        } else if (this.match(TokenType.TOKEN_VAR)) {
            this.varDeclaration();
        } else {
            this.statement();
        }
        // if (this.parser.panicMode) synchronize();
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
        // this.parser.hadError = false;
        // this.parser.panicMode = false;

        this.advance();

        while (!this.match(TokenType.TOKEN_EOF)){
            //each declaration is in charge of advancing the next token.
            this.declaration();
        }
        const closure = this.endCompiler();

        // return this.parser.hadError ? null : closure;
        //should return the top level function.
        return closure;
    }
}