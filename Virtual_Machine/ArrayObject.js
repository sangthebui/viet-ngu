import {ValueType} from "../Objects.js";
import CallableType from "../Compile/Types/CallableType.js";
import Callable from "../Compile/Objects/Callable.js";
import OpCode from "../Compile/Types/OpCode.js";
import runtimeError from "./runtimeError.js";

//create set method
let set = new Callable();
set.name = "set";
set.type = CallableType.METHOD;
set.arity = 2;

set.code.push(OpCode.OP_SET_ELEMENT);
set.code.push(OpCode.OP_NIL);
set.code.push(OpCode.OP_RETURN);

//create get method
let get = new Callable();
get.name = "get";
get.type = CallableType.METHOD;
get.arity = 1;
get.code.push(OpCode.OP_GET_ELEMENT);
get.code.push(OpCode.OP_RETURN);

//TODO add error handling index of range error
const ArrayObject = (argCount, values) => {
    let length = 0;
    let elements = null;
    //we have 2 constructors:
    if (argCount === 0){
        // we have empty array
        length = 0;
        elements = Array(0);
    } else if (argCount > 0){
        //we have elements of the
        length = values.length;
        elements = [...values];
    } else {
        runtimeError("Can not create an array of negative length.");
    }


    let arrayKlass = {
        name: 'Array',
        type: CallableType.CLASS,
        methods: {
            set,
            get,
        },
        fields: {
            length: length,
        },//for instance field
        static: {}, // for static
        super: null,
    };


    const arrayInstance = {
        type: ValueType.OBJECT,
        klass: arrayKlass,
        fields: arrayKlass.fields,
        elements: elements
    };

    return arrayInstance;
}


export default ArrayObject;