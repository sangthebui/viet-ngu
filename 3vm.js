import Compiler, { OpCode } from './2compile.js';

import Value, {ValueType} from "./Value.js";

const print = console.log;

const InterpretResult  = Object.freeze({
    INTERPRET_OK: Symbol('INTERPRET_OK'),
    INTERPRET_COMPILE_ERROR: Symbol('INTERPRET_COMPILE_ERROR'),
    INTERPRET_RUNTIME_ERROR: Symbol('INTERPRET_RUNTIME_ERROR'),
});

const FRAMES_MAX = 256;

const newInstance = (klass) => {
    return {
        type: ValueType.OBJECT,
        klass,
        fields: {},
    };
};


const printValue = (value) => {
    switch(value.type){
        case ValueType.PRIMITIVE:
            print(value.value);
            break;
        case ValueType.CLOSURE:
            print(value.name);
            break;
        case ValueType.CLASS:
            print(value.name);
            break;
        case ValueType.OBJECT:
            print(`instance of ${value.klass.name}`);
            break;
        default:

    }
};


export default class VM {
    stack = []; // the array stack of Values
    globals = {}; // list of globals variables during runtime
    frames = []; // list of call frames
    frameCount = 0;

    constructor(){

    }

    push(value){
        this.stack.push(value);
    }

    pop() {
        return this.stack.pop();
    };

    peek(distance) {
        //look at the top of the stack
        const dist = this.stack.length - 1 - distance;
        return this.stack[dist];
    }

    runtimeError(message){
        print(message);
    }

    callValue(callee, argCount){

        if (!callee) {
            this.runtimeError('Can only call functions and classes');
            return false;
        }

        //check for class
        if (callee.type === ValueType.CLASS){
           const instance =  newInstance(callee);
           //push onto the stack before all the arguments
            const position = this.stack.length - 1 - argCount;
            this.stack[position - argCount] = instance; //put the object after the class before the arguments
            // this.stack = [...this.stack.slice(0, position), instance, ...this.stack.slice(position)];
            //where on the stack?


            // callee.method.slots["this"] = callee.receiver;

            let initializer = callee.methods['init'];

            if (initializer !== undefined && initializer !== null){
                //binding this to each method
                initializer.slots['this'] = instance;
                return this.call(initializer, argCount);

            } else if (argCount !== 0){
                this.runtimeError(`Expected 0 arguments but got ${argCount}`);
                return false;
            }

            return true;
        } else if (callee.type === ValueType.BOUND_METHOD) {
            //binding this to each method
            callee.method.slots["this"] = callee.receiver;

            return this.call(callee.method, argCount);

        } else if (callee.type === ValueType.CLOSURE){
            //we are calling function
            return this.call(callee, argCount);
        }


        return false;
    }

    call(closure, argCount){
        if (argCount !== closure.arity){
            this.runtimeError('Expected same number of arguments.');
            return false;
        }

        //probably need to handle the max frame size ourselves
        if (this.frames.length === FRAMES_MAX){
            this.runtimeError('Stack Overflow.');
            return false;
        }


        // bind the arguments values to the parameters
        //I know the location of the name of the local
        // in relation to the items being push on to the stack.
        const params = this.stack.slice(this.stack.length - argCount);

        for (let i = 0; i < params.length; i++){
            const position = i + 1;
            const key = closure.locals[position].name;
            closure.slots[key] = params[i];
            this.pop();
        }

        if (closure.type === ValueType.CLOSURE || closure.type === ValueType.METHOD){
            closure.ip = 0; //reset the frame IP when it gets call multiple times.

        }


        //convert the call frames stack to a push and pop action
        this.frames.push(closure);
        this.frameCount++;

        return true;
    }

    bindMethod(klass, name){
        if (!klass.methods[name]){
            this.runtimeError(`Undefined property in ${klass.name}`);
            return false;
        }

        const receiver = this.peek(0);

        const boundMethod = {
            type: ValueType.BOUND_METHOD, //TODO add an extra parameter for typ
            receiver,
            method: klass.methods[name],
        };

        this.pop(); //pop the instance off the stack and push the method
        this.push(boundMethod);

        return true;
    }


    invokeFromClass(klass, methodName, argCount){
        let method = klass.methods[methodName];
        if (method === undefined || method === null){
            this.runtimeError(`Undefined property ${methodName}`);
            return false;
        }


        return this.call(method, argCount);
    }

    invoke(methodName, argCount){
        const instance = this.peek(argCount);

        //check the fields before the method
        let field = instance.fields[methodName];
        if (field !== undefined && field !== null){
            // this.stack = field
            return this.callValue(field, argCount);
        }

        //TODO check if it is an instance
        let method = instance.klass.methods[methodName];
        if (method === undefined || method === null){
            this.runtimeError(`Undefined property ${methodName}`);
            return false;
        }
        //bind instance to this
        method.slots['this'] = instance;
        //bind super to the super of the class
        method.slots['super'] = instance.klass.super;
        return this.call(method, argCount);

        // return this.invokeFromClass(instance.klass, methodName, argCount);
    }

    run(){
        let frame = this.frames[this.frameCount - 1];

        function read_constant(){
            const constantIndex = read_byte();
            return frame.constants[constantIndex];
        }

        function read_string(){
            const constant = read_constant();
            return constant.value;
        }

        function read_byte(){
            return frame.code[frame.ip++];
        }

        while(true){
            const instruction = read_byte();

            switch (instruction) {
                case OpCode.OP_CONSTANT: {
                    const constant = read_constant();
                    this.push(constant);
                    break;
                }
                case OpCode.OP_NIL: this.push(null); break;
                case OpCode.OP_TRUE: this.push(true); break;
                case OpCode.OP_FALSE: this.push(false); break;
                case OpCode.OP_POP: this.pop(); break;
                case OpCode.OP_ADD: {
                    const b = this.pop();
                    const a = this.pop();

                    const c = new Value(a.value + b.value);
                    this.push(c);
                    break;
                }

                case OpCode.OP_SET_PROPERTY: {
                    let instance = this.peek(1);
                    let field = read_string();
                    instance.fields[field] = this.peek(0);
                    // let value = this.pop();
                    this.pop();
                    // this.push(value);
                    break;
                }

                case OpCode.OP_GET_PROPERTY: {
                    let instance = this.peek(0);
                    //TODO check it is an instance
                    let name = read_string();

                    //check if the field exists
                    if (instance.fields[name]) {
                        let value = instance.fields[name];

                        this.pop();// instance
                        this.push(value);
                        break;//we handle the fields
                    }

                    if (!this.bindMethod(instance.klass, name)){
                        return this.runtimeError(`Cannot bind ${name} to ${instance.name}`);
                    }
                    break;
                }

                case OpCode.OP_GET_LOCAL: {
                    //stack effect = - 1
                    const key = read_string();
                    this.push(frame.slots[key]);
                    break;
                }
                case OpCode.OP_SET_LOCAL: {
                    //stack effect = 0
                    const key = read_string();
                    const value = this.pop();
                    frame.slots[key] = value;
                    break;
                }
                case OpCode.OP_DEFINE_GLOBAL: {
                    const key = read_string();
                    const value = this.pop();
                    this.globals[key] = value;
                    break;
                }
                case OpCode.OP_SET_GLOBAL: {
                    const key = read_string();
                    const value = this.pop();
                    this.globals[key] = value;
                    break;
                }
                case OpCode.OP_GET_GLOBAL: {
                    const key = read_string();
                    const value = this.globals[key];
                    this.push(value);
                    break;
                }
                case OpCode.OP_GET_UPVALUE: {
                    const identifierName = read_string();
                    //we need to find the original value location
                    let enclosing = frame.enclosing;
                    if (enclosing === null) {
                        //error
                    }

                    //special case of this
                    if (identifierName === 'this'){

                    }

                    do {
                        let temp = enclosing.slots[identifierName];
                        if (temp !== undefined ){
                            break;
                        }

                        enclosing = enclosing.enclosing;
                    } while (enclosing !== null);

                    frame.frameUpvalues[identifierName] = enclosing.slots[identifierName];
                    this.push(frame.frameUpvalues[identifierName]);
                    break;
                }
                case OpCode.OP_SET_UPVALUE: {
                    const key = read_string(); //"tmp"
                    const value = this.peek(0); // "I am changed inside function";
                    //find the upvalue location

                    frame.frameUpvalues[key] = value;
                    break;
                }
                case OpCode.OP_PRINT: {
                    const value = this.pop();
                    printValue(value);
                    break;
                }
                case OpCode.OP_BEGIN_BLOCK: {

                    //probably need to handle the max frame size ourselves
                    if (this.frames.length === FRAMES_MAX){
                        this.runtimeError('Stack Overflow.');
                        return false;
                    }

                    const block = read_byte();
                    block.locals.forEach(local => {
                        block.slots[local.name] = null;
                    });

                    this.frames.push(block);
                    this.frameCount++;

                    frame = this.frames[this.frameCount - 1];
                    break;
                }
                case OpCode.OP_END_BLOCK: {
                    this.frameCount--;
                    this.frames.pop();
                    frame = this.frames[this.frameCount -1];//go back to the previous frame.
                    break;
                }
                case OpCode.OP_CALL: {
                    const argCount = read_byte();
                    const callee = this.peek(argCount);
                    // const callee = value.value;
                    if (!this.callValue(callee, argCount)){
                        return InterpretResult.INTERPRET_RUNTIME_ERROR;
                    }


                    frame = this.frames[this.frameCount - 1];
                    break;
                }
                case OpCode.OP_CLOSURE: {
                    //This is for upvalues, we haven't got here yet
                    // const closureName = this.pop();
                    const closure = read_byte();
                    //this is only declaration
                    this.push(closure);

                    break;
                }
                case OpCode.OP_INVOKE: {
                    const methodName = read_string();
                    const argCount = read_byte(); //read
                    if (!this.invoke(methodName, argCount)){
                        return InterpretResult.INTERPRET_RUNTIME_ERROR;
                    }
                    // this.pop();//
                    frame = this.frames[this.frameCount -1];//go back to the previous frame.
                    break;
                }
                case OpCode.OP_RETURN:{
                    const value = this.pop();
                    this.frameCount--;
                    this.frames.pop();
                    //checking to see if we are at the end of the "script function"
                    if (this.frameCount === 0){
                        this.pop();
                        return InterpretResult.INTERPRET_OK;
                        //this works.
                    }

                    this.push(value);

                    frame = this.frames[this.frameCount -1];//go back to the previous frame.
                    break;
                }

                case OpCode.OP_CLASS: {
                    const klass = read_byte();
                    this.push(klass);
                    break;
                }
                case OpCode.OP_METHOD: {
                    const methodName = read_string();
                    const method = this.peek(0);
                    const klass = this.peek(1);
                    klass.methods[methodName] = method;
                    this.pop();

                    break;
                }

                case OpCode.OP_INHERIT: {
                    const klass = this.pop();
                    //TODO check if valid superClass

                    let superClass = this.pop();
                    //add all the superclass methods to subclass
                    klass.methods = {...klass.methods, ...superClass.methods};
                    klass.super = superClass;

                    break;
                }

                case OpCode.OP_GET_SUPER: {
                    const name = read_string();
                    const superClass = this.pop();

                    if (!this.bindMethod(superClass, name)){
                        return InterpretResult.INTERPRET_RUNTIME_ERROR;
                    }
                    break;
                }

                case OpCode.OP_SUPER_INVOKE: {
                    const method = read_string();
                    const argCount = read_byte();
                    const superClass = this.pop();
                    if (!this.invokeFromClass(superClass, method, argCount)){
                        return InterpretResult.INTERPRET_RUNTIME_ERROR;
                    }

                    frame = this.frames[this.frameCount -1];//go back to the previous frame.
                    break;
                }

                default:
                    print('Unknown instruction: ' + instruction);
                    return InterpretResult.INTERPRET_RUNTIME_ERROR;
            }

        } //end while


        return InterpretResult.INTERPRET_OK;
    }

    interpret(source) {
        const compiler = new Compiler(source);
        let closure = compiler.compile();

        if (closure === null){
            return InterpretResult.INTERPRET_COMPILE_ERROR;
        }

        //get their globals list of declare variables
        // this.globals = compiler.globals;

        //TODO let not worry about runtime for now. Just compiling only.

        // let upValues = [];
        // for (let i = 0; i < closure.upvalueCount; i++){
        //     upValues[i] = null;
        // }

        //calling the top level script function.
        this.push(closure);
        this.call(closure, 0);
        //
        //
        return this.run(); //calls the first CallFrame and begins to execute its code.
    };
}
