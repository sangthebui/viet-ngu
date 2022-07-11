import {ValueType} from "./Objects.js";


const print = console.log;

export const printValue = (value) => {
    switch(value.type){
        case ValueType.NIL:
            print("nil");
            break;
        case ValueType.STRING:
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
        case ValueType.NATIVE_FUNCTION:
            print("<native fn>");
            break;
        case ValueType.METHOD:
        case ValueType.BOUND_METHOD:
            print("<fn method>");
            break;
        default:
            //for raw number, true, false
            print(value);
            break;

    }
};

export default print;