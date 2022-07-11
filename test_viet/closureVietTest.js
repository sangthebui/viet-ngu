import {interpret} from '../3vm.js';


const varDecl = `
bien temp = 1; //expression()

{
    bien temp = "changed";
    viet(temp);
}

viet(temp);
`;


const funDecl = `
    ham myFun(first){
        // first = "changed in side function";
        viet(first);
    }
    myFun("I am parameter");
    myFun("I am parameter 2");
`;

const closureExample = `

bien x = "global";
ham outer () {
    bien x = "outside";
    ham middle (){
        ham inner () {
            viet(x) ;
        }
        
        inner();
    }
    middle ();
}
outer ();

viet(x);

`;

const funReturn = `
    ham temp(){
        
        ham inner(){
            viet("I am in inner");
        }

        inner();
        tra 10;
    }
    
    bien value = temp();
    viet(value);
`;

const closureExample2 = `
ham outer () {
    bien x = "value" ;
    
    ham middle () {
    
        ham inner(){
            viet(x);
        }
        viet("create inner closure");
        
        tra inner;
    }
    viet("return from outer");
    tra middle;
}
bien mid = outer();
bien in = mid();
in();

`;

const closureExample3 = `
ham outer () {
    bien x = "value" ;
    
    ham middle () {
        x = "middle";
        
        ham inner(){
            viet(x);
        }
        viet("create inner closure");
        
        tra inner;
    }
    
    viet(x);
    tra middle;
    //move x into upvalues
    //have one central place for upvalues
}
bien mid = outer();
bien in = mid();
in();

`;

const closureExample4 = `

ham makeAdder(x) {
   ham name(y) {
    tra x + y;
  }
  tra name;
}

bien add5 = makeAdder(5);
bien add10 = makeAdder(10);

viet(add5(2));  // 7
viet(add10(2)); // 12

`;


const closureMultipleCalls = `
    ham main(){
        viet("I am from main");
    }
    
    ham result(){
        tra 10;
    }
    
    viet(result());
    
    main();
    viet("I am in between main");
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

