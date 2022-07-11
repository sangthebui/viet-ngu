import TokenType from "../Types/TokenType.js";
import expression from "../Expressions/expression.js";
import OpCode from "../Types/OpCode.js";
import statement from "./statement.js";

const caseClause = (env) => {
    const {current, parser} = env;
    parser.insideSwitchCase = true;
    //parse the expression
    current.closure.emitByte(OpCode.OP_DUP);
    expression(env);
    parser.consume(TokenType.TOKEN_COLON, "Expect ':' after case value.");

    current.closure.emitByte(OpCode.OP_EQUAL);
    const exitJump = current.closure.emitJump(OpCode.OP_JUMP_IF_FALSE);

    // Pop the comparison result
    //block built-in for statement
    statement(env);

    current.closure.patchJump(exitJump);
    current.closure.emitByte(OpCode.OP_POP);

    //jump past everything
    parser.insideSwitchCase = false;
    if (parser.detectBreak){
        //wait until the end of the switch statement to patch the break.


        parser.detectBreak = false; //reset the break statement
        const breakJump =  parser.innerMostFlowForBreak;
        parser.innerMostFlowForBreak = -1;
        return breakJump;

    }
    return -1;
}

const defaultClause = (env) => {
    const {parser} = env;
    parser.consume(TokenType.TOKEN_COLON, "Expect ':' after case value.");
    //block built-in for statement
    statement(env);
}

const switchStatement = (env) => {
    const {current, parser} = env;
    parser.consume(TokenType.TOKEN_LEFT_PAREN, 'Expect "(" after "switch".');
    expression(env); //put the switch expression on the stack
    parser.consume(TokenType.TOKEN_RIGHT_PAREN, 'Expect ")" after value.');
    parser.consume(TokenType.TOKEN_LEFT_BRACE, 'Expect "{" before switch cases.');


    let allCasesHasBreak = [];

    while (parser.match(TokenType.TOKEN_CASE)){
        const breakJump = caseClause(env); //either -1 or a jump toward the end
        allCasesHasBreak.push(breakJump);
    }

    //pop the switch expression
    current.closure.emitByte(OpCode.OP_POP);

    if (parser.match(TokenType.TOKEN_DEFAULT)){
        defaultClause(env);
    }

    //patch all the cases for break
    for(let i = 0; i < allCasesHasBreak.length; i++){
        //only patch the break if break exist with the case.
        if (allCasesHasBreak[i] !== -1){
            current.closure.patchJump(allCasesHasBreak[i]);
        }
    }

    parser.consume(TokenType.TOKEN_RIGHT_BRACE, 'Expect "}" after to close out the switch statement.');

}

export default switchStatement;