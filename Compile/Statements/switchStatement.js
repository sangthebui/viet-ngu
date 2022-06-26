import parser from "../Parser.js";
import TokenType from "../TokenType.js";
import expression from "../expression.js";
import OpCode from "../OpCode.js";

import statement from "./statement.js";

//TODO add break statement
const switchStatement = (env) => {
    const {current} = env;
    const MAX_CASES = 256;
    parser.consume(TokenType.TOKEN_LEFT_PAREN, 'Expect "(" after "switch".');
    expression(env);
    parser.consume(TokenType.TOKEN_RIGHT_PAREN, 'Expect ")" after value.');
    parser.consume(TokenType.TOKEN_LEFT_BRACE, 'Expect "{" before switch cases.');

    let state = 0;  //
    let caseEnds = [];
    let caseCount = 0; //the total # of cases
    let previousCaseSkip = -1;

    //we are still in the switch statement
    while (!parser.match(TokenType.TOKEN_RIGHT_BRACE) && !parser.check(TokenType.TOKEN_EOF)) {

        //parse the case or default
        if (parser.match(TokenType.TOKEN_CASE) || parser.match(TokenType.TOKEN_DEFAULT)) {
            let caseType = parser.previous.type;

            if (state === 2) {
                parser.error("Can't have another case or default after the default case");
            }

            if (state === 1) {
                //At the end of the previous case, jump over the others. tidy up last case
                caseEnds[caseCount++] = current.closure.emitJump(OpCode.OP_JUMP);

                //Patch its condition to jump to the next case (this one).

                current.closure.patchJump(previousCaseSkip);
                current.closure.emitByte(OpCode.OP_POP);
            }

            if (caseType === TokenType.TOKEN_CASE) {
                state = 1;

                //See if the case is equal to the value.
                current.closure.emitByte(OpCode.OP_DUP);
                expression(env);

                parser.consume(TokenType.TOKEN_COLON, "Expect ':' after case value.");

                current.closure.emitByte(OpCode.OP_EQUAL);
                previousCaseSkip = current.closure.emitJump(OpCode.OP_JUMP_IF_FALSE);

                // Pop the comparison result TODO?? look at this pop.
                current.closure.emitByte(OpCode.OP_POP);
            } else {
                state = 2;
                parser.consume(TokenType.TOKEN_COLON, "Expect ':' after default.");
                previousCaseSkip = -1;
            }
        } else {
            //Otherwise, it's a statement inside the current case or default.
            if (state === 0) {
                parser.error("Can't have statements before any case");
            }
            statement(env);
        }
    }

    // If we ended without a default case, patch its condition jump.
    if (state === 1){
        current.closure.patchJump(previousCaseSkip);
        current.closure.emitByte(OpCode.OP_POP);
    }

    //Patch all the case jumps to the end.
    for(let i = 0; i < caseCount; i++){
        current.closure.patchJump(caseEnds[i]);
    }

    current.closure.emitByte(OpCode.OP_POP); // pop the switch value

}

export default switchStatement;