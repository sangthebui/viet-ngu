import {newClosure} from "../../Objects.js";
import stack from "../Stack.js";
import InterpretResult from "../InterpretResult.js";


const captureUpvalue = (local, env) => {
    let prevUpvalue = null;
    let upvalue = env.openUpvalues;

    while(upvalue !== null && upvalue.location > local){
        prevUpvalue = upvalue;
        upvalue = upvalue.next;
    }

    if (upvalue !== null && upvalue.location === local){
        return upvalue;
    }
    //TODO GC openUpvalue
    let createdUpvalue =  {
        location: local,
        next: upvalue, // createdUpvalue.next = upvalue;
        isCaptured: false,
    };
    // createdUpvalue.next = ;

    if (prevUpvalue === null){
        env.openUpvalues = createdUpvalue;
    } else {
        prevUpvalue.next = createdUpvalue;
    }

    return createdUpvalue;
}

const opClosure = (env) => {
    const {frame} = env;
    //TODO GC Closure
    let closure = newClosure(frame.read_byte()); //create a new closure
    //capture the upvalues
    //isLocal means that the upvalues is a local value
    //otherwise, it is in an upvalue already

    //index refers to which index the upvalues is
    for ( let i = 0; i < closure.upvalueCount; i++) {
        let isLocal = frame.read_byte();
        let index = frame.read_byte();
        if ( isLocal ) {
            let local = frame.stackSlot + index;

            closure.frameUpvalues[i] = captureUpvalue(local, env);
        } else {
            closure.frameUpvalues[i] = frame.closure.frameUpvalues[index];
        }
    }
    stack.push(closure);
    return InterpretResult.NEXT_INSTRUCTION;
}

export default opClosure;