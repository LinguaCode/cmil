module.exports = [{
  title: 'empty'
}, {
  name: 'hy',
  sources: [{
    name: 'output',
    sources: [{
      title: 'output: «text»',
      code: 'տպել «բարեւ»',
      output: 'բարեւ'
    }, {
      title: 'output: "text"',
      code: 'տպել "բարեւ"',
      output: 'բարեւ'
    }, {
      title: 'output: \'text\'',
      code: 'տպել \'բարեւ\'',
      output: 'բարեւ'
    }, {
      title: '2 outputs',
      code: 'տպել «բարեւ»\nտպել «աշխարհ»',
      output: 'բարեւ\nաշխարհ'
    }, {
      title: 'output: case insensitivity',
      code: 'ՏպեԼ «բարեւ»',
      output: 'բարեւ'
    }, {
      title: 'output: number',
      code: 'տպել 666',
      output: '666'
    }, {
      title: 'output: variable',
      code: 'X = 125\nտպել X',
      output: '125'
    }, {
      title: 'output: variable: case insensitivity',
      code: 'X = 125\nտպել X',
      output: '125'
    }]
  }, {
    name: 'output; input',
    sources: [{
      title: 'variable',
      code: 'գրել X\nտպել X',
      inputs: [617],
      output: '617'
    }, {
      title: '2 variables',
      code: 'գրել X\nգրել Y\nտպել X * Y',
      inputs: [617, 2],
      output: '1234'
    }]
  }, {
    name: 'input',
    sources: [{
      title: 'variable',
      code: 'գրել X',
      inputs: [617]
    }, {
      title: '2 variables',
      code: 'գրել X\nգրել Y',
      inputs: [617, 2]
    }]
  }, {
    name: 'output; operations',
    sources: [{
      name: 'numbers',
      sources: [{
        title: 'output: multiply',
        code: 'տպել 617 * 2',
        output: '1234'
      }, {
        title: 'output: divide',
        code: 'տպել 1234 / 2',
        output: '617'
      }, {
        title: 'output: summarize',
        code: 'տպել 617 + 617',
        output: '1234'
      }, {
        title: 'output: multiply',
        code: 'տպել 1234 - 617',
        output: '617'
      }]
    }, {
      title: 'texts',
      code: 'տպել «lambs: » + "empty"',
      output: 'lambs: empty'
    }, {
      title: 'variables',
      code: 'Y = 2\nX = 617\nտպել Y * X',
      output: '1234'
    }, {
      title: 'number and text',
      code: 'տպել «lambs: » + 617',
      output: 'lambs: 617'
    }, {
      title: 'variable and text',
      code: 'X = 617\nտպել «lambs: » + X',
      output: 'lambs: 617'
    }, {
      title: 'variable and number',
      code: 'X = 617\nտպել 2 * X',
      output: '1234'
    }]
  }, {
    name: 'comments',
    sources: [{
      title: 'comments: single',
      code: '# comment comment comment'
    }, {
      title: 'comments: double',
      code: '# comment\n# comment'
    }, {
      title: 'comments: multiple',
      code: '# comment\n# comment\n# comment'
    }]
  }, {
    name: 'output; comments',
    sources: [{
      title: 'comment and 2 outputs',
      code: '# comment\nտպել 123\nտպել 321',
      output: '123\n321'
    }, {
      title: '2 outputs which first was commented',
      code: '# տպել 123\nտպել 321',
      output: '321'
    }]
  }]
}];