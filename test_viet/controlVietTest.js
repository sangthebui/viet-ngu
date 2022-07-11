import {interpret} from '../3vm.js';

const ifTest = `
bien jump = dung;

neu ( jump == sai) {
    viet("I am jumped over else.");
} khac {
    viet("I should not jump.");
}

    
`;
//TODO detect infinite loop.

const whileTest = `
    bien num = 0;
    trong_khi (num < 5){
        viet(num);
        num = num + 1;
    }

`;

const whileTestWithBreak = `
    bien num = 0;
    trong_khi (num < 10){
        viet(num);
        neu (num == 3) {
            nghi;
        }
        num = num + 1;
    }

`;

const whileTestWithContinue = `
    bien num = 0;
    trong_khi (num < 5){
        num = num + 1;
        neu (num == 3) {
            tiep;
        }
        viet(num);
    }
`;



//Lox does not have increment yet.
const forStatement = `
cho (bien i = 0; i < 5; i = i + 1){
    viet(i);
}

cho (bien i = 0; i < 5; i = i + 1){
    viet(i);
}
`;

const forStatementWithBreak = `
cho (bien i = 0; i < 5; i = i + 1){
    viet(i);
    neu (i == 2){
        nghi;
    }
}
`;

const forStatementWithContinue = `
cho (bien i = 0; i < 5; i = i + 1){
    neu (i == 2){
        tiep;
    }
    viet(i);

}
`;

const breakOutside = `
nghi;
`;

const breakInsideFunction = `
ham errorBreak(){
    viet("I am an error");
    nghi;
}
`;

const continueOutside = `
tiep;
`;

const continueInsideFunction = `
ham errorBreak(){
    viet("I am an error");
    tiep;
}
`;


const switchStatement1 = `
//parse the switch and push the expression onto the stack
    doi (2) {
    
        truong_hop 1: //case/default, then expression, then colon
          viet("one"); //statement, then semi colon
        truong_hop 2:
          viet("two");
        truong_hop 3:
          viet("three");
        khiem_dien:
          viet("default");
    }
`;

const switchStatementDefaultBeforeCase = `
    doi (2) {
     khiem_dien:
          viet("default");
        truong_hop 1:
          viet("one");
        
    }
`;


const switchStatementCase = `
    doi (2) {
        truong_hop 1: {
            viet("1");
            nghi;
        }
        truong_hop 2:{
            viet("2");
            // break;
        }
        truong_hop 2: {
            viet("second two.");
            // break;
        }
    }
    viet("after switch");
`;

const switchStatementDefault = `
    doi (2) {
     khiem_dien:
          viet("default");
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
