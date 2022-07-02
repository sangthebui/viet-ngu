const TokenType = Object.freeze({
    TOKEN_ERROR: Symbol("TOKEN_ERROR"),
    TOKEN_LEFT_PAREN: Symbol('TOKEN_LEFT_PAREN'),
    TOKEN_RIGHT_PAREN: Symbol('TOKEN_RIGHT_PAREN'),
    TOKEN_LEFT_BRACE: Symbol('TOKEN_LEFT_BRACE'),
    TOKEN_RIGHT_BRACE: Symbol('TOKEN_RIGHT_BRACE'),
    TOKEN_COMMA: Symbol('TOKEN_COMMA'),
    TOKEN_DOT: Symbol('TOKEN_DOT'),
    TOKEN_MINUS: Symbol('TOKEN_MINUS'),
    TOKEN_PLUS: Symbol('TOKEN_PLUS'),
    TOKEN_SEMICOLON: Symbol('TOKEN_SEMICOLON'),
    TOKEN_SLASH: Symbol('TOKEN_SLASH'),
    TOKEN_STAR: Symbol('TOKEN_STAR'),
    // One or two characer tokens.
    TOKEN_BANG: Symbol('TOKEN_BANG'),
    TOKEN_BANG_EQUAL: Symbol( 'TOKEN_BANG_EQUAL'),
    TOKEN_EQUAL: Symbol('TOKEN_EQUAL'),
    TOKEN_EQUAL_EQUAL: Symbol('TOKEN_EQUAL_EQUAL'),
    TOKEN_GREATER: Symbol('TOKEN_GREATER'),
    TOKEN_GREATER_EQUAL: Symbol('TOKEN_GREATER_EQUAL'),
    TOKEN_LESS: Symbol( 'TOKEN_LESS'),
    TOKEN_LESS_EQUAL: Symbol('TOKEN_LESS_EQUAL'),
    // Literals
    TOKEN_IDENTIFIER: Symbol( 'TOKEN_IDENTIFIER'),
    TOKEN_STRING: Symbol('TOKEN_STRING'),
    TOKEN_NUMBER: Symbol( 'TOKEN_NUMBER'),
    // Keywords.
    TOKEN_AND: Symbol('TOKEN_AND'),
    TOKEN_BREAK: Symbol('TOKEN_BREAK'), //add new
    TOKEN_CASE: Symbol('TOKEN_CASE'),
    TOKEN_CLASS: Symbol( 'TOKEN_CLASS'),
    TOKEN_COLON: Symbol('TOKEN_COLON'),
    TOKEN_DEFAULT: Symbol('TOKEN_DEFAULT'),
    TOKEN_ELSE: Symbol( 'TOKEN_ELSE'),
    TOKEN_FALSE: Symbol( 'TOKEN_FALSE'),
    TOKEN_FOR: Symbol( 'TOKEN_FOR'),
    TOKEN_FUN: Symbol( 'TOKEN_FUN'),
    TOKEN_IF: Symbol( 'TOKEN_IF'),
    TOKEN_NIL: Symbol('TOKEN_NIL'),
    TOKEN_OR: Symbol('TOKEN_OR'),
    TOKEN_PRINT : Symbol('TOKEN_PRINT'),
    TOKEN_RETURN: Symbol( 'TOKEN_RETURN'),
    TOKEN_SUPER: Symbol( 'TOKEN_SUPER'),
    TOKEN_SWITCH: Symbol('TOKEN_SWITCH'), //add new
    TOKEN_THIS: Symbol( 'TOKEN_THIS'),
    TOKEN_TRUE: Symbol( 'TOKEN_TRUE'),
    TOKEN_VAR: Symbol( 'TOKEN_VAR'),
    TOKEN_WHILE: Symbol( 'TOKEN_WHILE'),
    TOKEN_EOF: Symbol( 'TOKEN_EOF'),
    TOKEN_EMPTY: Symbol( 'TOKEN_EMPTY'),

});

export default TokenType;