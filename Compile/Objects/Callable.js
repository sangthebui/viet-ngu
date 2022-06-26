import {ObjectLox, ValueType} from "../../Objects.js";
import OpCode from "../Types/OpCode.js";
import CallableType from "../Types/CallableType.js";

import parser from "./Parser.js";
import CompilerType from "../Types/CompilerType.js";


const UINT8_COUNT  = 255;

class Callable {
    //local variables
    arity = 0;
    code = [];
    lines = [];
    constants = [];
    name = '';
    upvalueCount = 0;
    frameUpvalues = {}; //for VM upvalues,
    type = CallableType.CLOSURE;


    addConstant(value){
        let count = this.constants.push(value);
        if (count > UINT8_COUNT){
            parser.error("Too many constants in one chunk.");
        }
        const index = count - 1;
        return index;
    }

    identifierConstant(identifierName){
        //TODO GC => Value
        // return this.addConstant(new Value(identifierName, ValueType.STRING));
        return this.addConstant(new ObjectLox(identifierName, ValueType.STRING))
    }

    writeChunk(byteCode, line){
        this.code.push(byteCode);
        this.lines.push(line);
    };

    emitByte (opcode) {
        this.writeChunk(opcode, parser.previous.line);
    };

    emitBytes(opCode1, opCode2) {
        this.emitByte(opCode1);
        this.emitByte(opCode2);
    };

    emitConstant(value){
        const constantIndex = this.addConstant(value);
        this.emitBytes(OpCode.OP_CONSTANT, constantIndex);
    }

    emitReturn(compileType) {
        if (compileType === CompilerType.INITIALIZER){
            this.emitBytes(OpCode.OP_GET_LOCAL, 0);
        } else {
            this.emitByte(OpCode.OP_NIL);
        }
        this.emitByte(OpCode.OP_RETURN);
    };

    emitLoop(loopStart){
        this.emitByte(OpCode.OP_LOOP);
        // our jump only have one jump
        const oneJump = 1;
        const offset = this.code.length - loopStart + oneJump;
        if (offset > UINT8_COUNT){
            parser.error('Loop body too large.');
        }

        this.emitByte(offset);
    }

    emitJump(opCode){
        const oneJump = 1;

        this.emitByte(opCode);

        this.emitByte(OpCode.OP_EMPTY);

        const jump = this.code.length - oneJump;

        if (jump > UINT8_COUNT) {
            parser.error("Too much code to jump over.");
        }

        return jump;
    }

    patchJump(offset){
        const oneJump = 1;

        const jump = this.code.length - offset - oneJump;

        if (jump > UINT8_COUNT){
            parser.error('Too much code to jump over.');
        }
        this.code[offset] = jump;
    }

}

export default Callable;