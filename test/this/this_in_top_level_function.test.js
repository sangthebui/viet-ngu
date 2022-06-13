import { readFile} from 'fs/promises';
import VM from "../../3vm.js";

const filePath = './this_in_top_level_function.lox';

async function processEachFile(filePath){
  const data = await readFile(filePath);
  const sourceCode = data.toString();
  const vm = new VM();
  vm.interpret(sourceCode);
}

processEachFile(filePath).then(_ => {
});
