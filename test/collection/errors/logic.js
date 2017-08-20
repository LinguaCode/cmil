module.exports = [{
  group: 'logic',
  sources: [{
    title: 'undefined variable',
    code: 'output X',
    errorId: 'undefinedVariable',
    errorParam: {
      variable: 'x',
      line: 1
    },
  }, {
    title: 'Big loop: overload',
    code: 'repeat 100000 times\n    output 1010101010',
    errorId: 'timeout'
  }, {
    title: 'Infinity loop',
    code: 'while 1 < 4\n    output 123',
    errorId: 'timeout'
  }]
}];