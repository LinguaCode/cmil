module.exports = [{
  group: 'logic',
  sources: [{
    title: 'undefined variable',
    code: 'ելք X',
    errorId: 'undefinedVariable',
    errorParam: {
      variable: 'x',
      line: 1
    },
  }, {
    title: 'Big loop: overload',
    code: 'կրկնել 100000 անգամ\n    ելք 1010101010',
    errorId: 'timeout'
  }, {
    title: 'Infinity loop',
    code: 'մինչ 1 < 4\n    ելք 123',
    errorId: 'timeout'
  }]
}];