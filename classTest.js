import {interpret} from './3vm.js';

const print = console.log;

const classExamples = `
    class Pie {}
    var pie = Pie();
    print(pie);
`;

const classPropertiesExample = `
class Pair {}
var pair = Pair();
pair.first = -10 ;
pair.second = true ;
print(pair.first);
print(!pair.second); // 3. 

`;

const classMethodEx = `
class Brunch {
    bacon () {}
    eggs () {}
}
`;

const classMethodEx2 = `
class Scone {
    topping ( first , second ) {
        print(first);
        print(second);
    }
}
var scone = Scone();
scone.topping("berries" , "cream" );


`;

const classThisEx = `
class Person {
    sayName () {
        print(this.name);
    }
}

var jane = Person();
jane.name = "Jane" ;
var method = jane.sayName ;
method (); // ? 


`;

const classThisEx2 = `
class Nested {
    method(){
        fun function () {
            print(this);
        }
        function();
    }
}
Nested().method();


`;


const classThisEx3 = `
print(this);
`;

const classThisEx4 = `
fun notAMethod(){
    print(this);
}`;

const classInitEx = `
class CoffeeMaker {
    init(coffee) {
        this.coffee = coffee ;
    }
    brew () {
        print("Enjoy your cup of " + this.coffee);
        // No reusing the grounds! this . coffee = nil ;
    }
}
var maker = CoffeeMaker ( "coffee and chicory" );
maker.brew();


`;

const classNotMethod = `
class Oops {
    init () {
        fun f () {
            print("not a method");
        }
        this.field = f;
    }
    
    met(){
        // print "I will get called multiple times.";
        return 10;
    }
}
var oops = Oops();
oops.field();
print("this is a test");
oops.field();
// oops.met();
// oops.met();
print(oops.met());


`;


const classInheritance = `
class Doughnut {
    cook () {
        print("Dunk in the fryer.");
    }

}

class Cruller extends Doughnut {
    finish () {
        super.cook();
        print("Glaze with icing.");
    }
}

Cruller().finish();


`;

const classInheritance2 = `
class A {
    method () {
        print("A");
    }
}

class B extends A {
    method () {
        var closure = super . method ;
        closure (); // Prints "A". 
    }
}

B().method();


`;


const classFields = `
class Rectangle {
  height = 0;
  width;
  
  init(height, width) {
    this.height = height;
    this.width = width;
  }
}

var rect = Rectangle(10, 10);
print(rect.width);
print(rect.height);


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
var arr = Array(20, 20);
print(arr.length);
`;

interpret(nativeClassArray);