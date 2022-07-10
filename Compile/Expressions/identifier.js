import namedVariable from "./namedVariable.js";

const identifier = (canAssign, env) =>{
    const {parser} = env;
    let identifierName = parser.previous.payload;
    namedVariable(identifierName, canAssign, env);
}

export default identifier;