import parser from "../Parser.js";
import TokenType from "../TokenType.js";

import declaration from "../Declarations/declaration.js";

const blockStatement =  (env) =>{
    while(!parser.check(TokenType.TOKEN_RIGHT_BRACE) &&
        !parser.check(TokenType.TOKEN_EOF)){
        declaration(env);
    }
    parser.consume(TokenType.TOKEN_RIGHT_BRACE, 'Expect "}" after block.');
};

export default blockStatement;