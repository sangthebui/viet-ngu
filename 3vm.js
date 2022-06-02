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
let counter = 0;
const newClosure = (closure) => {
    const newClosure = {
        ...closure,
        frameUpvalues: {},
        id: counter,
    }
    counter++;
    return newClosure;
}

const UpValue = {
    location: new Value(10),
    next: null,
}


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
            print(value.value);
            break;

    }
};

 const openUpvalues = {
     location: 0,
     next: null,
 };

export default class VM {
    stack = []; // the array stack of Values
    globals = {}; // list of globals variables during runtime
    frames = []; // list of call frames
    frameCount = 0;
    currentFunctionStackLocation = 0;
    openUpvalues = null;

    push(value){
        return this.stack.push(value) - 1;
    }
    popN(n){
        for(let i = 0; i < n; i++){
            this.stack.pop();
        }
    }
    pop() {
        return this.stack.pop();
    };
    peek(distance) {
        //look at the top of the stack
        const dist = this.stack.length - 1 - distance;
        return this.stack[dist];
    }

    isFalsey(value){
        return Value.isNil(value) || (Value.isBoolean(value) && !value.value)
    }

    valuesEqual(aValue, bValue){
        if (aValue.type !== bValue.type) return false;
        switch(aValue.type){
            case ValueType.NIL: return true;
            case ValueType.BOOLEAN:
            case ValueType.NUMBER:
            case ValueType.STRING:
                return aValue.value === bValue.value;
            default:
                return false;
        }
    }

    runtimeError(message){
        print(message);
    }

    captureUpvalue(local){
        let prevUpvalue = null;
        let upvalue = this.openUpvalues;

        while(upvalue !== null && upvalue.location > local){
            prevUpvalue = upvalue;
            upvalue = upvalue.next;
        }

        if (upvalue !== null && upvalue.location === local){
            return upvalue;
        }

        let createdUpvalue =  {
            location: local,
            next: upvalue, // createdUpvalue.next = upvalue;
            isCaptured: false,
        };
        // createdUpvalue.next = ;

        if (prevUpvalue === null){
            this.openUpvalues = createdUpvalue;
        } else {
            prevUpvalue.next = createdUpvalue;
        }

        return createdUpvalue;
    }

    closeUpvalues(last){
        while (this.openUpvalues !== null && this.openUpvalues.location >= last) {
            let upvalue = this.openUpvalues;
            //capture the item on the stack
            let localFromStack = this.stack[upvalue.location];
            upvalue.location = localFromStack;
            this.openUpvalues = upvalue.next;
        }
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
            this.stack[position] = instance; //put the object after the class before the arguments

            let initializer = callee.methods['init'];

            if (initializer !== undefined && initializer !== null){
                //binding this to each method
                // initializer.slots['this'] = instance;
                return this.call(initializer, argCount);

            } else if (argCount !== 0){
                this.runtimeError(`Expected 0 arguments but got ${argCount}`);
                return false;
            }

            return true;
        } else if (callee.type === ValueType.BOUND_METHOD) {
            //binding this to each method
            let location = this.stack.length - argCount - 1;
            this.stack[location] = callee.receiver;

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

        if (instance.type !== ValueType.OBJECT){
            this.runtimeError("Only instances have methods.");
            return false;
        }

        let method = instance.klass.methods[methodName];
        if (method === undefined || method === null){
            this.runtimeError(`Undefined property ${methodName}`);
            return false;
        }
        return this.call(method, argCount);
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
                case OpCode.OP_NIL: {
                    this.push(new Value(null, ValueType.NIL));
                    break;
                }
                case OpCode.OP_TRUE: {
                    this.push(new Value(true, ValueType.BOOLEAN));
                    break;
                }
                case OpCode.OP_FALSE: {
                    this.push(new Value(false, ValueType.BOOLEAN));
                    break;
                }
                case OpCode.OP_POP: this.pop(); break;
                case OpCode.OP_GET_LOCAL: {
                    //stack effect = - 1
                    const key = read_byte();
                    const value = this.stack[key + this.currentFunctionStackLocation];
                    this.push(value);
                    break;
                }
                case OpCode.OP_SET_LOCAL: {
                    //stack effect = 0
                    let key = read_byte();

                    const value = this.peek(0);
                    this.stack[key + this.currentFunctionStackLocation] = value;
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
                    const slot = read_byte();
                    const upValue = frame.frameUpvalues[slot];
                    let value = new Value(0);
                    if (Number.isInteger(upValue.location)){
                        value = this.stack[upValue.location];
                    } else if (Value.isValue(upValue.location)){
                        value = upValue.location;
                    }
                    //
                    this.push(value);

                    break;
                }
                case OpCode.OP_SET_UPVALUE: {
                    const slot = read_byte();
                    const value = this.peek(0);
                    // const stackLocation = frame.frameUpvalues[slot].location
                    //find the upvalue location
                    // this.stack[stackLocation] = value;
                    frame.frameUpvalues[slot].location = value;
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
                case OpCode.OP_EQUAL: {
                    const b = this.pop();
                    const a = this.pop();
                    const c = new Value(this.valuesEqual(a, b), ValueType.BOOLEAN);
                    this.push(c);
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
                case OpCode.OP_GREATER: {
                    if (Value.isNumber(this.peek(0)) &&
                        Value.isNumber(this.peek(1))){
                        const a = this.pop();
                        const b = this.pop();
                        this.push(new Value(b.value > a.value, ValueType.NUMBER));                    } else {
                        this.runtimeError("Operands must be numbers.");
                        return InterpretResult.INTERPRET_RUNTIME_ERROR;
                    }
                    break;
                }
                case OpCode.OP_LESS: {
                    if (Value.isNumber(this.peek(0)) &&
                        Value.isNumber(this.peek(1))){
                        const a = this.pop();
                        const b = this.pop();
                        this.push(new Value(b.value < a.value, ValueType.NUMBER));
                    } else {
                        this.runtimeError("Operands must be numbers.");
                        return InterpretResult.INTERPRET_RUNTIME_ERROR;
                    }
                    break;
                }
                case OpCode.OP_ADD: {
                    if (Value.isString(this.peek(0)) &&
                        Value.isString(this.peek(1)) ){
                        const a = this.pop();
                        const b = this.pop();
                        this.push(new Value(b.value + a.value), ValueType.STRING);
                    } else if (Value.isNumber(this.peek(0)) &&
                        Value.isNumber(this.peek(1))){
                        this.push(new Value(this.pop().value + this.pop().value, ValueType.NUMBER));
                    } else {
                        this.runtimeError("Operands must be two numbers or two strings.");
                        return InterpretResult.INTERPRET_RUNTIME_ERROR;
                    }
                    break;
                }
                case OpCode.OP_SUBTRACT: {
                    if (Value.isNumber(this.peek(0)) &&
                        Value.isNumber(this.peek(1))){
                        const a = this.pop();
                        const b = this.pop();
                        this.push(new Value(b.value - a.value, ValueType.NUMBER));                    } else {
                        this.runtimeError("Operands must be numbers.");
                        return InterpretResult.INTERPRET_RUNTIME_ERROR;
                    }
                    break;
                }
                case OpCode.OP_MULTIPLY: {
                    if (Value.isNumber(this.peek(0)) &&
                        Value.isNumber(this.peek(1))){
                        this.push(new Value(this.pop().value * this.pop().value, ValueType.NUMBER));
                    } else {
                        this.runtimeError("Operands must be numbers.");
                        return InterpretResult.INTERPRET_RUNTIME_ERROR;
                    }
                    break;
                }
                case OpCode.OP_DIVIDE: {
                    if (Value.isNumber(this.peek(0)) &&
                        Value.isNumber(this.peek(1))){
                        const a = this.pop();
                        const b = this.pop();
                        this.push(new Value(b.value / a.value, ValueType.NUMBER));
                    } else {
                        this.runtimeError("Operands must be numbers.");
                        return InterpretResult.INTERPRET_RUNTIME_ERROR;
                    }
                    break;
                }
                case OpCode.OP_NOT: {
                    let temp = this.pop();
                    this.push(new Value(this.isFalsey(temp), ValueType.BOOLEAN));
                    break;
                }
                case OpCode.OP_NEGATE: {
                    let value = this.peek(0);
                    if (Value.isNumber(value.value)){
                        this.runtimeError("Operand must be a number.");
                        return InterpretResult.INTERPRET_RUNTIME_ERROR;
                    }
                    value = this.pop();
                    this.push(new Value(-value.value, ValueType.NUMBER));
                    break;
                }
                case OpCode.OP_PRINT: {
                    const value = this.pop();
                    printValue(value);
                    break;
                }
                case OpCode.OP_JUMP: {
                    const offset = read_byte();
                    frame.ip += offset;
                    break;
                }
                case OpCode.OP_JUMP_IF_FALSE: {
                    const offset = read_byte();
                    const value = this.peek(0);
                    if(this.isFalsey(value)) frame.ip += offset;
                    break;
                }
                case OpCode.OP_LOOP: {
                    const offset = read_byte();
                    frame.ip -= offset;
                    break;
                }
                case OpCode.OP_CALL: {
                    const argCount = read_byte();
                    const callee = this.peek(argCount);
                    // const callee = value.value;
                    if (!this.callValue(callee, argCount)){
                        return InterpretResult.INTERPRET_RUNTIME_ERROR;
                    }

                    this.currentFunctionStackLocation = this.stack.length - 1 - argCount;
                    frame = this.frames[this.frameCount - 1];
                    break;
                }
                case OpCode.OP_INVOKE: {
                    const methodName = read_string();
                    const argCount = read_byte(); //read
                    if (!this.invoke(methodName, argCount)){
                        return InterpretResult.INTERPRET_RUNTIME_ERROR;
                    }
                    frame = this.frames[this.frameCount -1];//go back to the previous frame.
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
                case OpCode.OP_CLOSURE: {
                    let closure = newClosure(read_byte()); //create a new closure
                    //capture the upvalues
                    //isLocal means that the upvalues is a local value
                    //otherwise, it is in an upvalue already

                    //index refers to which index the upvalues is
                    for ( let i = 0; i < closure.upvalueCount; i++) {
                        let isLocal = read_byte();
                        let index = read_byte();
                        if ( isLocal ) {
                            let local = this.currentFunctionStackLocation + index;
                            // const value = this.stack[local];

                            closure.frameUpvalues[i] = this.captureUpvalue(local);
                        } else {
                            closure.frameUpvalues[i] = frame.frameUpvalues[index];
                        }
                    }
                    this.push(closure);
                    break;
                }
                case OpCode.OP_CLOSE_UPVALUE: {
                    //TODO need to test out the block and break;
                    // this.closeUpvalues(vm.stackTop - 1);
                    const locationOfLocals = this.currentFunctionStackLocation + 1;
                    this.closeUpvalues(locationOfLocals);
                    this.pop();
                    break;
                }
                case OpCode.OP_RETURN:{
                    const value = this.pop();
                    //capture any necessary upvalues before the locals are discarded off the stack
                    // const last = this.stack.length - 1;
                    const locationOfLocals = this.currentFunctionStackLocation + 1;
                    this.closeUpvalues(locationOfLocals);
                    this.frameCount--;
                    this.frames.pop();
                    //checking to see if we are at the end of the "script function"
                    if (this.frameCount === 0){
                        this.pop();//pop the script (global) function
                        return InterpretResult.INTERPRET_OK;
                        //this works.
                    }

                    //remove the previous frame locals here
                    //argCount + locals;
                    this.popN(frame.locals.length);
                    this.push(value);

                    frame = this.frames[this.frameCount -1];//go back to the previous frame.
                    break;
                }
                case OpCode.OP_CLASS: {
                    const klass = read_byte();
                    this.push(klass);
                    break;
                }
                case OpCode.OP_INHERIT: {
                    let superClass = this.peek(1);
                    const subClass = this.peek(0);
                    //TODO check if valid superClass
                    if (superClass.type !== ValueType.CLASS) {
                        this.runtimeError("Superclass must be a class.");
                        return InterpretResult.INTERPRET_RUNTIME_ERROR;
                    }
                    //add all the superclass methods to subclass
                    subClass.methods = {...subClass.methods, ...superClass.methods};
                    this.pop();
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

        if (closure === null || closure === undefined){
            return InterpretResult.INTERPRET_COMPILE_ERROR;
        }

        //calling the top level script function.
        this.currentFunctionStackLocation = this.push(closure);
        this.call(closure, 0);
        //
        return this.run(); //calls the first CallFrame and begins to execute its code.
    };
}
