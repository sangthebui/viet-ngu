import TokenType from "../Types/TokenType.js";
import OpCode from "../Types/OpCode.js";
import parsePrecedence from "./parsePrecedence.js";
import getRule from "./getRule.js";

const binary = (_, env) => {
    const {current, parser} = env;
    //at this point, the first operand had already been parsed and pushed onto the stack.
    //get the operator
    const operator = parser.previous.type;
    const rule = getRule(operator); // get the rule for the operator
    //parse anything that has a rule that is greater than it first. Parse the
    //second operand before pushing the operator onto the stack.
    parsePrecedence(rule.precedence + 1, env);

    //then push the operator onto the stack
    switch(operator){
        case TokenType.TOKEN_BANG_EQUAL: current.closure.emitBytes(OpCode.OP_EQUAL, OpCode.OP_NOT); break;
        case TokenType.TOKEN_EQUAL_EQUAL: current.closure.emitByte(OpCode.OP_EQUAL); break;
        case TokenType.TOKEN_GREATER: current.closure.emitByte(OpCode.OP_GREATER); break;
        case TokenType.TOKEN_GREATER_EQUAL: current.closure.emitBytes(OpCode.OP_LESS, OpCode.OP_NOT); break;
        case TokenType.TOKEN_LESS: current.closure.emitByte(OpCode.OP_LESS); break;
        case TokenType.TOKEN_LESS_EQUAL: current.closure.emitBytes(OpCode.OP_GREATER, OpCode.OP_NOT); break;
        case TokenType.TOKEN_PLUS: current.closure.emitByte(OpCode.OP_ADD); break;
        case TokenType.TOKEN_MINUS: current.closure.emitByte(OpCode.OP_SUBTRACT); break;
        case TokenType.TOKEN_STAR: current.closure.emitByte(OpCode.OP_MULTIPLY); break;
        case TokenType.TOKEN_SLASH: current.closure.emitByte(OpCode.OP_DIVIDE); break;
        default: return; // Unreachable, should be error
    }
}

export default binary;