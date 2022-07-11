
export const FRAMES_MAX = 256;

class Frame {
    closure = null;
    ip = 0;
    stackSlot = 0;

    constructor(closure, ip, stackSlot) {
        this.closure = closure;
        this.ip = ip;
        this.stackSlot = stackSlot;
    }

    read_constant(){
        const constantIndex = this.read_byte();
        return this.closure.constants[constantIndex];
    }
    read_string(){
        const constant = this.read_constant();
        return constant.value;
    }
    read_byte(){
        return this.closure.code[this.ip++];
    }
}

export default Frame;