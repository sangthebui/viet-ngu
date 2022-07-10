import TokenType from "../Types/TokenType.js";

/// emit a jump back to the top of the loop
// use to continue to restart a while and for
const continueStatement = (env) => {
    const {current, parser} = env;
    if (!parser.insideLoop){
        parser.error("Must be inside a loop to use 'continue'.");
    }
    if (parser.loopStart === -1){
        parser.error("loopStart never reset for 'continue'.");
    }
    current.closure.emitLoop(parser.loopStart);
    parser.consume(TokenType.TOKEN_SEMICOLON, "Expect ';' after 'break'.");

};

export default continueStatement;