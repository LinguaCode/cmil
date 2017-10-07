module.exports = [{
  group: 'restrictions',
  sources: [{
    title: 'if-else: wrong answer',
    code: "input x\ninput y\nA=(square(x)-4)/(square_root(y)+2)+power(2,sin(square_root(square(x)-1)))\noutput A",
    inputs: [1, 2],
    output: '8.88440488015187'
  }]
}];
