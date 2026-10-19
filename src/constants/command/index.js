exports.INPUT = '@input';
exports.OUTPUT = '@output';

exports.IF = '@if';
exports.ELSE = '@else';
exports.THEN = '@then';

exports.FALSE = '@false';
exports.TRUE = '@true';

exports.REPEAT = '@repeat';
exports.WHILE = '@while';
exports.DO = '@do';
exports.TIMES = '@times';

exports.BREAK = '@break';
exports.CONTINUE = '@continue';

exports.OR = '@or';
exports.AND = '@and';
exports.NOT = '@not';

exports.FUNCTION = '@function';

//math
var MATH = require('./math');
exports = Object.assign(exports, MATH);
