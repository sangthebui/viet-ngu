import Scanner from "../1scanner.js";
import TokenType from "./TokenType.js";

class Parser {
    current = null;
    previous = null;
    hadError = false;
    panicMode = false;
    scanner = null;
    allTokens = [];

    constructor(source){
        this.scanner = new Scanner(source);
    }

    //movement
    advance(){
        this.previous = this.current;

        for (;;) {
            this.current = this.scanner.scanToken();
            this.allTokens.push(this.current);
            if (this.current.type !== TokenType.TOKEN_ERROR) break;

            this.errorAtCurrent(this.current.payload);
        }
    };

    consume(type, message){
        if (this.current.type === type) {
            this.advance();
            return;
        }
        this.errorAtCurrent(message);
    };

    check(type){
        return this.current.type === type;
    };

    match(type) {
        if (!this.check(type)) return false;
        this.advance();
        return true;
    };

    //errors handling
    errorAt(token, message){
        if (this.panicMode) return;

        this.panicMode = true;
        let outputError = `[line ${token.line}] Error`;

        if (token.type === TokenType.TOKEN_EOF){
            outputError += " at end";
        } else if (token.type === TokenType.TOKEN_ERROR){
            //Do nothing
        } else {
            outputError += ` at '${token.payload}' `;
        }

        outputError += `: ${message}`;
        print(outputError);
        this.hadError = true;
    }

    errorAtCurrent(message){
        this.errorAt(this.current, message);
    };

    error(message){
        this.errorAt(this.previous, message);
    }
}

export default Parser;