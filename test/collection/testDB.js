module.exports = [{
  group: 'restrictions',
  sources: [{
    title: 'variable',
    code: "input N\nA = 1\nB = 1\nC = 2\nwhile C <= N then\n    A = B\n    B = C\n    C = A + B\noutput C",
    inputs: [4],
    output: '617'
  }]
}];
