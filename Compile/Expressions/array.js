import argumentList from "./argumentList.js";
import ArrayObject from "../../Virtual_Machine/ArrayObject.js";
import OpCode from "../Types/OpCode.js";
import parser from "../Objects/Parser.js";
import TokenType from "../Types/TokenType.js";
import expression from "./expression.js";
import namedVariable from "./namedVariable.js";

// OP_GET_GLOBAL, 1, push onto the stack the Array
// OP_CONSTANT, OP_CONSTANT
// OP_CALL, argCount

const MAX_ARRAY_ELEMENT = 4294967295;
export const arrayParameters = (env) =>{
    let argCount = 0;
    if (!parser.check(TokenType.TOKEN_RIGHT_BRACKET)){
        do {
            expression(env);
            if (argCount === MAX_ARRAY_ELEMENT){
                parser.error("Can't have more than 4,294,967,295 elements.");
            }
            argCount++;
        } while (parser.match(TokenType.TOKEN_COMMA));
    }
    parser.consume(TokenType.TOKEN_RIGHT_BRACKET, 'Expect "]" after array expression.');
    return argCount;
}

const array = (_, env) => {
    const {current} = env;
    namedVariable("Array", false, env);
    let argCount = arrayParameters(env);
    current.closure.emitBytes(OpCode.OP_CALL, argCount);
}

export default array;