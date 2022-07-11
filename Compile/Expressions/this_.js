import identifier from "./identifier.js";

const this_ = (_, env) => {
    const {currentClass, parser} = env;
    if (currentClass === null){
        parser.error("can't use 'this' outside of a class.");
        return;
    }
    identifier(false, env);
}
export default this_;