import parser from "../Objects/Parser.js";
import TokenType from "../Types/TokenType.js";

import blockStatement from "./blockStatement.js";
import expressionStatement from "./expressionStatement.js";
import whileStatement from "./whileStatement.js";
import returnStatement from "./returnStatement.js";
import ifStatement from "./ifStatement.js";
import printStatement from "./printStatement.js";
import forStatement from "./forStatement.js";
import switchStatement from "./switchStatement.js";
import breakStatement from "./breakStatement.js";

const statement = (env) =>{
    const {current} = env;
    if (parser.match(TokenType.TOKEN_PRINT)) {
        printStatement(env);
    } else if (parser.match(TokenType.TOKEN_BREAK)){
        breakStatement(env);
    }else if (parser.match(TokenType.TOKEN_FOR)){
        forStatement(env);
    } else if (parser.match(TokenType.TOKEN_IF)){
        ifStatement(env);
    } else if (parser.match(TokenType.TOKEN_RETURN)){
        returnStatement(env);
    } else if (parser.match(TokenType.TOKEN_WHILE)){
        whileStatement(env);
    } else if (parser.match(TokenType.TOKEN_SWITCH)){
        switchStatement(env);
    } else if (parser.match(TokenType.TOKEN_LEFT_BRACE)){
        //for block statements
        current.beginScope();
        blockStatement(env);
        current.endScope();
    } else {
        expressionStatement(env);
    }
}

export default statement;