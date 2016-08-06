let VARIABLE = require('../variable');

module.exports = (sessionId, isCondition) => {
  isCondition = isCondition || false;
  const _then = VARIABLE.then;
  let notThen = '';
  for (let i = 0; i < _then.length; i++) {
    notThen += `[^\\${_then[i]}]`;
  }

  const toReplace = [{
    command: `(${VARIABLE.not})\\s*\\(`,
    definition: '!('
  }, {
    command: VARIABLE.true,
    definition: 'true'
  }, {
    command: VARIABLE.false,
    definition: 'false'
  }, {
    command: VARIABLE.or,
    definition: '||'
  }, {
    command: VARIABLE.and1,
    definition: '&&'
  }, {
    command: VARIABLE.and2,
    definition: '&&'
  }, {
    command: `${VARIABLE.output}\\s+([^\\n\\r\\;]*)\\s*;`,
    definition: `output = $1;`
  }, {
    command: `${VARIABLE.if}\\s+([^\\r\\n]*[^\\${VARIABLE.then}])( ${VARIABLE.then})*`,
    definition: 'if ($1)'
  }, {
    command: `${VARIABLE.while}\\s+(.*)\\s*`,
    definition: 'while ($1)'
  }, {
    command: VARIABLE.else,
    definition: 'else'
  }, {
    command: VARIABLE.break,
    definition: 'break'
  }, {
    command: VARIABLE.continue,
    definition: 'continue'
  }, {
    command: `${VARIABLE.function} \\s*\\(([^\\n\\r\\;])\\)\\s*`,
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
