module.exports = [{
  group: 'restrictions',
  sources: [{
    title: 'if-else: wrong answer',
    code: 'input x\ninput y\nA=(x+y)*(x+power((square(x)+1),6)*sin(square(x)-3)-tan(y))\noutput A',
    inputs: [1, 2],
    output: '8.88440488015187'
  }]
}];
