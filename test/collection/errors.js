module.exports = [{
  group: 'hy',
  sources: [{
    title: 'undefined variable',
    code: 'տպել X',
    status: 'The \\D+\\d* variable didn\'t defined.'
  }, {
    title: 'hack attempt',
    code: 'eval("console.log("hello world");")',
    status: 'Hack attempt. Your ".*" ip address was saved in the our database.'
  }, {
    group: 'wrong size of the indent',
    sources: [{
      title: 'error in 2nd line',
      code: 'եթե 1 < 2\n     տպել 617',
      status: 'Space error in 2 line.'
    }, {
      title: 'error in 3rd line',
      code: 'x = 12\nեթե 1 < 2\n     տպել 617',
      status: 'Space error in 3 line.'
    }]
  }, {
    title: 'Syntax error',
    code: 'տպել 1x',
    status: 'Syntax error'
  }, {
    title: 'Big loop: overload',
    code: 'կրկնել 100000 անգամ\n    տպել 1010101010',
    status: 'timeout'
  }, {
    title: 'Infinity loop',
    code: 'մինչ 1 < 4\n    տպել 123',
    status: 'timeout'
  }]
}];