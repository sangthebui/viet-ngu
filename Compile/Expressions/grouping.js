import TokenType from "../Types/TokenType.js";
import expression from "./expression.js";

const grouping = (_, env) => {
    const {parser} = env;
    expression(env);
    parser.consume(TokenType.TOKEN_RIGHT_PAREN, "Expect ')' after expression.");
}

export default grouping;