import stack from "../Stack.js";
import InterpretResult from "../InterpretResult.js";
import CallableType from "../../Compile/Types/CallableType.js";

const opInherit = () => {
    let superClass = stack.peek(1);
    const subClass = stack.peek(0);
    if (superClass.type !== CallableType.CLASS) {
        this.runtimeError("Superclass must be a class.");
        return InterpretResult.INTERPRET_RUNTIME_ERROR;
    }
    //add all the superclass methods to subclass
    //TODO GC methods object
    subClass.methods = {...subClass.methods, ...superClass.methods};
    stack.pop();
    return InterpretResult.NEXT_INSTRUCTION;
}

export default opInherit;