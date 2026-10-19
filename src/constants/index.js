//files of constants
exports.STATUS = require('./status');
exports.BOOLEAN_DEFINITION = require('./boolean_definition');
exports.COMMAND = require('./command');

//limits of a program, between two inputs
exports.TIMEOUT_TIME = 666;
exports.MAX_STEPS = 100000;

//limits of the memory: length of one text and of the output waiting to be sent
exports.MAX_TEXT_LENGTH = 1000000;
exports.MAX_OUTPUT_LENGTH = 10000000;

//nesting of blocks and of expressions
exports.MAX_NESTING = 100;
