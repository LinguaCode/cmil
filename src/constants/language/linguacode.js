let COMMAND = require('../command');

module.exports = (sessionId, isCondition) => {
  isCondition = isCondition || false;
  const _then = COMMAND.THEN;
  let notThen = '';
  for (let i = 0; i < _then.length; i++) {
    notThen += `[^\\${_then[i]}]`;
  }

  const toReplace = [{
    command: `(${COMMAND.NOT})\\s*\\(`,
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
    command: COMMAND.AND_1,
    definition: '&&'
  }, {
    command: COMMAND.AND_2,
    definition: '&&'
  }, {
    command: `${COMMAND.OUTPUT}\\s*\\((.*)\\)(.*);`,
    definition: `output = $1;`
  }, {
    command: `${COMMAND.POW}\\s*\\(([^\\)\(]+)\\)(.*);`,
    definition: `Math.pow($1);`
  }, {
    command: `${COMMAND.ROUND}\\s*\\(([^\\)\(]+)\\)(.*);`,
    definition: `Math.round($1);`
  }, {
    command: `${COMMAND.ABS}\\s*\\(([^\\)\(]+)\\)(.*);`,
    definition: `Math.abs($1);`
  }, {
    command: `${COMMAND.ARCSIN}\\s*\\(([^\\)\(]+)\\)(.*);`,
    definition: `Math.asin($1);`
  }, {
    command: `${COMMAND.ARCCOS}\\s*\\(([^\\)\(]+)\\)(.*);`,
    definition: `Math.acos($1);`
  }, {
    command: `${COMMAND.ARCTAN}\\s*\\(([^\\)\(]+)\\)(.*);`,
    definition: `Math.atan($1);`
  }, {
    command: `${COMMAND.ARCCTG}\\s*\\(([^\\)\(]+)\\)(.*);`,
    definition: `(Math.PI / 2 - Math.atan($1));`
  },{
    command: `${COMMAND.SIN}\\s*\\(([^\\)\(]+)\\)(.*);`,
    definition: `Math.sin($1);`
  }, {
    command: `${COMMAND.COS}\\s*\\(([^\\)\(]+)\\)(.*);`,
    definition: `Math.cos($1);`
  }, {
    command: `${COMMAND.TAN}\\s*\\(([^\\)\(]+)\\)(.*);`,
    definition: `Math.tan($1);`
  }, {
    command: `${COMMAND.CTG}\\s*\\(([^\\)\(]+)\\)(.*);`,
    definition: `1/Math.tan($1);`
  }, {
    command: `${COMMAND.IF}\\s+([^\\r\\n]*[^\\${COMMAND.THEN}])( ${COMMAND.THEN})*`,
    definition: 'if ($1)'
  }, {
    command: `${COMMAND.WHILE}\\s+(.*)\\s*`,
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
    command: `${COMMAND.FUNCTION} \\s*\\(([^\\n\\r\\;])\\)\\s*`,
    definition: 'function ($1)'
  }, {
    command: '#',
    definition: '//'
  }
    /*{
     command: 'Math.pi',
     definition: 'Math.PI'
     }, {
     command: 'Math.e',
     definition: 'Math.E'
     },*/
  ];

  if (!isCondition) {
    toReplace.push({
      command: '^([\\s\\S]*)$',
      definition: `
      (() => {
        let output = '';
        $1
        return output;
      })();`
    })
  }

  return {
    initialize: `global.${sessionId} = {}`,
    unInitialize: `delete global.${sessionId}`,
    replace: toReplace
  }
};
