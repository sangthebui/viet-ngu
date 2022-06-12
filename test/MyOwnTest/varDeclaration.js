import VM from '../../3vm.js';

const print = console.log;

const varDecl = `
var temp = 1; //expression()

{
//scope
    var temp = "original temp";
    var temp2 = "slot 2";
    temp = "I am changed";  
    print temp; // I am changed
    print temp2; // slot 2
}

print temp; // 1
`;



const vm = new VM();
vm.interpret(varDecl);
print('Everything is awesome.');
