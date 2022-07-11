import TokenType from "../Types/TokenType.js";
import OpCode from "../Types/OpCode.js";
// import fs from "fs";
import {interpretModule} from "../../3vm.js";

//only accept one kind of import for now
// import { <identifier> } from "path_to_lox_file"
// actually makes a copy of that import
const importDeclaration = (env) => {
    const {current, parser} = env;
    parser.consume(TokenType.TOKEN_LEFT_BRACE, ' Expect "{" after import statement.');
    parser.consume(TokenType.TOKEN_IDENTIFIER, ' Expect identifier.');

    //TODO parse more than one export statement
    const identifierName = parser.previous.payload;
    parser.consume(TokenType.TOKEN_RIGHT_BRACE, ' Expect "}" to after identifier.');
    parser.consume(TokenType.TOKEN_FROM, ' Expect "from" to after closing brace.');
    parser.consume(TokenType.TOKEN_STRING, ' Expect path with import statement.');

    const pathToCode = parser.previous.payload;

    //read the data from the path
    // const importSource = fs.readFileSync(pathToCode,  {encoding:'utf8', flag:'r'});
    //compile the importSource
    // interpretModule(importSource);


    current.closure.emitBytes(OpCode.OP_GET_MODULE, identifierName);//get the module name and set it into the global env

    parser.consume(TokenType.TOKEN_SEMICOLON, 'Expect semicolon after import declaration.');

}

export default importDeclaration;