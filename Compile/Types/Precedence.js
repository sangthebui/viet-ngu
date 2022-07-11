const Precedence = Object.freeze({
    PREC_NONE:  0, //literals and nulls
    PREC_ASSIGNMENT: 1,  // =
    PREC_OR: 2,          // or
    PREC_AND: 3,         // and
    PREC_EQUALITY: 4,    // == !=
    PREC_COMPARISON:  5,  // < > <= >=
    PREC_TERM: 6,        // + -
    PREC_FACTOR: 7,      // * /
    PREC_UNARY:  8,       // ! -
    PREC_INCREMENT: 9,    // ++, --
    PREC_CALL: 10,        // . () []
    PREC_PRIMARY: 11,
});

export default Precedence;