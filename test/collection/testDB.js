module.exports = [{
  group: 'restrictions',
  sources: [{
    title: 'if-else: wrong answer',
    code: "input x\ninput z\nif x>=1 and x<=7 then\n    Y=power(absolute_value(x)+2*absolute_value(z),1/4)+power(e, absolute_value(x+1))\nelse\n    Y=square(lg(power(x+z,7)))\noutput Y",
    inputs: [1, 2],
    output: '8.88440488015187'
  }]
}];
