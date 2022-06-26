import OpCode from "./OpCode.js";
import parser from "./Parser.js";
import CompilerType from "./CompilerType.js";

const UINT8_COUNT  = 255;

class Compiler {
    closure = null;
    locals = []; //only compile locals
    enclosing = null;
    scopeDepth = 0;
    localCount = 0;
    upvalues = [];
    type= CompilerType.SCRIPT;


    constructor(closure) {
        this.closure = closure;
    }

    addLocal(name, depth=-1, isCaptured=false){
        if (this.localCount === UINT8_COUNT){
            parser.error("Too many local variables in function.");
        }
        //TODO GC => locals
        this.locals[this.localCount++] = {
            name,
            depth: depth,
            isCaptured: isCaptured,
        };
    }

    resolveLocal(compiler, identifierName){
        for (let i = compiler.localCount - 1; i >= 0; i--){
            let local = compiler.locals[i];
            if (local.name === identifierName) {
                if (local.depth === -1){
                    parser.error("Can't read local variable in its own initializer.");
                }
                return i;
            }
        }
        return -1;
    }

    addUpvalue(compiler, index, isLocal){
        let upvalueCount = compiler.closure.upvalueCount;

        for(let i = 0; i < upvalueCount; i++){
            let upvalue = compiler.upvalues[i];
            if (upvalue.index === index && upvalue.isLocal === isLocal){
                return i;
            }
        }

        if (upvalueCount === UINT8_COUNT){
            parser.error('Too many closure variables in function.');
            return 0;
        }
        //TODO GC => compiler upvalues
        compiler.upvalues[upvalueCount] = {
            isLocal,
            index,
        };
        return compiler.closure.upvalueCount++;
    }

    resolveUpvalue(compiler, identifierName){
        if (compiler.enclosing === null) return -1;

        let local = this.resolveLocal(compiler.enclosing, identifierName);
        if (local !== -1){
            compiler.enclosing.locals[local].isCaptured = true;
            return this.addUpvalue(compiler, local, true);
        }

        let upvalue = this.resolveUpvalue(compiler.enclosing, identifierName);
        if (upvalue !== -1){
            return this.addUpvalue(compiler, upvalue, false);
        }

        return -1;
    }

    beginScope(){
        this.scopeDepth++;
    }

    endScope(){
        this.scopeDepth--;
        //remove all the locals from the stack
        while( this.localCount > 0 &&
        this.locals[this.localCount - 1].depth >
        this.scopeDepth){

            if (this.locals[this.localCount - 1].isCaptured){
                this.closure.emitByte(OpCode.OP_CLOSE_UPVALUE)
            } else {
                this.closure.emitByte(OpCode.OP_POP);
            }

            this.localCount--;
        }
    }

}

export default Compiler;