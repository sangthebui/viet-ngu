import { readFile} from 'fs/promises';
import VM from "../../3vm.js";

const filePath = './super_in_closure_in_inherited_method.lox';

async function processEachFile(filePath){
  const data = await readFile(filePath);
  const sourceCode = data.toString();
  const vm = new VM();
  vm.interpret(sourceCode);
}

processEachFile(filePath).then(_ => {
});
