import TokenType from "../Types/TokenType.js";
import expression from "./expression.js";
import OpCode from "../Types/OpCode.js";

const subscript = (canAssign, env) => {
    //TODO might need to figure out if we could use an expression here
    // or just a number for the language.
    const {parser} = env;
    expression(env); //push the index on the stack

    parser.consume(TokenType.TOKEN_RIGHT_BRACKET, 'Expect "]" after array index.');

    if (parser.match(TokenType.TOKEN_EQUAL)){
        //setter
        expression(env); //the value to be set
        const identifierIndex = env.current.closure.identifierConstant("set");

        env.current.closure.emitBytes(OpCode.OP_INVOKE, identifierIndex);
        env.current.closure.emitByte(2); //array.set has 2 argCount
    } else {
        //getter
        const identifierIndex = env.current.closure.identifierConstant("get");

        env.current.closure.emitBytes(OpCode.OP_INVOKE, identifierIndex);
        env.current.closure.emitByte(1); //array.get has 1 argCount
    }
}

export default subscript;