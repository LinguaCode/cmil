module.exports = [{
  group: 'restrictions',
  sources: [{
    title: 'if-else: wrong answer',
    code: "input a\ninput b\ninput c\nif a + b < 7 then\n    Y = square(ctg(square(a) + square(b) + c))\nelse\n    Y = power(10, -7)\noutput Y",
    inputs: [1, 2, 3],
    output: '8.88440488015187'
  }]
}];
