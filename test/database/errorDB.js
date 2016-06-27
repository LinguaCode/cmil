module.exports = [{
  group: 'hy',
  sources: [/*{
    title: 'undefined variable',
    code: 'տպել X'
  }, */{
    title: 'hack attempt',
    code: 'eval("console.log("hello world");")',
    status: 'Hack attempt. Your ".*" ip address was saved in the our database.'
  }, {
    title: 'wrong size of the indent',
    code: 'եթե 1 < 2\n     տպել 617',
    status: 'Space error in \\d line.'
  }]
}];