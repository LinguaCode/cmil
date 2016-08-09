exports.INPUT = '#input';
exports.OUTPUT = '#output';

exports.IF = '#if';
exports.ELSE = '#else';
exports.ELIF = `${exports.ELSE} ${exports.IF}`;
exports.THEN = '#then';

exports.FALSE = '#false';
exports.TRUE = '#true';

exports.REPEAT = '#repeat';
exports.WHILE = '#while';
exports.DO = '#do';
exports.TIMES = '#times';

exports.BREAK = '#break';
exports.CONTINUE = '#continue';

exports.OR = '#or';
exports.AND_1 = '#and';
exports.AND_2 = '#and';
exports.NOT = '#not';

exports.FUNCTION = '#function';

exports.IF_WHILE_REPEAT = `${exports.IF}|${exports.WHILE}|${exports.REPEAT}`;
