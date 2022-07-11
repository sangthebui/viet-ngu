import {interpret} from "../3vm.js";

const nativeFunction = `
nhap { test } tu_day "./exportExample.lox";
test("chao ham nhap");
`;


interpret(nativeFunction);

