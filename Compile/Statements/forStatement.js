import parser from "../Parser.js";
import TokenType from "../TokenType.js";
import OpCode from "../OpCode.js";

import expressionStatement from "./expressionStatement.js";
import statement from "./statement.js";
import expression from "../expression.js";
import varDeclaration from "../Declarations/varDeclaration.js";

const forStatement = (env) =>{
    const {current} = env;
    //Note, no braces within the for statement
    current.beginScope();

    parser.consume(TokenType.TOKEN_LEFT_PAREN, 'Expect "(" after "for".');

    //for initializer
    if (parser.match(TokenType.TOKEN_SEMICOLON)){
        //No initializer.
    } else if (parser.match(TokenType.TOKEN_VAR)){
        varDeclaration(env);
    } else {
        expressionStatement(env);
    }

    //
    let loopStart = current.closure.code.length;

    let exitJump = -1;

    // for exit condition
    if (!parser.match(TokenType.TOKEN_SEMICOLON)){
        expression(env);
        parser.consume(TokenType.TOKEN_SEMICOLON, 'Expect ";" after loop condition.');

        // Jump out of the loop if the condition is false.
        exitJump = current.closure.emitJump(OpCode.OP_JUMP_IF_FALSE);
        current.closure.emitByte(OpCode.OP_POP); //condition
    }


    // for increment
    if (!parser.match(TokenType.TOKEN_RIGHT_PAREN)){
        const bodyJump = current.closure.emitJump(OpCode.OP_JUMP);
        const incrementStart = current.closure.code.length;
        expression(env);
        current.closure.emitByte(OpCode.OP_POP);
        parser.consume(TokenType.TOKEN_RIGHT_PAREN, 'Expect ")" after for clauses.');

        current.closure.emitLoop(loopStart);
        loopStart = incrementStart;
        current.closure.patchJump(bodyJump);
    }

    // all the statements in for
    statement(env);
    current.closure.emitLoop(loopStart);

    //exit jump
    if (exitJump !== -1){
        current.closure.patchJump(exitJump);
        current.closure.emitByte(OpCode.OP_POP);
    }
    current.beginScope();
}

export default forStatement;