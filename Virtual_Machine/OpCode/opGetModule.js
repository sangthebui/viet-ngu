import InterpretResult from "../InterpretResult.js";

const opGetModule = (env) => {
    const {frame} = env;
    const key = frame.read_byte();
    const value = env.modules[key];

    //set to the global
    env.globals[key]  = value;

    return InterpretResult.NEXT_INSTRUCTION;
}

export default opGetModule;