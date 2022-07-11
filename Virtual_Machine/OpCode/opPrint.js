import stack from "../Stack.js";
import {printValue} from "../../print.js";
import InterpretResult from "../InterpretResult.js";

const opPrint = () => {
    const value = stack.pop();
    printValue(value);
    return InterpretResult.NEXT_INSTRUCTION;
}

export default opPrint;