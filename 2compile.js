import TokenType from "./Compile/Types/TokenType.js";
import parser from "./Compile/Objects/Parser.js";
import Callable from "./Compile/Objects/Callable.js";
import Compiler from "./Compile/Objects/Compiler.js";

import declaration from "./Compile/Declarations/declaration.js";

export default class CompilerS {
    //TODO GC => object
    current = null;
    currentClass = null;
    constructor(source){
        parser.setSource(source);
        //create the script current compiler
        let closure =  new Callable();
        closure.name = '<script>';
        this.current = new Compiler(closure);
        this.current.addLocal('<script>', 0,)
    }

    resetEnv(){
        let closure =  new Callable();
        this.current = new Compiler(closure);
        this.current.addLocal({
            name: '<script>',
            depth: 0,
            isCaptured: false,
        })

        this.currentClass = null;
    }

    resetCompiler(){
        parser.setSource("");
        this.resetEnv();
    }

    setSource(source){
        parser.setSource(source);
    }

    compile() {
        parser.hadError = false;
        parser.panicMode = false;

        parser.advance();

        let env = {currentClass: this.currentClass, current: this.current};

        while (!parser.match(TokenType.TOKEN_EOF)){
            //each declaration is in charge of advancing the next token.
            declaration(env);
        }
        const closure = env.current.endCompiler(env);

        return parser.hadError ? null : closure;
    }
}