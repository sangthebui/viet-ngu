import {interpret} from "./3vm.js";

const nativeFunction = `
import { test } from "./exportExample.lox";
test("hello from import");
`;


interpret(nativeFunction);

