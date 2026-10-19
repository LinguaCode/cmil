var COMMAND = require('../command');

module.exports = [{
  command: '(' + COMMAND.NOT + ')\\s*\\(',
  definition: '!('
}, {
  command: COMMAND.TRUE,
  definition: 'true'
}, {
  command: COMMAND.FALSE,
  definition: 'false'
}, {
  command: COMMAND.OR,
  definition: '||'
}, {
  command: COMMAND.AND,
  definition: '&&'
}, {
  command: COMMAND.PI,
  definition: 'Math.PI'
}, {
  command: COMMAND.E,
  definition: 'Math.E'
}, {
  command: COMMAND.OUTPUT + '(.*);',
  definition: 'output = $1;'
}, {
  command: COMMAND.IF + '\\s+([^\\r\\n]*[^\\' + COMMAND.THEN + '])( ' + COMMAND.THEN + ')*',
  definition: 'if ($1)'
}, {
  command: COMMAND.WHILE + '\\s+(.*)\\s*',
  definition: 'while ($1)'
}, {
  command: COMMAND.ELSE,
  definition: 'else'
}, {
  command: COMMAND.BREAK,
  definition: 'break'
}, {
  command: COMMAND.CONTINUE,
  definition: 'continue'
}, {
  command: COMMAND.FUNCTION + ' \\s*\\(([^\\n\\r\\;])\\)\\s*',
  definition: 'function ($1)'
}, {
  command: '#',
  definition: '//'
}];