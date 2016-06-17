module.exports = [{
  name: 'hy',
  sources: [{
    name: '#output',
    sources: [{
      title: '#output: «text»',
      code: 'տպել «բարեւ»',
      output: 'բարեւ'
    }, {
      title: '#output: "text"',
      code: 'տպել "բարեւ"',
      output: 'բարեւ'
    }, {
      title: '#output: \'text\'',
      code: 'տպել \'բարեւ\'',
      output: 'բարեւ'
    }, {
      title: '#output: number',
      code: 'տպել 666',
      output: '666'
    }]
  }, {
    name: 'variables',
    sources: [{
      title: 'variable: declaration',
      code: 'X = 125',
      output: ''
    }, {
      title: 'variable: declaration',
      code: 'X = 125\nX = 3',
      output: ''
    }, {
      title: 'variable: declaration',
      code: 'X = 125\nx = 3',
      output: ''
    }, {
      title: 'variable: declaration',
      code: '\nX = 125\nx = 3',
      output: ''
    }, {
      title: 'variable: declaration',
      code: 'X = 125\nx = 3\n',
      output: ''
    }]
  }, {
    name: '#output; variables',
    sources: [{
      title: '#output: variable',
      code: 'X = 125\nտպել X',
      output: '125'
    }]
  }]
}];