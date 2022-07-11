import {interpret} from './3vm.js';

const ifTest = `
var jump = true;

if ( jump == false) {
    print("I am jumped over else.");
} else {
    print("I should not jump.");
}

    
`;
//TODO detect infinite loop.

const whileTest = `
    var num = 0;
    while (num < 5){
        print(num);
        num = num + 1;
    }

`;

const whileTestWithBreak = `
    var num = 0;
    while (num < 10){
        print(num);
        if (num == 3) {
            break;
        }
        num = num + 1;
    }

`;

const whileTestWithContinue = `
    var num = 0;
    while (num < 5){
        num = num + 1;
        if (num == 3) {
            continue;
        }
        print(num);
    }
`;



//Lox does not have increment yet.
const forStatement = `
for (var i = 0; i < 5; i = i + 1){
    print(i);
}

for (var i = 0; i < 5; i = i + 1){
    print(i);
}
`;

const forStatementWithBreak = `
for (var i = 0; i < 5; i = i + 1){
    print(i);
    if (i == 2){
        break;
    }
}
`;

const forStatementWithContinue = `
for (var i = 0; i < 5; i = i + 1){
    if (i == 2){
        continue;
    }
    print(i);

}
`;

const breakOutside = `
break;
`;

const breakInsideFunction = `
fun errorBreak(){
    print("I am an error");
    break;
}
`;

const continueOutside = `
continue;
`;

const continueInsideFunction = `
fun errorBreak(){
    print("I am an error");
    continue;
}
`;


const switchStatement1 = `
//parse the switch and push the expression onto the stack
    switch (2) {
    
        case 1: //case/default, then expression, then colon
          print("one"); //statement, then semi colon
        case 2:
          print("two");
        case 3:
          print("three");
        default:
          print("default");
    }
`;

const switchStatementDefaultBeforeCase = `
    switch (2) {
     default:
          print("default");
        case 1:
          print("one");
        
    }
`;


const switchStatementCase = `
    switch (2) {
        case 1: {
            print("1");
            break;
        }
        case 2:{
            print("2");
            // break;
        }
        case 2: {
            print("second two.");
            // break;
        }
    }
    print("after switch");
`;

const switchStatementDefault = `
    switch (2) {
     default:
          print("default");
    }
`;

interpret(ifTest);
interpret(whileTest);
interpret(whileTestWithBreak);
interpret(whileTestWithContinue);

interpret(forStatement);
interpret(forStatementWithBreak);
interpret(forStatementWithContinue);
interpret(breakOutside);
interpret(breakInsideFunction);

interpret(continueOutside);
interpret(continueInsideFunction);


interpret(switchStatement1);
interpret(switchStatementDefaultBeforeCase);
interpret(switchStatementCase);
interpret(switchStatementDefault);
