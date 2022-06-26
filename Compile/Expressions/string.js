import {ObjectLox, ValueType} from "../../Objects.js";
import parser from "../Objects/Parser.js";

const string = (_, env) => {
    const { current} = env;
    //TODO GC new Value
    current.closure.emitConstant( new ObjectLox(parser.previous.payload, ValueType.STRING));
}

export default string;