import parser from "../Objects/Parser.js";
import namedVariable from "./namedVariable.js";

const identifier = (canAssign, env) =>{
    let identifierName = parser.previous.payload;
    namedVariable(identifierName, canAssign, env);
}

export default identifier;