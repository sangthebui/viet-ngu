import TokenType from "../Types/TokenType.js";
import OpCode from "../Types/OpCode.js";
import namedVariable from "../Expressions/namedVariable.js";

//Only accepts one kind of export.
//export <identifier> and its value
const exportDeclaration = (env) => {
    const {current, parser} = env;
    parser.consume(TokenType.TOKEN_IDENTIFIER, 'Expect identifier.');

    const identifierName = parser.previous.payload;
    namedVariable(identifierName, false, env); //get the value of the identifier on the stack
    //create a new global identifier
    current.closure.emitBytes(OpCode.OP_SET_MODULE, identifierName);

    parser.consume(TokenType.TOKEN_SEMICOLON, 'Expect semicolon after export declaration.');

}

export default exportDeclaration;