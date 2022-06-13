import { readFile} from 'fs/promises';
import VM from "../../3vm.js";

const filePath = './decimal_point_at_eof.lox';

async function processEachFile(filePath){
    const data = await readFile(filePath);
    const sourceCode = data.toString();
    const vm = new VM();
    vm.interpret(sourceCode);
}

processEachFile(filePath).then(_ => {
});
