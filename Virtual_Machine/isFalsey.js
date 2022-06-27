import {ObjectLox} from "../Objects.js";

const isFalsey = (value) =>{
    const isNil = ObjectLox.isNil(value) ;
    const isBool = ObjectLox.isBoolean(value);
    const isFalse =  isNil  || (isBool && !value);

    return isFalse;
}

export default isFalsey;