

class Stack {
    stack = [];

    push(value){
        return this.stack.push(value) - 1;
    }
    popN(n){
        for(let i = 0; i < n; i++){
            this.stack.pop();
        }
    }
    pop() {
        return this.stack.pop();
    };
    peek(distance) {
        //look at the top of the stack
        const dist = this.stack.length - 1 - distance;
        return this.stack[dist];
    }

    get(index){
        return this.stack[index];
    }

    set(index, value){
        this.stack[index] = value;
    }

    length(){
        return this.stack.length;
    }

    slice(start){
        this.stack = this.stack.slice(0, start);
    }
}

const stack = new Stack();

export default stack;