module.exports = [{
  group: 'commands',
  sources: [{
    group: 'etc',
    sources: [{
      title: 'empty',
    }, {
      title: '"" + 1',
      code: 'output "" + 1',
      output: '1'
    }]
  }, {
    group: 'output',
    sources: [{
      title: 'output: «text»',
      code: 'output «բարեւ»',
      output: 'բարեւ'
    }, {
      title: 'output: "text"',
      code: 'output "բարեւ"',
      output: 'բարեւ'
    }, {
      title: 'output: \'text\'',
      code: 'output \'բարեւ\'',
      output: 'բարեւ'
    }, {
      title: '2 outputs',
      code: 'output «բարեւ»\noutput «աշխարհ»',
      output: 'բարեւ\nաշխարհ'
    }, {
      title: 'output: case insensitivity',
      code: 'output «բարեւ»',
      output: 'բարեւ'
    }, {
      title: 'output: number',
      code: 'output 666',
      output: '666'
    }, {
      title: 'output: variable',
      code: 'X = 125\noutput X',
      output: '125'
    }, {
      title: 'output: variable: case insensitivity',
      code: 'X = 125\noutput X',
      output: '125'
    }, {
      group: 'quotes in quotes',
      sources: [{
        title: '\'text»\'',
        code: 'output \'տեքստ»\'',
        output: 'տեքստ»'
      }, {
        title: '"text»"',
        code: 'output "տեքստ»"',
        output: 'տեքստ»'
      }, {
        title: '\'«text»\'',
        code: 'output \'«տեքստ»\'',
        output: '«տեքստ»'
      }, {
        title: '"«text»"',
        code: 'output "«տեքստ»"',
        output: '«տեքստ»'
      }, {
        group: 'inner scopes',
        sources: [{
          group: '«inner scopes»',
          sources: [{
            group: 'single scope',
            sources: [{
              title: '«text_1 \'text_2»',
              code: 'output «text_1 \'text_2»',
              output: 'text_1 \'text_2'
            }, {
              title: '«text_1 "text_2»',
              code: 'output «text_1 "text_2»',
              output: 'text_1 "text_2'
            }, {
              title: '«text_1 \\»text_2»',
              code: 'output «text_1 \\»text_2»',
              output: 'text_1 »text_2'
            }, {
              title: '«text_1 \\«text_2»',
              code: 'output «text_1 \\«text_2»',
              output: 'text_1 «text_2'
            }]
          }, {
            group: 'double scope',
            sources: [{
              title: '«text_1 \'text_2\' text_3»',
              code: 'output «text_1 \'text_2\' text_3»',
              output: 'text_1 \'text_2\' text_3'
            }, {
              title: '«text_1 "text_2" text_3»',
              code: 'output «text_1 "text_2" text_3»',
              output: 'text_1 "text_2" text_3'
            }, {
              title: '«text_1 \\»text_2\\» text_3»',
              code: 'output «text_1 \\»text_2\\» text_3»',
              output: 'text_1 »text_2» text_3'
            }, {
              title: '«text_1 \\«text_2\\« text_3»',
              code: 'output «text_1 \\«text_2\\« text_3»',
              output: 'text_1 «text_2« text_3'
            }, {
              title: '«text_1 \\«text_2\\» text_3»',
              code: 'output «text_1 \\«text_2\\» text_3»',
              output: 'text_1 «text_2» text_3'
            }, {
              title: '\'text_1 «text_2» «text_3» text_3\' ',
              code: 'output \'text_1 «text_2» «text_3» text_3\'',
              output: 'text_1 «text_2» «text_3» text_3'
            }, {
              title: '\'text_1 «text_2» and «text_3» text_3\' ',
              code: 'output \'text_1 «text_2» and «text_3» text_3\'',
              output: 'text_1 «text_2» and «text_3» text_3'
            }]
          }]
        }, {
          group: '"inner scopes"',
          sources: [{
            group: 'single scope',
            sources: [{
              title: '"text_1 \'text_2"',
              code: 'output "text_1 \'text_2"',
              output: 'text_1 \'text_2'
            }, {
              title: '"text_1 \\"text_2"',
              code: 'output "text_1 \\"text_2"',
              output: 'text_1 "text_2'
            }, {
              title: '"text_1 »text_2"',
              code: 'output "text_1 »text_2"',
              output: 'text_1 »text_2'
            }, {
              title: '"text_1 «text_2"',
              code: 'output "text_1 «text_2"',
              output: 'text_1 «text_2'
            }]
          }, {
            group: 'double scope',
            sources: [{
              title: '"text_1 \'text_2\' text_3"',
              code: 'output "text_1 \'text_2\' text_3"',
              output: 'text_1 \'text_2\' text_3'
            }, {
              title: '"text_1 \\"text_2\\" text_3"',
              code: 'output "text_1 \\"text_2\\" text_3"',
              output: 'text_1 "text_2" text_3'
            }, {
              title: '"text_1 »text_2» text_3"',
              code: 'output "text_1 »text_2» text_3"',
              output: 'text_1 »text_2» text_3'
            }, {
              title: '"text_1 «text_2« text_3"',
              code: 'output "text_1 «text_2« text_3"',
              output: 'text_1 «text_2« text_3'
            }, {
              title: '"text_1 «text_2» text_3"',
              code: 'output "text_1 «text_2» text_3"',
              output: 'text_1 «text_2» text_3'
            }]
          }]
        }, {
          group: '\'inner scopes\'',
          sources: [{
            group: 'single scope',
            sources: [{
              title: '\'text_1 \\\'text_2\'',
              code: 'output \'text_1 \\\'text_2\'',
              output: 'text_1 \'text_2'
            }, {
              title: '\'text_1 "text_2\'',
              code: 'output \'text_1 \\"text_2\'',
              output: 'text_1 "text_2'
            }, {
              title: '\'text_1 »text_2\'',
              code: 'output \'text_1 »text_2\'',
              output: 'text_1 »text_2'
            }, {
              title: '\'text_1 «text_2\'',
              code: 'output \'text_1 «text_2\'',
              output: 'text_1 «text_2'
            }]
          }, {
            group: 'double scope',
            sources: [{
              title: '\'text_1 \\\'text_2\\\' text_3\'',
              code: 'output \'text_1 \\\'text_2\\\' text_3\'',
              output: 'text_1 \'text_2\' text_3'
            }, {
              title: '\'text_1 "text_2" text_3\'',
              code: 'output \'text_1 "text_2" text_3\'',
              output: 'text_1 "text_2" text_3'
            }, {
              title: '\'text_1 »text_2» text_3\'',
              code: 'output \'text_1 »text_2» text_3\'',
              output: 'text_1 »text_2» text_3'
            }, {
              title: '\'text_1 «text_2« text_3\'',
              code: 'output \'text_1 «text_2« text_3\'',
              output: 'text_1 «text_2« text_3'
            }, {
              title: '\'text_1 «text_2» text_3\'',
              code: 'output \'text_1 «text_2» text_3\'',
              output: 'text_1 «text_2» text_3'
            }]
          }]
        }]
      }]
    }]
  }, {
    group: 'input',
    sources: [{
      title: 'variable',
      code: 'input X',
      inputs: [617]
    }, {
      title: '2 variables',
      code: 'input X\ninput Y',
      inputs: [617, 2]
    }, {
      title: 'text input',
      code: 'input անուն',
      inputs: ["Ջոն"]
    }]
  }, {
    group: 'output; input',
    sources: [{
      title: 'variable',
      code: 'input X\noutput X',
      inputs: [617],
      output: '617'
    }, {
      title: '2 variables',
      code: 'input X\ninput Y\noutput X * Y',
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
          code: 'output 617 * 2',
          output: '1234'
        }, {
          title: '/',
          code: 'output 1234 / 2',
          output: '617'
        }, {
          title: '+',
          code: 'output 617 + 617',
          output: '1234'
        }, {
          title: '-',
          code: 'output 1234 - 617',
          output: '617'
        }]
      }, {
        title: 'output: multiple operations',
        code: 'output 1 + 2 * 3 - 4',
        output: '3'
      }, {
        title: 'output: multiple operations; scopes',
        code: 'output (1 + 2) * (3 - 4)',
        output: '-3'
      }]
    }, {
      title: 'texts',
      code: 'output «lambs: » + "empty"',
      output: 'lambs: empty'
    }, {
      title: 'variables',
      code: 'Y = 2\nX = 617\noutput Y * X',
      output: '1234'
    }, {
      title: 'number and text',
      code: 'output «lambs: » + 617',
      output: 'lambs: 617'
    }, {
      title: 'variable and text',
      code: 'X = 617\noutput «lambs: » + X',
      output: 'lambs: 617'
    }, {
      title: 'variable and number',
      code: 'X = 617\noutput 2 * X',
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
      code: '# comment\noutput 123',
      output: '123'
    }, {
      title: 'comment in the same line with output',
      code: 'output 123 # 123',
      output: '123'
    }, {
      title: '2 outputs which first was commented',
      code: '# output 123\noutput 321',
      output: '321'
    }]
  }, {
    group: 'conditions',
    sources: [{
      title: 'if: with tail',
      code: 'if 4 > 2 then\n    output «4 > 2»',
      output: '4 > 2'
    }, {
      title: 'if: without tail',
      code: 'if 4 > 2\n    output «4 > 2»',
      output: '4 > 2'
    }, {
      title: 'if: wrong result',
      code: 'if 4 > 6\n    output «4 > 6»'
    }, {
      title: 'if: consecutive: 2',
      code: 'if 4 > 2\n    output «a»\nif 4 > 2\n    output «b»',
      output: 'a\nb'
    }, {
      title: 'if: consecutive: 3',
      code: 'if 4 > 2\n    output «a»\nif 4 > 2\n    output «b»\nif 4 > 2\n    output «c»',
      output: 'a\nb\nc'
    }, {
      title: 'if: content: consecutive: 2',
      code: 'if 4 > 2\n    output «a»\n    output «b»',
      output: 'a\nb'
    }, {
      title: 'if: content: consecutive: 3',
      code: 'if 4 > 2\n    output «a»\n    output «b»\n    output «c»',
      output: 'a\nb\nc'
    }, {
      title: 'if-else: right answer',
      code: 'if 4 > 2\n    output «4 > 2»\nelse\n    output «2 >= 4»',
      output: '4 > 2'
    }, {
      title: 'if-else: wrong answer',
      code: 'if 4 > 6\n    output «4 > 6»\nelse\n    output «6 >= 4»',
      output: '6 >= 4'
    }, {
      group: 'else-if-else',
      sources: [{
        title: 'true: 1st condition',
        code: 'if 4 > 2\n    output «4 > 2»\nelse if 4 > 6\n    output «4 > 6»\nelse\n    output «4 == 4»',
        output: '4 > 2'
      }, {
        title: 'true: 2st condition',
        code: 'if 4 > 6\n    output «4 > 6»\nelse if 4 > 2\n    output «4 > 2»\nelse\n    output «4 == 4»',
        output: '4 > 2'
      }, {
        title: 'true: 3st condition',
        code: 'if 4 > 6\n    output «4 > 6»\nelse if 4 == 2\n    output «4 == 4»\nelse\n    output «4 > 2»',
        output: '4 > 2'
      }]
    }, {
      group: 'recursively: 1 level: if',
      sources: [{
        title: 'if (true): if (true): output',
        code: 'if 4 > 2\n    if 4 > 2\n    output "xD"',
        output: 'xD'
      }, {
        title: 'if (true): output, if (true): output',
        code: 'if 4 > 2\n    output "a"\n    if 4 > 2\n        output "b"',
        output: 'a\nb'
      }, {
        title: 'if (true): output, if (false): output',
        code: 'if 4 > 2\n    output "a"\n    if 4 < 2\n        output "b"',
        output: 'a'
      }, {
        title: 'if (true): if (false): output',
        code: 'if 4 > 2\n    if 4 < 2\n        output "xD"'
      }, {
        title: 'if (false): if (true): output',
        code: 'if 4 < 2\n    if 4 > 2\n        output "xD"'
      }]
    }]
  }, {
    group: 'output; boolean',
    sources: [{
      group: 'operators',
      sources: [{
        group: 'condition',
        sources: [{
          title: '>',
          code: 'output 4 > 2',
          output: '${true}'
        }, {
          title: '<',
          code: 'output 2 < 4',
          output: '${true}'
        }, {
          title: '==',
          code: 'output 4 == 4',
          output: '${true}'
        }, {
          title: '>=',
          code: 'output 4 >= 2',
          output: '${true}'
        }, {
          title: '<=',
          code: 'output 2 <= 4',
          output: '${true}'
        }, {
          title: '!=',
          code: 'output 4 != 2',
          output: '${true}'
        }, {
          title: 'not()',
          code: 'output not(4 < 2)',
          output: '${true}'
        }]
      }, {
        group: 'boolean',
        sources: [{
          title: 'AND: true result',
          code: 'output 4 > 2 and 4 != 2',
          output: '${true}'
        }, {
          title: 'AND: false result',
          code: 'output 4 > 2 and 4 == 2',
          output: '${false}'
        }, {
          title: 'OR: true result',
          code: 'output 4 > 2 or 4 == 2',
          output: '${true}'
        }, {
          title: 'OR: false result',
          code: 'output 4 < 2 or 4 == 2',
          output: '${false}'
        }]
      }]
    }, {
      title: 'true value',
      code: 'output true',
      output: '${true}'
    }, {
      title: 'false value',
      code: 'output false',
      output: '${false}'
    }, {
      title: 'true condition',
      code: 'output 4 > 2',
      output: '${true}'
    }, {
      title: 'false condition',
      code: 'output 4 < 2',
      output: '${false}'
    }, {
      title: 'and: result: true',
      code: 'output true and true',
      output: '${true}'
    }, {
      title: 'and։ result: false',
      code: 'output true and false',
      output: '${false}'
    }, {
      title: 'or։ result: true',
      code: 'output true or false',
      output: '${true}'
    }, {
      title: 'or։ result: false',
      code: 'output false or false',
      output: '${false}'
    }, {
      title: 'mixed',
      code: 'output 5 < 1 and (1 < 7 or (1 >= 3 or 9 == 9))',
      output: '${false}'
    }]
  }, {
    group: 'loops',
    sources: [{
      group: 'while-do',
      sources: [{
        title: '5 attempts',
        code: 'a = 0\nwhile a < 5\n    output a\n    a = a + 1',
        output: '0\n1\n2\n3\n4'
      }, {
        title: '4 attempts: {if: true}',
        code: 'b = 1\nwhile b < 4\n    if b == 2\n        output "asdasd"\n    b = b + 1',
        output: 'asdasd'
      }, {
        title: '0 attempts',
        code: 'a = 0\nwhile a > 5\n    output a\n    a = a + 1'
      }]
    }, {
      group: 'do-while',
      sources: [{
        title: '5 attempts',
        code: 'a = 0\ndo\n    output a\n    a = a + 1\nwhile a < 5',
        output: '0\n1\n2\n3\n4'
      }, {
        title: '1 attempt',
        code: 'a = 0\ndo\n    output a\n    a = a + 1\nwhile a > 5',
        output: '0'
      }, {
        title: 'do-while {output; input}; do-while {output; input}; output',
        code: 'do\n    output "Մուտքագրեք գաղտնանունը՝"\n    input գաղտնանուն\nwhile գաղտնանուն != "root"\n\ndo\n    output "Մուտքագրեք գաղտնաբառը՝"\n    input գաղտնաբառ\nwhile գաղտնաբառ != "toor"\n\noutput "Դուք հաջողությամբ input եք գործել ։)"',
        inputs: ['root', 'toor'],
        output: 'Մուտքագրեք գաղտնանունը՝\nՄուտքագրեք գաղտնաբառը՝\nԴուք հաջողությամբ input եք գործել ։)',
      }, {
        title: 'do-while {output; input}; do-while {output; input}; output (first input error)',
        code: 'do\n    output "Մուտքագրեք գաղտնանունը՝"\n    input գաղտնանուն\nwhile գաղտնանուն != "root"\n\ndo\n    output "Մուտքագրեք գաղտնաբառը՝"\n    input գաղտնաբառ\nwhile գաղտնաբառ != "toor"\n\noutput "Դուք հաջողությամբ input եք գործել ։)"',
        inputs: ['login', 'root', 'toor'],
        output: 'Մուտքագրեք գաղտնանունը՝\nՄուտքագրեք գաղտնանունը՝\nՄուտքագրեք գաղտնաբառը՝\nԴուք հաջողությամբ input եք գործել ։)',
      }]
    }, {
      group: 'repeat',
      sources: [{
        title: 'repeat 0x',
        code: 'repeat 0 times\n    output "a"'
      }, {
        title: 'repeat 1x',
        code: 'repeat 1 times\n    output "a"',
        output: 'a'
      }, {
        title: 'repeat 5x',
        code: 'repeat 5 times\n    output "a"',
        output: 'a\na\na\na\na'
      }, {
        title: 'input; repeat 2x',
        code: 'input X\nrepeat 2 times\n    output X',
        inputs: ['a'],
        output: 'a\na'
      }, {
        title: 'repeat 2x; input;',
        code: 'repeat 2 times\n    output "a"\ninput X\noutput X',
        inputs: ['X'],
        output: 'a\na\nX'
      }, {
        title: 'repeat 2x; repeat 3x;',
        code: 'repeat 2 times\n    output "a"\nrepeat 3 times\n    output "b"',
        output: 'a\na\nb\nb\nb'
      }, {
        title: 'repeat 2x; input',
        code: 'repeat 2 times\n    output "a"\ninput X',
        inputs: ['X'],
        output: 'a\na'
      }, {
        title: 'repeat 2x; input; output',
        code: 'repeat 2 times\n    output "a"\ninput X\noutput X',
        inputs: ['X'],
        output: 'a\na\nX'
      }, {
        title: 'repeat 1x {input; output}',
        code: 'repeat 1 times\n    input N\n    output N',
        inputs: [617],
        output: '617'
      }, {
        title: 'repeat 5x {input; output}',
        code: 'repeat 5 times\n    input N\n    output N',
        inputs: [617, 2, 1, 2, 3],
        output: '617\n2\n1\n2\n3'
      }, {
        title: 'repeat 5x {input}',
        code: 'repeat 5 times\n    input N',
        inputs: [617, 2, 1, 2, 3]
      }, {
        group: 'recursively: 1 level: repeat',
        sources: [{
          title: '0x1 attempts',
          code: 'repeat 0 times\n    repeat 1 times\n        output "a"'
        }, {
          title: '1x1 attempts',
          code: 'repeat 1 times\n    repeat 1 times\n        output "a"',
          output: 'a'
        }, {
          title: '1x0 attempts',
          code: 'repeat 1 times\n    repeat 0 times\n        output "a"'
        }, {
          title: '1x2 attempts',
          code: 'repeat 1 times\n    repeat 2 times\n        output "a"',
          output: 'a\na'
        }, {
          title: '2x1 attempts',
          code: 'repeat 2 times\n    repeat 1 times\n        output "a"',
          output: 'a\na'
        }, {
          title: '2x0 attempts',
          code: 'repeat 2 times\n    repeat 0 times\n        output "a"'
        }]
      }, {
        group: 'recursively: 2 level: repeat',
        sources: [{
          title: '1x1x1 attempts',
          code: 'repeat 1 times\n    repeat 1 times\n        repeat 1 times\n            output "a"',
          output: 'a'
        }, {
          title: '1x2x3 attempts',
          code: 'repeat 1 times\n    repeat 2 times\n        repeat 3 times\n            output "a"',
          output: 'a\na\na\na\na\na'
        }, {
          title: '3x2x1 attempts',
          code: 'repeat 1 times\n    repeat 2 times\n        repeat 3 times\n            output "a"',
          output: 'a\na\na\na\na\na'
        }, {
          title: '3x2x1 attempts with complexity (outputs)',
          code: 'repeat 1 times\n    output "X"\n    repeat 2 times\n        output "Y"\n        repeat 3 times\n            output "a"\noutput "Z"',
          output: 'X\nY\na\na\na\nY\na\na\na\nZ'
        }]
      }]
    }]
  }, {
    group: 'math',
    sources: [{
      title: 'pow',
      code: 'X = 2\nY = 5\nZ = power(X,Y)\noutput Z',
      output: '32'
    }, {
      title: 'sqrt',
      code: 'X = 9\nZ = square_root(X)\noutput Z',
      output: '3'
    }, {
      title: 'sqr',
      code: 'X = 9\nZ = square(X)\noutput Z',
      output: '81'
    }, {
      title: 'round',
      code: 'X = 2.5\nZ = round(X)\noutput Z',
      output: '3'
    }, {
      title: 'floor',
      code: 'X = 3.5\nZ = floor(X)\noutput Z',
      output: '3'
    }, {
      title: 'log',
      code: 'X = 2\nY = 64\nZ = log(X,Y)\noutput Z',
      output: '6'
    }, {
      title: 'lg',
      code: 'X = 1000\nZ = lg(X)\noutput Z',
      output: '3'
    }, {
      title: 'ln',
      code: 'X = 5\nZ = ln(5)\noutput Z',
      output: '1.6094379124341003'
    }, {
      title: 'ceil',
      code: 'X = 3.4\nZ = ceil(X)\noutput Z',
      output: '4'
    }, {
      title: 'abs',
      code: 'X = -5\nZ = absolute_value(X)\noutput Z',
      output: '5'
    }, {
      title: 'sin',
      code: 'X = 1\nZ = sin(X)\noutput Z',
      output: '0.8414709848'
    }, {
      title: 'cos',
      code: 'X = 1\nZ = cos(X)\noutput Z',
      output: '0.5403023059'
    }, {
      title: 'tan',
      code: 'X = 1\nZ = tan(X)\noutput Z',
      output: '1.5574077247'
    }, {
      title: 'ctg',
      code: 'X = 1\nZ = ctg(X)\noutput Z',
      output: '0.6420926159157376'
    }, {
      title: 'arcsin',
      code: 'X = 1\nZ = arcsin(X)\noutput Z',
      output: '1.5707963267948966'
    }, {
      title: 'arccos',
      code: 'X = 0.5\nZ = arccos(X)\noutput Z',
      output: '1.0471975511965979'
    }, {
      title: 'arctan',
      code: 'X = 1\nZ = arctan(X)\noutput Z',
      output: '0.7853981633974483'
    }, {
      title: 'arcctg',
      code: 'X = 0.5\nZ = arcctg(X)\noutput Z',
      output: '1.1071487177940904'
    }, {
      title: 'random: single argument',
      code: 'X = 1000\nZ = random(X)\noutput Z >= 0 and Z <= 1000',
      output: '${true}'
    }, {
      title: 'random: double argument',
      code: 'X = 1000\nY = 1005\nZ = random(X,Y)\noutput Z >= 1000 and Z <= 1005',
      output: '${true}'
    }, {
      title: 'pi',
      code: 'output pi',
      output: '3.141592653589793'
    }, {
      title: 'e',
      code: 'output e',
      output: '2.718281828459045'
    }]
  }]
}];