import stack from "../Stack.js";
import InterpretResult from "../InterpretResult.js";
import {ObjectLox, ValueType} from "../../Objects.js";

const opNil = (_) => {
    stack.push(new ObjectLox(null, ValueType.NIL));
    return InterpretResult.NEXT_INSTRUCTION;
}

export default opNil;