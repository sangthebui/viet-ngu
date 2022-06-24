import parser from "./Parser.js";
import identifier from "./identifier.js";

const this_ = (_, env) => {
    const {currentClass} = env;
    if (currentClass === null){
        parser.error("can't use 'this' outside of a class.");
        return;
    }
    identifier(false, env);
}
export default this_;