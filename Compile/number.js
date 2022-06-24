import parser from "./Parser.js";

const number = (_, env) =>{
    const { current} = env;
    //payload is always a string
    const num = parseInt(parser.previous.payload);
    current.closure.emitConstant(num);
}

export default  number;