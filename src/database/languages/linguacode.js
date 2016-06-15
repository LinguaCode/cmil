var constants = require('../constants').constants;
var commands = require('../commands/variables');

module.exports = function (sessionId, isCondition) {
  isCondition = isCondition || false;
  var _then = commands.then;
  var notThen = '';
  for (var i = 0; i < _then.length; i++) {
    notThen += '[^\\' + _then[i] + ']';
  }

  var toReplace = [{
    which: '(' + commands.not + ')\\s*\\(',
    toWhat: '!('
  }, {
    which: commands.true,
    toWhat: 'true'
  }, {
    which: commands.false,
    toWhat: 'false'
  }, {
    which: commands.or,
    toWhat: '||'
  }, {
    which: commands.and1,
    toWhat: '&&'
  }, {
    which: commands.and2,
    toWhat: '&&'
  }, {
    which: commands.output + '\\s+([^\\n\\r\\;]*)\\s*;',
    toWhat: sessionId + '._output += ($1) + \'\\n\';'
  }, {
    which: commands.if + '\\s+([^\\r\\n]*[^\\' + commands.then + '])( ' + commands.then + ')*',
    toWhat: 'if ($1)'
  }, {
    which: commands.while + '\\s+(.*)\\s*',
    toWhat: 'while ($1)'
  }, {
    which: commands.else,
    toWhat: 'else'
  }, {
    which: commands.break,
    toWhat: 'break'
  }, {
    which: commands.continue,
    toWhat: 'continue'
  }, {
    which: commands.function + ' \\s*\\(([^\\n\\r\\;])\\)\\s*',
    toWhat: 'function ($1)'
  }, {
    which: '#',
    toWhat: '//'
  }
    /*{
     which: 'Math.pi',
     toWhat: 'Math.PI'
     }, {
     which: 'Math.e',
     toWhat: 'Math.E'
     },*/
  ];

  if (!isCondition) {
    toReplace.push({
      which: '^([\\s\\S]*)$',
      toWhat: 'function _compile() {\
            ' + sessionId + '._output = \'\';\
            $1\n\
            return ' + sessionId + '._output;\
            }\
            _compile();'
    })
  }

  return {
    initialize: 'global.' + sessionId + ' = {}',
    unInitialize: sessionId + ' = {};',
    replace: toReplace
  }
};
