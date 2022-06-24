import TokenType from "./TokenType.js";
import parser from "./Parser.js";
import expression from "./expression.js";

const argumentList = (env) =>{
    let argCount = 0;
    if (!parser.check(TokenType.TOKEN_RIGHT_PAREN)){
        do {
            expression(env);
            if (argCount === 255){
                parser.error("Can't have more than 255 arguments.");
            }
            argCount++;
        } while (parser.match(TokenType.TOKEN_COMMA));
    }
    parser.consume(TokenType.TOKEN_RIGHT_PAREN, 'Expect ")" after arguments.');
    return argCount;
}

export default argumentList;