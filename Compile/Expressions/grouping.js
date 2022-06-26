import TokenType from "../Types/TokenType.js";
import parser from "../Objects/Parser.js";
import expression from "./expression.js";

const grouping = (_, env) => {
    expression(env);
    parser.consume(TokenType.TOKEN_RIGHT_PAREN, "Expect ')' after expression.");
}

export default grouping;