//TODO import all opcode and export as obj
import OpCode from "../../Compile/Types/OpCode.js";

import opConstant from "./opConstant.js";
import opNil from "./opNil.js";
import opTrue from "./opTrue.js";
import opFalse from "./opFalse.js";
import opPop from "./opPop.js";
import opSetLocal from "./opSetLocal.js";
import opGetLocal from "./opGetLocal.js";
import opDefineGlobal from "./opDefineGlobal.js";
import opSetGlobal from "./opSetGlobal.js";
import opGetGlobal from "./opGetGlobal.js";
import opGetUpvalue from "./opGetUpvalue.js";
import opSetUpvalue from "./opSetUpvalue.js";
import opSetProperty from "./opSetProperty.js";
import opGetProperty from "./opGetProperty.js";
import opEqual from "./opEqual.js";
import opGetSuper from "./opGetSuper.js";
import opGreater from "./opGreater.js";
import opLess from "./opLess.js";
import opAdd from "./opAdd.js";
import opSubtract from "./opSubtract.js";
import opMultiply from "./opMultiply.js";
import opDivide from "./opDivide.js";
import opNot from "./opNot.js";
import opNegate from "./opNegate.js";
import opPrint from "./opPrint.js";
import opJump from "./opJump.js";
import opJumpIfFalse from "./opJumpIfFalse.js";
import opLoop from "./opLoop.js";
import opCall from "./opCall.js";
import opInvoke from "./opInvoke.js";
import opSuperInvoke from "./opSuperInvoke.js";
import opClosure from "./opClosure.js";
import opCloseUpvalue from "./opCloseUpvalue.js";
import opReturn from "./opReturn.js";
import opClass from "./opClass.js";
import opInherit from "./opInherit.js";
import opMethod from "./opMethod.js";
import opDup from "./opDup.js";



export default {
    [OpCode.OP_CONSTANT]: opConstant,
    [OpCode.OP_NIL]: opNil,
    [OpCode.OP_TRUE]: opTrue,
    [OpCode.OP_FALSE]: opFalse,
    [OpCode.OP_POP]: opPop,
    [OpCode.OP_GET_LOCAL]: opGetLocal,
    [OpCode.OP_SET_LOCAL]: opSetLocal,
    [OpCode.OP_DEFINE_GLOBAL]: opDefineGlobal,
    [OpCode.OP_SET_GLOBAL]: opSetGlobal,
    [OpCode.OP_GET_GLOBAL]: opGetGlobal,
    [OpCode.OP_GET_UPVALUE]: opGetUpvalue,
    [OpCode.OP_SET_UPVALUE]: opSetUpvalue,
    [OpCode.OP_GET_PROPERTY]: opGetProperty,
    [OpCode.OP_SET_PROPERTY]: opSetProperty,
    [OpCode.OP_EQUAL]: opEqual,
    [OpCode.OP_GET_SUPER]: opGetSuper,
    [OpCode.OP_GREATER]: opGreater,
    [OpCode.OP_LESS]: opLess,
    [OpCode.OP_ADD]: opAdd,
    [OpCode.OP_SUBTRACT]: opSubtract,
    [OpCode.OP_MULTIPLY]: opMultiply,
    [OpCode.OP_DIVIDE]: opDivide,
    [OpCode.OP_NOT]: opNot,
    [OpCode.OP_NEGATE]: opNegate,
    [OpCode.OP_PRINT]: opPrint,
    [OpCode.OP_JUMP]: opJump,
    [OpCode.OP_JUMP_IF_FALSE]: opJumpIfFalse,
    [OpCode.OP_LOOP]: opLoop,
    [OpCode.OP_CALL]: opCall,
    [OpCode.OP_INVOKE]: opInvoke,
    [OpCode.OP_SUPER_INVOKE]: opSuperInvoke,
    [OpCode.OP_CLOSURE]: opClosure,
    [OpCode.OP_CLOSE_UPVALUE]: opCloseUpvalue,
    [OpCode.OP_RETURN]: opReturn,
    [OpCode.OP_CLASS]: opClass,
    [OpCode.OP_INHERIT]: opInherit,
    [OpCode.OP_METHOD]: opMethod,
    [OpCode.OP_DUP]: opDup,
}