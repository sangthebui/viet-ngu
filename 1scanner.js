import TokenType from "./Compile/Types/TokenType.js";

export default class Scanner {
    source = '';
    current = 0;
    start = 0;
    line = 1;

    setSource(source){
        this.source = source;
    }

    isAtEnd() {
        return this.current >= this.source.length;
    };

    makeToken(type, payload){
        let token = {
            length: this.current - this.start,
            line: this.line,
            type,
            payload

        };
        return token;
    };

    errorToken (message) {
        let token = {
            type: TokenType.TOKEN_ERROR,
            payload:  message,
            length:  message.length,
            line:  this.line,
        };

        return token;
    };

    advance () {
        return this.source.charAt(this.current++);
    };

    match (expected) {
        if (this.isAtEnd()) return false;
        if (this.source.charAt(this.current) !== expected) return false;
        this.current++;
        return true;
    };

    peek(){
        //look at the current character, but does not move the current forward
        return this.source.charAt(this.current);
    };

    peekNext (){
        if (this.isAtEnd()) return '\0';
        return this.source.charAt(this.current + 1);
    };

    skipWhiteSpace () {
        //keep skipping empty string, carriage return, tab,
        //newlines, and comments.
        for(;;){
            const character = this.peek();
            switch(character){
                case ' ':
                case '\r':
                case '\t':
                    this.advance();
                    break;
                case '\n': {
                    this.line++;
                    this.advance();
                    break;
                }
                //need to escape slash
                case '/': {
                    if (this.peekNext() === '/') {
                        //A comment goes until the end of the line
                        while(this.peek() !== '\n' && !this.isAtEnd()) {
                            this.advance();
                        }
                    } else {
                        return;
                    }
                    break;
                }
                default:
                    return;
            }
        }
    };

    checkKeyword (keyword, type){
        //take the word from scanner
        const word = this.source.substring(this.current - keyword.length, this.current);
        const keyWordLength = keyword.length;
        const wordLength = this.current - this.start;
        //compare they have the same length and content
        if ( (wordLength === keyWordLength) && (word === keyword)){
            return  type;
        }

        return TokenType.TOKEN_IDENTIFIER;
    };

    identifierType(){
        const currentCharacter = this.source.charAt(this.start);
        switch(currentCharacter){
            case 'a': return this.checkKeyword('and', TokenType.TOKEN_AND);
            case 'b': return this.checkKeyword('break', TokenType.TOKEN_BREAK);
            case 'c': if (this.current - this.start > 1) {
                const innerCharacter = this.source.charAt(this.start + 1);
                switch (innerCharacter) {
                    case 'a': return this.checkKeyword('case', TokenType.TOKEN_CASE);
                    case 'l':return this.checkKeyword('class', TokenType.TOKEN_CLASS);
                    case 'o': return this.checkKeyword('continue', TokenType.TOKEN_CONTINUE);
                }
            }
            case 'd': return this.checkKeyword('default', TokenType.TOKEN_DEFAULT);
            case 'e': {
                if (this.current - this.start > 1) {
                    const innerCharacter = this.source.charAt(this.start + 1);
                    switch (innerCharacter) {
                        case 'l':  return this.checkKeyword('else', TokenType.TOKEN_ELSE);
                        case 'x': return this.checkKeyword('extends', TokenType.TOKEN_EXTENDS);
                    }
                }
            }
            case 'f': {
                if (this.current - this.start > 1){
                    const innerCharacter = this.source.charAt(this.start + 1);
                    switch (innerCharacter){
                        case 'a': return this.checkKeyword('false', TokenType.TOKEN_FALSE);
                        case 'o': return this.checkKeyword('for', TokenType.TOKEN_FOR);
                        case 'u': return this.checkKeyword('fun', TokenType.TOKEN_FUN);
                    }
                }
                break;
            }
            case 'i': return this.checkKeyword('if', TokenType.TOKEN_IF);
            case 'n': return this.checkKeyword('nil', TokenType.TOKEN_NIL);
            case 'o': return this.checkKeyword('or', TokenType.TOKEN_OR);
            case 'p': return this.checkKeyword('print', TokenType.TOKEN_PRINT);
            case 'r': return this.checkKeyword('return', TokenType.TOKEN_RETURN);
            case 's': {
                if (this.current - this.start > 1) {
                    const innerCharacter = this.source.charAt(this.start + 1);
                    switch (innerCharacter) {
                        case 'u': return this.checkKeyword('super', TokenType.TOKEN_SUPER);
                        case 'w':  return this.checkKeyword('switch', TokenType.TOKEN_SWITCH);
                    }
                }
            }
            case 't': {
                if (this.current - this.start > 1){
                    const innerCharacter = this.source.charAt(this.start + 1);
                    switch (innerCharacter){
                        case 'h': return this.checkKeyword('this', TokenType.TOKEN_THIS);
                        case 'r': return this.checkKeyword('true', TokenType.TOKEN_TRUE);
                    }
                }
                break;
            }
            case 'v': return this.checkKeyword('var', TokenType.TOKEN_VAR);
            case 'w': return this.checkKeyword('while', TokenType.TOKEN_WHILE);
        }
        return TokenType.TOKEN_IDENTIFIER;
    };

    string() {
        while (this.peek() !== '"' && !this.isAtEnd()){
            if (this.peek() === '\n'){
                this.line++;
            }
            this.advance();
        }

        if (this.isAtEnd()){
            return this.errorToken("Unterminated string.");
        }



        //at this point, the scanner already consume the first quote
        //therefore, we need to account for the two quotes.
        const firstQuote = 1;
        const tokenString = {
            type: TokenType.TOKEN_STRING,
            length: this.current - this.start - firstQuote,
            line: this.line,
            payload: this.source.substring(this.start + firstQuote, this.current)
        }

        // The closing quote
        this.advance();

        return tokenString;
    };

    isDigit (character) {
        const reg = new RegExp(/^\d/);
        return reg.test(character);
    };

    number(){
        while (this.isDigit(this.peek())){
            this.advance();
        }

        if (this.peek() === '.' && this.isDigit(this.peekNext())){
            //consume the ".".
            this.advance();
            while(this.isDigit(this.peek())){
                this.advance();
            }
        }
        // the actual number is returned as a number
        const tokenNumber = {
            type: TokenType.TOKEN_NUMBER,
            // start: Number(scanner.source.substring(scanner.start, scanner.current)),
            length: this.current - this.start,
            line: this.line,
            payload: this.source.substring(this.start, this.current),
        };
        return tokenNumber;
    };

    isAlpha (character) {
        const reg = new RegExp(/^[_a-zA-Z]/);
        return reg.test(character);
    };


    identifier () {
        while(this.isAlpha(this.peek()) || this.isDigit(this.peek())){
            this.advance();//keep going until the identifier ends
        }
        const payload = this.source.substring(this.start, this.current);
        return this.makeToken(this.identifierType(), payload);
    };


    scanToken() {
        this.skipWhiteSpace();
        this.start = this.current;

        if (this.isAtEnd()) return this.makeToken(TokenType.TOKEN_EOF);

        const character = this.advance();
        if (this.isAlpha(character)) return this.identifier();
        if (this.isDigit(character)) {
            return this.number();
        }
        switch(character){
            case '(': return this.makeToken(TokenType.TOKEN_LEFT_PAREN, '(');
            case ')': return this.makeToken(TokenType.TOKEN_RIGHT_PAREN, ')');
            case '{': return this.makeToken(TokenType.TOKEN_LEFT_BRACE, '{');
            case '}': return this.makeToken(TokenType.TOKEN_RIGHT_BRACE, '}');
            case ';': return this.makeToken(TokenType.TOKEN_SEMICOLON, ';');
            case ',': return this.makeToken(TokenType.TOKEN_COMMA, ',');
            case '.': return this.makeToken(TokenType.TOKEN_DOT, '.');
            case '-': return this.makeToken(TokenType.TOKEN_MINUS, '-');
            case '+': return this.makeToken(TokenType.TOKEN_PLUS, '+');
            case '/': return this.makeToken(TokenType.TOKEN_SLASH, '/');
            case '*': return this.makeToken(TokenType.TOKEN_STAR, '*');
            case ':': return this.makeToken(TokenType.TOKEN_COLON, ':');
            case '[': return this.makeToken(TokenType.TOKEN_LEFT_BRACKET, '[');
            case ']': return this.makeToken(TokenType.TOKEN_RIGHT_BRACKET, ']');
            /* one or two characters together*/
            case '!': return this.makeToken(this.match('=')? TokenType.TOKEN_BANG_EQUAL: TokenType.TOKEN_BANG, '!');
            case '=': return this.makeToken(this.match('=')? TokenType.TOKEN_EQUAL_EQUAL: TokenType.TOKEN_EQUAL, '=');
            case '<': return this.makeToken(this.match('=')? TokenType.TOKEN_LESS_EQUAL: TokenType.TOKEN_LESS, '<');
            case '>': return this.makeToken(this.match('=')? TokenType.TOKEN_GREATER_EQUAL: TokenType.TOKEN_GREATER, '>');
            case '"': {
                return this.string();
            }
            default:
                return this.errorToken("Unexpected character.");
        }
    };

}