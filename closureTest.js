import VM from './3vm.js';

const print = console.log;

const varDecl = `
bien temp = 1; //expression()

{
//scope
    bien temp = "changed";
    bien temp2 = "slot 2";
    // temp = "I am changed"; //need to know where I am at to look for the variable   
    viet temp;
    viet temp2;
}

viet temp;
`;

const scope = `
var f2;
var temp = 10;
{
  var j = 2;
  fun f() {
    print j;
  }
  f2 = f;
  f(); // at this point of runtime, upvalue j of f2 is open.
}

print temp;

`;

const simpleFunction = `
var temp = 1;
fun simple(){
    print temp;
    
    var insideTemp = 3;
    var insideTemp2 = 10;
    
    print insideTemp;
    print insideTemp2;

}

simple();

`;


const funMultipleCalls = `
    fun myFun(first){
        var temp = 10;
        var temp2 = 100;
        // first = "changed in side function";
        print first;
        print temp;
        print temp2;
    }
    myFun("I am parameter");
    myFun("I am parameter 2");
`;

const functionReturn = `
    fun temp(){
        
        fun inner(){
            print "I am in inner";
        }

        inner();
        return 10;
    }
    
    var value = temp();
    print value;
`;

const closureExample = `

var x = "global";
fun outer () {
    var x = "outside";
    fun middle (){
        fun inner () {
            print x ;
        }
        
        inner();
    }
    middle ();
}
outer ();

print x;

`;

const closureExample1 = `
fun outer () {
    var a = "a" ;
    var c = "c" ;
    // fun middle () {
        var b = "b" ;
        var d = "d" ;
           fun inner () {
                print a;
                print c;
                print b;
                print d;
           }
    // }
    inner();
}
outer();

`;

const closureExample2 = `
fun outer () {
    var x = "outside" ;
    fun inner () {
        print x ;
    }
    return inner ;
}
var closure = outer ();
closure ();

`;


const closureExample3 = `
fun outer () {
    var x = "value" ;
    
    fun middle () {
    
        fun inner(){
            print x;
        }
        print "create inner closure";
        
        return inner;
    }
    print "return from outer" ;
    return middle;
}
var mid = outer();
var in = mid();
in();

`;

const closureExample4 = `
fun makeAdder(x) {
   fun name(y) {
    return x + y;
  }
  return name;
}

var add5 = makeAdder(5);
var add10 = makeAdder(10);

print add5(2);  // 7
print add10(2); // 12

`;



const printExample = `
    fun test(){}
    print test;
`;

const closureMultipleCalls = `
    fun main(){
        print "I am from main";
    }
    
    fun result(){
        return 10;
    }
    
    print result();
    
    main();
    print "I am in between main";
    main();
`;

const closureBlock = `
var f2;
{
  var j = 2;
  fun f() {
    print j;
  }
  f2 = f;
  f2(); // at this point of runtime, upvalue j of f2 is open.
} // at compile time, a compiler emits OP_CLOSE_VALUE within endScope(), the closing procedure is triggered
f2(); // at this point of runtime, upvalue j of f2 is closed.
`;


const vm = new VM();
vm.interpret(varDecl);
// vm.interpret(scope);
// vm.interpret(simpleFunction);
// vm.interpret(funMultipleCalls);
// vm.interpret(functionReturn);
// vm.interpret(closureExample);
// vm.interpret(closureExample1);
/*
a
c
b
d
Everything is awesome.
 */
// vm.interpret(closureExample2);
/*
outside
Everything is awesome.
 */
// vm.interpret(closureExample3);
/*
value
create inner closure
middle
Everything is awesome.

 */
// vm.interpret(closureExample4);
/*
7
12
Everything is awesome.
 */
// vm.interpret(closureMultipleCalls);
// vm.interpret(closureBlock);


print('Everything is awesome.');
