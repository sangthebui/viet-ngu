import {interpret} from "./3vm.js";

const nativeFunction = `
print(clock());
`;


const arrayTest = `
var arr = Array(1);

arr.set(0, "value");
// arr.set(1, "test");
// print(arr.get(0));
print(arr.get(0));
// print(arr.get(1));

`;

//this is pretty useless
const arrayTestWithElements = `
var arr = Array(10, 20);
print(arr.length);
`;

//this is pretty useless
const arrayTestWithElements1 = `
var arr = Array(10, 9, 8, 7, 6);
print(arr.length);
for (var i = 0; i < arr.length; i = i + 1){
    arr.set(i, 10);
}
print("//////");
for (var i = 0; i < arr.length; i = i + 1){
    print(arr.get(i));
}
`;

const arrayTestWithElements2 = `
var arr = Array(2, 10, 4);

for (var i = 0; i < 3; i = i + 1){
    print(arr.get(i));
}

// arr.set(0, "value");
// arr.set(1, "test");
print(arr.length);
// print(arr.get(0));
// print(arr.get(1));

`;

const arrayTestWithBracket = `
var arr = [];

print(arr.length);
`;

const arrayTestWithBracket2 = `
var arr = [10, 20, 30];

print(arr.length);
for (var i = 0; i < arr.length; i = i + 1){
    print(arr.get(i));
}
`;

const arrayBracketWithGetSet = `
var arr = [10, 20, 30];

arr[0] = 33; //

print(arr.length);
for (var i = 0; i < arr.length; i = i + 1){
    print(arr[i]);
}


`;

const funTest = `
fun test(arr){
    print(arr);
}

test("hello");
`;

interpret(nativeFunction);

interpret(arrayTest);
interpret(arrayTestWithElements); // prints 0
interpret(arrayTestWithElements1); //

interpret(arrayTestWithElements2);

interpret(arrayTestWithBracket); //prints 0
interpret(arrayTestWithBracket2); // prints 3, 10, 20, 30

interpret(arrayBracketWithGetSet); // prints 3, 33, 20, 30

interpret(funTest);
