import { readFile} from 'fs/promises';
import VM from "../../3vm.js";

const filePath = './assign_to_closure.lox';

async function processEachFile(filePath){
  const data = await readFile(filePath);
  const sourceCode = data.toString();
  const vm = new VM();
  vm.interpret(sourceCode);
}

processEachFile(filePath).then(output => {
  console.log("Everything is awesome!");
});



// frame is check, the last check, frameStackLocation.

//Redo Frame and separate functions with frame manipulation.