import stack from "../Stack.js";
import {ObjectLox, ValueType} from "../../Objects.js";
import InterpretResult from "../InterpretResult.js";

const valuesEqual = (aValue, bValue) => {
    //handles number and boolean separately because they are raw values
    if (ObjectLox.isNumber(aValue) && ObjectLox.isNumber(bValue)){
        return aValue === bValue;
    } else if (ObjectLox.isBoolean(aValue) && ObjectLox.isBoolean(bValue)){
        return aValue === bValue;
    } else if (aValue === null && bValue === null) {
        return true;
    } else {
        if (aValue.type !== bValue.type) return false;
        switch(aValue.type){
            case ValueType.STRING:
                return aValue.value === bValue.value;
            default:
                return false;
        }
    }
}
const opEqual = (_) => {
    const b = stack.pop();
    const a = stack.pop();
    //TODO GC Value
    const c = valuesEqual(a, b);
    stack.push(c);
    return InterpretResult.NEXT_INSTRUCTION;
}

export default opEqual;