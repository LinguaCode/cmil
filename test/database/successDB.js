module.exports = [{
  group: 'etc',
  sources: [{
    title: 'empty'
  }]
}, {
  group: 'hy',
  sources: [{
    group: 'output',
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
    }, {
      title: 'output: 2 quote symbol in single quited text',
      code: 'տպել \'"տեքստ"\'',
      output: '"տեքստ"'
    }]
  }, {
    group: 'input',
    sources: [{
      title: 'variable',
      code: 'գրել X',
      inputs: [617]
    }, {
      title: '2 variables',
      code: 'գրել X\nգրել Y',
      inputs: [617, 2]
    }, {
      title: 'text input',
      code: 'գրել անուն',
      inputs: ["Ջոն"]
    }]
  }, {
    group: 'output; input',
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
    group: 'output; operations',
    sources: [{
      group: 'numbers',
      sources: [{
        group: 'types',
        sources: [{
          title: '*',
          code: 'տպել 617 * 2',
          output: '1234'
        }, {
          title: '/',
          code: 'տպել 1234 / 2',
          output: '617'
        }, {
          title: '+',
          code: 'տպել 617 + 617',
          output: '1234'
        }, {
          title: '-',
          code: 'տպել 1234 - 617',
          output: '617'
        }]
      }, {
        title: 'output: multiple operations',
        code: 'տպել 1 + 2 * 3 - 4',
        output: '3'
      }, {
        title: 'output: multiple operations; scopes',
        code: 'տպել (1 + 2) * (3 - 4)',
        output: '-3'
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
    group: 'comments',
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
    group: 'output; comments',
    sources: [{
      title: 'comment in new line and output',
      code: '# comment\nտպել 123',
      output: '123'
    }, {
      title: 'comment in the same line with output',
      code: 'տպել 123 # 123',
      output: '123'
    }, {
      title: '2 outputs which first was commented',
      code: '# տպել 123\nտպել 321',
      output: '321'
    }]
  }, {
    group: 'conditions',
    sources: [{
      title: 'if: with tail',
      code: 'եթե 4 > 2 ապա\n    տպել «4 > 2»',
      output: '4 > 2'
    }, {
      title: 'if: without tail',
      code: 'եթե 4 > 2\n    տպել «4 > 2»',
      output: '4 > 2'
    }, {
      title: 'if: wrong result',
      code: 'եթե 4 > 6\n    տպել «4 > 6»'
    }, {
      title: 'if-else: right answer',
      code: 'եթե 4 > 2\n    տպել «4 > 2»\nայլապես\n    տպել «2 >= 4»',
      output: '4 > 2'
    }, {
      title: 'if-else: wrong answer',
      code: 'եթե 4 > 6\n    տպել «4 > 6»\nայլապես\n    տպել «6 >= 4»',
      output: '6 >= 4'
    }, {
      title: 'else-if-else: 1st condition was right',
      code: 'եթե 4 > 2\n    տպել «4 > 2»\nայլապես եթե 4 > 6\n    տպել «4 > 6»\nայլապես\n    տպել «4 == 4»',
      output: '4 > 2'
    }, {
      title: 'else-if-else: 2st condition was right',
      code: 'եթե 4 > 6\n    տպել «4 > 6»\nայլապես եթե 4 > 2\n    տպել «4 > 2»\nայլապես\n    տպել «4 == 4»',
      output: '4 > 2'
    }, {
      title: 'else-if-else: 3st condition was right',
      code: 'եթե 4 > 6\n    տպել «4 > 6»\nայլապես եթե 4 == 2\n    տպել «4 == 4»\nայլապես\n    տպել «4 > 2»',
      output: '4 > 2'
    }]
  }, {
    group: 'output; boolean',
    sources: [{
      group: 'operators',
      sources: [{
        group: 'condition',
        sources: [{
          title: '>',
          code: 'տպել 4 > 2',
          output: 'ճիշտ'
        }, {
          title: '<',
          code: 'տպել 2 < 4',
          output: 'ճիշտ'
        }, {
          title: '==',
          code: 'տպել 4 == 4',
          output: 'ճիշտ'
        }, {
          title: '>=',
          code: 'տպել 4 >= 2',
          output: 'ճիշտ'
        }, {
          title: '<=',
          code: 'տպել 2 <= 4',
          output: 'ճիշտ'
        }, {
          title: '!=',
          code: 'տպել 4 != 2',
          output: 'ճիշտ'
        }, {
          title: 'not()',
          code: 'տպել ոչ(4 < 2)',
          output: 'ճիշտ'
        }]
      }, {
        group: 'boolean',
        sources: [{
          title: 'AND: true result',
          code: 'տպել 4 > 2 և 4 != 2',
          output: 'ճիշտ'
        }, {
          title: 'AND: false result',
          code: 'տպել 4 > 2 և 4 == 2',
          output: 'սխալ'
        }, {
          title: 'OR: true result',
          code: 'տպել 4 > 2 կամ 4 == 2',
          output: 'ճիշտ'
        }, {
          title: 'OR: false result',
          code: 'տպել 4 < 2 կամ 4 == 2',
          output: 'սխալ'
        }]
      }]
    }, {
      title: 'true value',
      code: 'տպել ճիշտ',
      output: 'ճիշտ'
    }, {
      title: 'false value',
      code: 'տպել սխալ',
      output: 'սխալ'
    }, {
      title: 'true condition',
      code: 'տպել 4 > 2',
      output: 'ճիշտ'
    }, {
      title: 'false condition',
      code: 'տպել 4 < 2',
      output: 'սխալ'
    }, {
      title: 'and: result: true',
      code: 'տպել ճիշտ և ճիշտ',
      output: 'ճիշտ'
    }, {
      title: 'and։ result: false',
      code: 'տպել ճիշտ և սխալ',
      output: 'սխալ'
    }, {
      title: 'or։ result: true',
      code: 'տպել ճիշտ կամ սխալ',
      output: 'ճիշտ'
    }, {
      title: 'or։ result: false',
      code: 'տպել սխալ կամ սխալ',
      output: 'սխալ'
    }, {
      title: 'mixed',
      code: 'տպել 5 < 1 և (1 < 7 կամ (1 >= 3 կամ 9 == 9))',
      output: 'սխալ'
    }]
  }, {
    group: 'loops',
    sources: [
      {
        title: 'while-do',
        code: 'a = 0\nմինչ a < 5\n    տպել a\n    a = a + 1',
        output: '0\n1\n2\n3\n4'
      }, {
        title: 'do-while',
        code: 'a = 0\nկատարել\n    տպել a\n    a = a + 1\nմինչ a < 5',
        output: '0\n1\n2\n3\n4'
      }, {
        title: 'repeat',
        code: 'a = 0\nկրկնել 5 անգամ\n    տպել a\n    a = a + 1\n',
        output: '0\n1\n2\n3\n4'
      }]
  }]
}];