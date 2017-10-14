module.exports = [{
  group: 'restrictions',
  sources: [{
    title: 'if-else: wrong answer',
    code: "@input x\n@input y\nA = arctan((3 * x + 4) / (square(y) + 4)) + square_root(power(square(x), 3))\noutput A",
    inputs: [5,2],
    output: '${false}'
  }]
}];
