import CompilerS from './2compile.js';
import InterpretResult from "./Virtual_Machine/InterpretResult.js";
import CallableType from "./Compile/Types/CallableType.js";
import stack from "./Virtual_Machine/Stack.js";
import call from "./Virtual_Machine/call.js";
import opCodeObj from "./Virtual_Machine/OpCode";
import runtimeError from "./Virtual_Machine/runtimeError.js";


//Memory management: stacks, globals, frame.closure (same as compiler.closure), frame.closure.frameUpvalues,
//compiler.closure

export default class VM {
    env = {
        globals: {}, // list of globals variables during runtime
        frames: [], // list of call frames
        frameCount: 0,
        openUpvalues: null,
        frame: null,
    }

    constructor() {
        this.defineNative('clock', this.clockNative);
    }

    defineNative(name, closure){
        this.env.globals[name] = {
            type: CallableType.NATIVE_FUNCTION,
            closure
        };
    }

    clockNative(argCount, value){
        //wrap the clock value inside an ObjectLox
        return new Date() / 1000;
    }

    run(){
        this.env.frame = this.env.frames[this.env.frameCount - 1];
        let result = InterpretResult.NEXT_INSTRUCTION;
        while(result === InterpretResult.NEXT_INSTRUCTION){
            const instruction = this.env.frame.read_byte();
            if (instruction === undefined){
                runtimeError("Unknown instruction:");
                return InterpretResult.INTERPRET_RUNTIME_ERROR;
            }
            const opCodeFunction = opCodeObj[instruction];
            result = opCodeFunction(this.env);
        } //end while

        return result;
    }

    interpret(source) {
        const compiler = new CompilerS(source);
        let closure = compiler.compile();

        if (closure === null || closure === undefined){
            return InterpretResult.INTERPRET_COMPILE_ERROR;
        }

        //calling the top level script function.
        stack.push(closure);
        call(closure, 0, this.env);
        //
        return this.run(); //calls the first CallFrame and begins to execute its code.
    };
}
