import {interpret} from "../3vm.js";

const nativeFunction = `
viet(clock());
`;


const arrayVietTest = `
bien arr = Mang(1);

arr.set(0, "value");
// arr.set(1, "test");
// print(arr.get(0));
viet(arr.get(0));
// print(arr.get(1));

`;

//this is pretty useless
const arrayTestWithElements = `
bien arr = Mang(10, 20);
viet(arr.length);
`;

//this is pretty useless
const arrayTestWithElements1 = `
bien arr = Mang(10, 9, 8, 7, 6);
viet(arr.length);
cho (bien i = 0; i < arr.length; i = i + 1){
    arr.set(i, 10);
}
viet("//////");
cho (bien i = 0; i < arr.length; i = i + 1){
    viet(arr.get(i));
}
`;

const arrayTestWithElements2 = `
bien arr = Mang(2, 10, 4);

cho (bien i = 0; i < 3; i = i + 1){
    viet(arr.get(i));
}

// arr.set(0, "value");
// arr.set(1, "test");
viet(arr.length);
// print(arr.get(0));
// print(arr.get(1));

`;

const arrayTestWithBracket = `
bien arr = [];

viet(arr.length);
`;

const arrayTestWithBracket2 = `
bien arr = [10, 20, 30];

viet(arr.length);
cho (bien i = 0; i < arr.length; i = i + 1){
    viet(arr.get(i));
}
`;

const arrayBracketWithGetSet = `
bien arr = [10, 20, 30];

arr[0] = 33; //

viet(arr.length);
cho (bien i = 0; i < arr.length; i = i + 1){
    viet(arr[i]);
}


`;

const funTest = `
ham test(arr){
    viet(arr);
}

test("hello");
`;

interpret(nativeFunction);

interpret(arrayTestWithElements); // prints 0
interpret(arrayTestWithElements1); //

interpret(arrayTestWithElements2);

interpret(arrayTestWithBracket); //prints 0
interpret(arrayTestWithBracket2); // prints 3, 10, 20, 30

interpret(arrayBracketWithGetSet); // prints 3, 33, 20, 30

interpret(funTest);
