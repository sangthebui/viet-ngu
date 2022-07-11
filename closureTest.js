import {interpret} from './3vm.js';


const varDecl = `
var temp = 1; //expression()

{
    var temp = "changed";
    print(temp);
}

print(temp);
`;


const funDecl = `
    fun myFun(first){
        // first = "changed in side function";
        print(first);
    }
    myFun("I am parameter");
    myFun("I am parameter 2");
`;

const closureExample = `

var x = "global";
fun outer () {
    var x = "outside";
    fun middle (){
        fun inner () {
            print(x) ;
        }
        
        inner();
    }
    middle ();
}
outer ();

print(x);

`;

const funReturn = `
    fun temp(){
        
        fun inner(){
            print("I am in inner");
        }

        inner();
        return 10;
    }
    
    var value = temp();
    print(value);
`;

const closureExample2 = `
fun outer () {
    var x = "value" ;
    
    fun middle () {
    
        fun inner(){
            print(x);
        }
        print("create inner closure");
        
        return inner;
    }
    print("return from outer");
    return middle;
}
var mid = outer();
var in = mid();
in();

`;

const closureExample3 = `
fun outer () {
    var x = "value" ;
    
    fun middle () {
        x = "middle";
        
        fun inner(){
            print(x);
        }
        print("create inner closure");
        
        return inner;
    }
    
    print(x);
    return middle;
    //move x into upvalues
    //have one central place for upvalues
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

print(add5(2));  // 7
print(add10(2)); // 12

`;


const closureMultipleCalls = `
    fun main(){
        print("I am from main");
    }
    
    fun result(){
        return 10;
    }
    
    print(result());
    
    main();
    print("I am in between main");
    main();
`;


interpret(varDecl);
interpret(funDecl);
interpret(closureExample);
interpret(funReturn);
interpret(closureExample2);
/*
return from outer
create inner closure
value
Everything is awesome.
 */
interpret(closureExample3);
interpret(closureExample4);
/*
7
12
Everything is awesome.
 */
interpret(closureMultipleCalls);

