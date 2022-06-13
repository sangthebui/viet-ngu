import { readFile} from 'fs/promises';
import VM from "../../3vm.js";

const filePath = './less_or_equal_nonnum_num.lox';

async function processEachFile(filePath){
    const data = await readFile(filePath);
    const sourceCode = data.toString();
    const vm = new VM();
    vm.interpret(sourceCode);
}

processEachFile(filePath).then(_ => {
});
