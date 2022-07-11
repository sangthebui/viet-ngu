import {interpret} from '../3vm.js';


const postIncrementTest = `
bien temp = 1000;
temp = temp + 1;
viet(temp);
temp++; //
viet(temp);
temp--; //
viet(temp);
    
`;

const preIncrementTest = `
bien temp = 1000;
temp = temp + 1;
viet(temp);
++temp; //
viet(temp);
--temp; //
viet(temp);
`;

const incrementForTest = `
cho (bien i = 0; i < 10; ++i){
    viet(i);
}
    
`;

interpret(postIncrementTest);
interpret(preIncrementTest);
interpret(incrementForTest);