module.exports = [{
  group: 'syntax',
  sources: [{
    group: 'wrong size of the indent',
    sources: [{
      title: 'error in 2nd line',
      code: 'if 1 < 2\n     output 617',
      errorId: 'indentError',
      errorParam: {
        line: 2
      },
    }, {
      title: 'error in 3rd line',
      code: 'x = 12\nif 1 < 2\n     output 617',
      errorId: 'indentError',
      errorParam: {
        line: 3
      },
    }]
  }, {
    title: 'Syntax error',
    code: 'output 1x',
    errorId: 'syntaxError'
  }, {
    title: 'Function argument scope error',
    code: 'a = square(5\noutput a',
    errorId: 'functionArgumentSyntaxError',
    errorParam: {
      line: 1
    },
  }]
}];