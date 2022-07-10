import TokenType from "../Types/TokenType.js";

const synchronize = (env) => {
    const{parser} = env;
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