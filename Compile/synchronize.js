import TokenType from "./TokenType.js";
import parser from "./Parser.js";

const synchronize = () => {
    if (parser.previous.type === TokenType.TOKEN_SEMICOLON) return;
    switch (parser.current.type) {
        case TokenType.TOKEN_CLASS:
        case TokenType.TOKEN_FUN:
        case TokenType.TOKEN_VAR:
        case TokenType.TOKEN_FOR:
        case TokenType.TOKEN_IF:
        case TokenType.TOKEN_WHILE:
        case TokenType.TOKEN_PRINT:
        case TokenType.TOKEN_RETURN:
            return;

        default:
            ; // Do nothing.
    }

    parser.advance();
}

export default synchronize;