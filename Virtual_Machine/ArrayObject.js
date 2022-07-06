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

    //there
    if (values.length > 0 && values[0] < 0){
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
            length: values[0],
        },//for instance field
        static: {}, // for static
        super: null,
    };


    const arrayInstance = {
        type: ValueType.OBJECT,
        klass: arrayKlass,
        fields: arrayKlass.fields,
        elements: Array(values[0])
    };

    return arrayInstance;
}


export default ArrayObject;