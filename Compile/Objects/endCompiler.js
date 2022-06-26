

const endCompiler = (env) => {
    let {current} = env;
    //return to the outer function
    current.closure.emitReturn(current.type);
    let closure = current.closure; //return the function object
    // set the enclosing function to be this function, essentially pop this function off the stack
    env.current = current.enclosing;

    return closure;
}

export default endCompiler;