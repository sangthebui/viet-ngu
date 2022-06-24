import Precedence from "./Precedence.js";
import TokenType from "./TokenType.js";

import parser from "./Parser.js";

import getRule from "./getRule.js";

const parsePrecedence = (precedence, env) =>{
    parser.advance();

    //always a prefixRule
    let rule = getRule(parser.previous.type)
    const prefixRule = rule.prefix;
    if (prefixRule === null){
        parser.error('Expect expression.');
        return;
    }
    //only consume the equal if the expression is lower than the assignment
    const canAssign = precedence <= Precedence.PREC_ASSIGNMENT;
    prefixRule(canAssign, env);

    //parse anything that has less precedence than the current operator
    while(precedence <= getRule(parser.current.type).precedence){
        parser.advance();

        const infixRule = getRule(parser.previous.type).infix;
        infixRule(canAssign, env);
    }

    if (canAssign && parser.match(TokenType.TOKEN_EQUAL)){
        parser.error('Invalid assignment target.');
    }
}

export default parsePrecedence;