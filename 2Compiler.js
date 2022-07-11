import TokenType from "./Compile/Types/TokenType.js";
import Parser from "./Compile/Objects/Parser.js";
import Callable from "./Compile/Objects/Callable.js";
import Ledger from "./Compile/Objects/Ledger.js";

import declaration from "./Compile/Declarations/declaration.js";

export default class Compiler {
    //TODO GC => object
    current = null;
    currentClass = null;
    parser = new Parser();
    constructor(source){
        this.parser.resetParser();
        this.parser.setSource(source);
        //create the script current compiler
        let closure =  new Callable({parser: this.parser});
        closure.name = '<script>';
        this.current = new Ledger({parser: this.parser});
        this.current.setClosure(closure);
        this.current.addLocal('<script>', 0,)
    }

    setSource(source){
        this.parser.setSource(source);
    }

    compile() {
        this.parser.hadError = false;
        this.parser.panicMode = false;

        this.parser.advance();

        let env = {currentClass: this.currentClass, current: this.current, parser: this.parser};

        while (!this.parser.match(TokenType.TOKEN_EOF)){
            //each declaration is in charge of advancing the next token.
            declaration(env);
        }
        const closure = env.current.endCompiler(env);

        return this.parser.hadError ? null : closure;
    }
}