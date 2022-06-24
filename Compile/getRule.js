import TokenType from "./TokenType.js";
import Precedence from "./Precedence.js";

import number from "./number.js";
import string from "./string.js";
import unary from "./unary.js";
import binary from "./binary.js";
import or_ from "./or_.js";
import and_ from "./and_.js";
import literal from "./literal.js";
import grouping from "./grouping.js";
import dot from "./dot.js";
import this_ from "./this_.js";
import super_ from "./super_.js";
import call from "./call.js";
import identifier from "./identifier.js";

//{current, parser, canAssign}
const rules = {
    [ TokenType.TOKEN_LEFT_PAREN ]    : { prefix: grouping, infix: call, precedence: Precedence.PREC_CALL },
    [ TokenType.TOKEN_RIGHT_PAREN ]   : { prefix: null,  infix: null , precedence: Precedence.PREC_NONE },
    [ TokenType.TOKEN_LEFT_BRACE ]    : { prefix: null,  infix: null , precedence: Precedence.PREC_NONE },
    [ TokenType.TOKEN_RIGHT_BRACE ]   : { prefix: null,  infix: null , precedence: Precedence.PREC_NONE },
    [ TokenType.TOKEN_COMMA ]         : { prefix: null,  infix: null , precedence: Precedence.PREC_NONE },
    [ TokenType.TOKEN_DOT ]           : { prefix: null,  infix: dot , precedence: Precedence.PREC_CALL },
    [ TokenType.TOKEN_MINUS ]         : { prefix: unary, infix: binary, precedence: Precedence.PREC_TERM },
    [ TokenType.TOKEN_PLUS ]          : { prefix: null,  infix: binary , precedence: Precedence.PREC_TERM },
    [ TokenType.TOKEN_SEMICOLON ]     : { prefix: null,  infix: null , precedence: Precedence.PREC_NONE },
    [ TokenType.TOKEN_SLASH ]         : { prefix: null , infix: binary, precedence: Precedence.PREC_FACTOR },
    [ TokenType.TOKEN_STAR ]          : { prefix: null , infix: binary, precedence: Precedence.PREC_FACTOR },
    [ TokenType.TOKEN_BANG ]          : { prefix: unary, infix: null , precedence: Precedence.PREC_NONE },
    [ TokenType.TOKEN_BANG_EQUAL ]    : { prefix: null , infix: binary, precedence: Precedence.PREC_EQUALITY },
    [ TokenType.TOKEN_EQUAL ]         : { prefix: null , infix: null , precedence: Precedence.PREC_NONE },
    [ TokenType.TOKEN_EQUAL_EQUAL ]   : { prefix: null , infix: binary, precedence: Precedence.PREC_EQUALITY},
    [ TokenType.TOKEN_GREATER ]       : { prefix: null , infix: binary, precedence: Precedence.PREC_COMPARISON },
    [ TokenType.TOKEN_GREATER_EQUAL ] : { prefix: null , infix: binary, precedence: Precedence.PREC_COMPARISON },
    [ TokenType.TOKEN_LESS ]          : { prefix: null , infix: binary, precedence: Precedence.PREC_COMPARISON },
    [ TokenType.TOKEN_LESS_EQUAL ]    : { prefix: null , infix: binary, precedence: Precedence.PREC_COMPARISON },
    [ TokenType.TOKEN_IDENTIFIER ]    : { prefix: identifier, infix: null , precedence: Precedence.PREC_NONE },

    [ TokenType.TOKEN_STRING ]        : { prefix: string , infix: null , precedence: Precedence.PREC_NONE },
    [ TokenType.TOKEN_NUMBER ]        : { prefix: number, infix: null , precedence: Precedence.PREC_NONE },
    [ TokenType.TOKEN_AND ]           : { prefix: null , infix: and_ , precedence: Precedence.PREC_AND },
    [ TokenType.TOKEN_CLASS ]         : { prefix: null , infix: null , precedence: Precedence.PREC_NONE },
    [ TokenType.TOKEN_ELSE ]          : { prefix: null , infix: null , precedence: Precedence.PREC_NONE },
    [ TokenType.TOKEN_FALSE ]         : { prefix: literal,infix: null , precedence: Precedence.PREC_NONE },
    [ TokenType.TOKEN_FOR ]           : { prefix: null , infix: null , precedence: Precedence.PREC_NONE },
    [ TokenType.TOKEN_FUN ]           : { prefix: null , infix: null , precedence: Precedence.PREC_NONE },
    [ TokenType.TOKEN_IF ]            : { prefix: null , infix: null , precedence: Precedence.PREC_NONE },
    [ TokenType.TOKEN_NIL ]           : { prefix: literal, infix: null , precedence: Precedence.PREC_NONE },
    [ TokenType.TOKEN_OR ]            : { prefix: null , infix: or_ , precedence: Precedence.PREC_OR },
    [ TokenType.TOKEN_PRINT ]         : { prefix: null , infix: null , precedence: Precedence.PREC_NONE },
    [ TokenType.TOKEN_RETURN ]        : { prefix: null , infix: null , precedence: Precedence.PREC_NONE },
    [ TokenType.TOKEN_SUPER ]         : { prefix: super_ , infix: null , precedence: Precedence.PREC_NONE },
    [ TokenType.TOKEN_THIS ]          : { prefix: this_ , infix: null , precedence: Precedence.PREC_NONE },
    [ TokenType.TOKEN_TRUE ]          : { prefix: literal, infix: null , precedence: Precedence.PREC_NONE },
    [ TokenType.TOKEN_VAR ]           : { prefix: null , infix: null , precedence: Precedence.PREC_NONE },
    [ TokenType.TOKEN_WHILE ]         : { prefix: null , infix: null , precedence: Precedence.PREC_NONE },
    [ TokenType.TOKEN_ERROR ]         : { prefix: null , infix: null , precedence: Precedence.PREC_NONE },
    [ TokenType.TOKEN_EOF ]           : { prefix: null , infix: null , precedence: Precedence.PREC_NONE },
    [ TokenType.TOKEN_CASE ]          : { prefix: null , infix: null , precedence: Precedence.PREC_NONE },
    [ TokenType.TOKEN_COLON ]          : { prefix: null , infix: null , precedence: Precedence.PREC_NONE },
};

const getRule = (tokenType) => {
    return rules[tokenType];
}

export default getRule;
