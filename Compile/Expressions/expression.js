import Precedence from "../Types/Precedence.js";
import parsePrecedence from "./parsePrecedence.js";

const expression = (env) =>{
    parsePrecedence(Precedence.PREC_ASSIGNMENT, env);
}

export default expression;