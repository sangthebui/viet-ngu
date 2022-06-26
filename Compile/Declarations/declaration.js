import TokenType from "../TokenType.js";
import parser from "../Parser.js";
import synchronize from "../synchronize.js";

import statement from "../Statements/statement.js";
import classDeclaration from "./classDeclaration.js";
import funDeclaration from "./funDeclaration.js";
import varDeclaration from "./varDeclaration.js";

const declaration = (env) => {
    if (parser.match(TokenType.TOKEN_CLASS)){
        classDeclaration(env);
    } else if (parser.match(TokenType.TOKEN_FUN)){
        funDeclaration(env);
    } else if (parser.match(TokenType.TOKEN_VAR)) {
        varDeclaration(env);
    } else {
        statement(env);
    }
    if (parser.panicMode) synchronize();
};

export default declaration;