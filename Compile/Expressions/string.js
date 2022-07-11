import {ObjectLox, ValueType} from "../../Objects.js";

const string = (_, env) => {
    const {current, parser} = env;
    //TODO GC new Value
    current.closure.emitConstant( new ObjectLox(parser.previous.payload, ValueType.STRING));
}

export default string;