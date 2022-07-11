import {interpret} from '../3vm.js';

const classExamples = `
    lop Pie {}
    bien pie = Pie();
    viet(pie);
`;

const classPropertiesExample = `
lop Pair {}
bien pair = Pair();
pair.first = -10 ;
pair.second = dung ;
viet(pair.first);
viet(!pair.second); // 3. 

`;

const classMethodEx = `
lop Brunch {
    bacon () {}
    eggs () {}
}
`;

const classMethodEx2 = `
lop Scone {
    topping ( first , second ) {
        viet(first);
        viet(second);
    }
}
bien scone = Scone();
scone.topping("berries" , "cream" );


`;

const classThisEx = `
lop Person {
    sayName () {
        viet(nay.name);
    }
}

bien jane = Person();
jane.name = "Jane" ;
bien method = jane.sayName ;
method (); // ? 


`;

const classThisEx2 = `
lop Nested {
    method(){
        ham function () {
            viet(nay);
        }
        function();
    }
}
Nested().method();


`;


const classThisEx3 = `
viet(nay);
`;

const classThisEx4 = `
ham notAMethod(){
    viet(nay);
}`;

const classInitEx = `
lop CoffeeMaker {
    init(coffee) {
        nay.coffee = coffee ;
    }
    brew () {
        viet("Enjoy your cup of " + nay.coffee);
        // No reusing the grounds! this . coffee = nil ;
    }
}
bien maker = CoffeeMaker ( "coffee and chicory" );
maker.brew();


`;

const classNotMethod = `
lop Oops {
    init () {
        ham f () {
            viet("not a method");
        }
        nay.field = f;
    }
    
    met(){
        // print "I will get called multiple times.";
        tra 10;
    }
}
bien oops = Oops();
oops.field();
viet("this is a test");
oops.field();
// oops.met();
// oops.met();
viet(oops.met());


`;


const classInheritance = `
lop Doughnut {
    cook () {
        viet("Dunk in the fryer.");
    }

}

lop Cruller theo Doughnut {
    finish () {
        sieu.cook();
        viet("Glaze with icing.");
    }
}

Cruller().finish();


`;

const classInheritance2 = `
lop A {
    method () {
        viet("A");
    }
}

lop B theo A {
    method () {
        bien closure = goc.method ;
        closure (); // Prints "A". 
    }
}

B().method();


`;


const classFields = `
lop Rectangle {
  height = 0;
  width;
  
  init(height, width) {
    nay.height = height;
    nay.width = width;
  }
}

bien rect = Rectangle(10, 10);
viet(rect.width);
viet(rect.height);


`;

interpret(classExamples);
interpret(classPropertiesExample);
interpret(classMethodEx); //prints nothing
interpret(classMethodEx2);
interpret(classThisEx);
interpret(classThisEx2);
interpret(classThisEx3); //[line 2] Error at 'this' : can't use 'this' outside of a class.
interpret(classThisEx4); //[line 3] Error at 'this' : can't use 'this' outside of a class.
interpret(classInitEx);
interpret(classNotMethod);
interpret(classInheritance);
interpret(classInheritance2);

interpret(classFields);

const nativeClassArray = `
bien arr = Mang(20, 20);
viet(arr.length);
`;

interpret(nativeClassArray);