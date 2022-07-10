import TokenType from "../Types/TokenType.js";
import synchronize from "./synchronize.js";

import statement from "../Statements/statement.js";
import classDeclaration from "./classDeclaration.js";
import funDeclaration from "./funDeclaration.js";
import varDeclaration from "./varDeclaration.js";
import exportDeclaration from "./exportDeclaration.js";
import importDeclaration from "./importDeclaration.js";

const declaration = (env) => {
    const {parser} = env;
    if (parser.match(TokenType.TOKEN_CLASS)){
        classDeclaration(env);
    } else if (parser.match(TokenType.TOKEN_FUN)){
        funDeclaration(env);
    } else if (parser.match(TokenType.TOKEN_VAR)) {
        varDeclaration(env);
    } else if (parser.match(TokenType.TOKEN_EXPORT)){
        exportDeclaration(env);
    } else if (parser.match(TokenType.TOKEN_IMPORT)){
        importDeclaration(env);
    } else {
        statement(env);
    }
    if (parser.panicMode) synchronize(env);
};

export default declaration;