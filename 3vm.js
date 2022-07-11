import Compiler from './2Compiler.js';
import InterpretResult from "./Virtual_Machine/InterpretResult.js";
import CallableType from "./Compile/Types/CallableType.js";
import stack from "./Virtual_Machine/Stack.js";
import call from "./Virtual_Machine/call.js";
import opCodeObj from "./Virtual_Machine/OpCode/index.js";
import runtimeError from "./Virtual_Machine/runtimeError.js";
import ArrayObject from "./Virtual_Machine/ArrayObject.js";


//Memory management: stacks, globals, frame.closure (same as compiler.closure), frame.closure.frameUpvalues,
//compiler.closure
let env = {
    globals: {}, // list of globals variables during runtime
    modules: {}, // for all modules
    frames: [], // list of call frames
    frameCount: 0,
    openUpvalues: null,
    frame: null,
};


const defineNative = (env, name, closure) =>{
    env.globals[name] = {
        type: CallableType.NATIVE_FUNCTION,
        closure
    };
}

const clockNative = (argCount, value) =>{
    //wrap the clock value inside an ObjectLox
    return new Date() / 1000;
};



export const initEnv = () => {
    //reset the env
    const env = {
        globals: {}, // list of globals variables during runtime
        modules: {}, // for all modules
        frames: [], // list of call frames
        frameCount: 0,
        openUpvalues: null,
        frame: null,
    };
    defineNative(env, 'clock', clockNative);
    // defineNative(env, 'Array', ArrayObject);
    defineNative(env, 'Mang', ArrayObject);

    return env;
}

const run = (env) => {
    env.frame = env.frames[env.frameCount - 1];
    let result = InterpretResult.NEXT_INSTRUCTION;
    while(result === InterpretResult.NEXT_INSTRUCTION){
        const instruction = env.frame.read_byte();
        if (instruction === undefined){
            runtimeError("Unknown instruction:");
            return InterpretResult.INTERPRET_RUNTIME_ERROR;
        }
        const opCodeFunction = opCodeObj[instruction];
        result = opCodeFunction(env);
    } //end while

    return result;
}

//
export const interpretModule = (source) => {
    let moduleEnv = initEnv();
    moduleEnv.name = "moduleEnv"
    const compiler = new Compiler(source);
    let closure = compiler.compile();

    if (closure === null || closure === undefined){
        return InterpretResult.INTERPRET_COMPILE_ERROR;
    }

    //calling the top level script function.
    stack.push(closure);
    call(closure, 0, moduleEnv);
    //
    if( run(moduleEnv) === InterpretResult.INTERPRET_OK){
        //only get the module
        env.modules = {...env.modules, ...moduleEnv.modules};
    } else {
        //TODO report error
    }
}

export const interpret = (source) => {
    env = initEnv();
    const compiler = new Compiler(source);
    let closure = compiler.compile();

    if (closure === null || closure === undefined){
        return InterpretResult.INTERPRET_COMPILE_ERROR;
    }

    //calling the top level script function.
    stack.push(closure);
    call(closure, 0, env);
    //
    return run(env); //calls the first CallFrame and begins to execute its code.
};
