import {interpret} from './3vm.js';


const postIncrementTest = `
var temp = 1000;
temp = temp + 1;
print(temp);
temp++; //
print(temp);
temp--; //
print(temp);
    
`;

const preIncrementTest = `
var temp = 1000;
temp = temp + 1;
print(temp);
++temp; //
print(temp);
--temp; //
print(temp);
`;

const incrementForTest = `
for (var i = 0; i < 10; ++i){
    print(i);
}
    
`;

interpret(postIncrementTest);
interpret(preIncrementTest);
interpret(incrementForTest);