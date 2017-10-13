module.exports = [{
  group: 'restrictions',
  sources: [{
    title: 'if-else: wrong answer',
    code: "input a\ninput b\ninput x\nif a < 3  then\n    Y = power(e, cos(x + a +b)) * tan(a + square(b))\nelse\n    Y = log(3, 4 + square(a) + square(b))\noutput Y",
    inputs: [1,2,3],
    output: '${false}'
  }]
}];
