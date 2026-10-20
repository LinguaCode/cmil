import type {Source} from '../types.ts';

const sources: Source[] = [
  {
    group: 'commands',
    sources: [
      {
        group: 'etc',
        sources: [
          {
            title: 'empty'
          },
          {
            title: '"" + 1',
            code: 'print "" + 1',
            output: '1'
          },
          {
            title: 'boolean words in text stay text',
            code: 'print "it is true that null is nothing"',
            output: 'it is true that null is nothing'
          },
          {
            title: 'boolean joined into text',
            code: 'print "x: " + (5 > 3)',
            output: 'x: true'
          }
        ]
      },
      {
        group: 'output',
        sources: [
          {
            title: 'output: «text»',
            code: 'print «բարեւ»',
            output: 'բարեւ'
          },
          {
            title: 'output: "text"',
            code: 'print "բարեւ"',
            output: 'բարեւ'
          },
          {
            title: "output: 'text'",
            code: "print 'բարեւ'",
            output: 'բարեւ'
          },
          {
            title: '2 outputs',
            code: 'print «բարեւ»\nprint «աշխարհ»',
            output: 'բարեւ\nաշխարհ'
          },
          {
            title: 'output: case insensitivity',
            code: 'print «բարեւ»',
            output: 'բարեւ'
          },
          {
            title: 'output: number',
            code: 'print 666',
            output: '666'
          },
          {
            title: 'output: variable',
            code: 'X = 125\nprint X',
            output: '125'
          },
          {
            title: 'output: variable: case insensitivity',
            code: 'X = 125\nprint X',
            output: '125'
          },
          {
            group: 'quotes in quotes',
            sources: [
              {
                title: "'text»'",
                code: "print 'տեքստ»'",
                output: 'տեքստ»'
              },
              {
                title: '"text»"',
                code: 'print "տեքստ»"',
                output: 'տեքստ»'
              },
              {
                title: "'«text»'",
                code: "print '«տեքստ»'",
                output: '«տեքստ»'
              },
              {
                title: '"«text»"',
                code: 'print "«տեքստ»"',
                output: '«տեքստ»'
              },
              {
                group: 'inner scopes',
                sources: [
                  {
                    group: '«inner scopes»',
                    sources: [
                      {
                        group: 'single scope',
                        sources: [
                          {
                            title: "«text_1 'text_2»",
                            code: "print «text_1 'text_2»",
                            output: "text_1 'text_2"
                          },
                          {
                            title: '«text_1 "text_2»',
                            code: 'print «text_1 "text_2»',
                            output: 'text_1 "text_2'
                          },
                          {
                            title: '«text_1 \\»text_2»',
                            code: 'print «text_1 \\»text_2»',
                            output: 'text_1 »text_2'
                          },
                          {
                            title: '«text_1 \\«text_2»',
                            code: 'print «text_1 \\«text_2»',
                            output: 'text_1 «text_2'
                          }
                        ]
                      },
                      {
                        group: 'double scope',
                        sources: [
                          {
                            title: "«text_1 'text_2' text_3»",
                            code: "print «text_1 'text_2' text_3»",
                            output: "text_1 'text_2' text_3"
                          },
                          {
                            title: '«text_1 "text_2" text_3»',
                            code: 'print «text_1 "text_2" text_3»',
                            output: 'text_1 "text_2" text_3'
                          },
                          {
                            title: '«text_1 \\»text_2\\» text_3»',
                            code: 'print «text_1 \\»text_2\\» text_3»',
                            output: 'text_1 »text_2» text_3'
                          },
                          {
                            title: '«text_1 \\«text_2\\« text_3»',
                            code: 'print «text_1 \\«text_2\\« text_3»',
                            output: 'text_1 «text_2« text_3'
                          },
                          {
                            title: '«text_1 \\«text_2\\» text_3»',
                            code: 'print «text_1 \\«text_2\\» text_3»',
                            output: 'text_1 «text_2» text_3'
                          },
                          {
                            title: "'text_1 «text_2» «text_3» text_3' ",
                            code: "print 'text_1 «text_2» «text_3» text_3'",
                            output: 'text_1 «text_2» «text_3» text_3'
                          },
                          {
                            title: "'text_1 «text_2» and «text_3» text_3' ",
                            code: "print 'text_1 «text_2» and «text_3» text_3'",
                            output: 'text_1 «text_2» and «text_3» text_3'
                          }
                        ]
                      }
                    ]
                  },
                  {
                    group: '"inner scopes"',
                    sources: [
                      {
                        group: 'single scope',
                        sources: [
                          {
                            title: '"text_1 \'text_2"',
                            code: 'print "text_1 \'text_2"',
                            output: "text_1 'text_2"
                          },
                          {
                            title: '"text_1 \\"text_2"',
                            code: 'print "text_1 \\"text_2"',
                            output: 'text_1 "text_2'
                          },
                          {
                            title: '"text_1 »text_2"',
                            code: 'print "text_1 »text_2"',
                            output: 'text_1 »text_2'
                          },
                          {
                            title: '"text_1 «text_2"',
                            code: 'print "text_1 «text_2"',
                            output: 'text_1 «text_2'
                          }
                        ]
                      },
                      {
                        group: 'double scope',
                        sources: [
                          {
                            title: '"text_1 \'text_2\' text_3"',
                            code: 'print "text_1 \'text_2\' text_3"',
                            output: "text_1 'text_2' text_3"
                          },
                          {
                            title: '"text_1 \\"text_2\\" text_3"',
                            code: 'print "text_1 \\"text_2\\" text_3"',
                            output: 'text_1 "text_2" text_3'
                          },
                          {
                            title: '"text_1 »text_2» text_3"',
                            code: 'print "text_1 »text_2» text_3"',
                            output: 'text_1 »text_2» text_3'
                          },
                          {
                            title: '"text_1 «text_2« text_3"',
                            code: 'print "text_1 «text_2« text_3"',
                            output: 'text_1 «text_2« text_3'
                          },
                          {
                            title: '"text_1 «text_2» text_3"',
                            code: 'print "text_1 «text_2» text_3"',
                            output: 'text_1 «text_2» text_3'
                          }
                        ]
                      }
                    ]
                  },
                  {
                    group: "'inner scopes'",
                    sources: [
                      {
                        group: 'single scope',
                        sources: [
                          {
                            title: "'text_1 \\'text_2'",
                            code: "print 'text_1 \\'text_2'",
                            output: "text_1 'text_2"
                          },
                          {
                            title: "'text_1 \"text_2'",
                            code: "print 'text_1 \\\"text_2'",
                            output: 'text_1 "text_2'
                          },
                          {
                            title: "'text_1 »text_2'",
                            code: "print 'text_1 »text_2'",
                            output: 'text_1 »text_2'
                          },
                          {
                            title: "'text_1 «text_2'",
                            code: "print 'text_1 «text_2'",
                            output: 'text_1 «text_2'
                          }
                        ]
                      },
                      {
                        group: 'double scope',
                        sources: [
                          {
                            title: "'text_1 \\'text_2\\' text_3'",
                            code: "print 'text_1 \\'text_2\\' text_3'",
                            output: "text_1 'text_2' text_3"
                          },
                          {
                            title: '\'text_1 "text_2" text_3\'',
                            code: 'print \'text_1 "text_2" text_3\'',
                            output: 'text_1 "text_2" text_3'
                          },
                          {
                            title: "'text_1 »text_2» text_3'",
                            code: "print 'text_1 »text_2» text_3'",
                            output: 'text_1 »text_2» text_3'
                          },
                          {
                            title: "'text_1 «text_2« text_3'",
                            code: "print 'text_1 «text_2« text_3'",
                            output: 'text_1 «text_2« text_3'
                          },
                          {
                            title: "'text_1 «text_2» text_3'",
                            code: "print 'text_1 «text_2» text_3'",
                            output: 'text_1 «text_2» text_3'
                          }
                        ]
                      }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        group: 'input',
        sources: [
          {
            title: 'variable',
            code: 'input X',
            inputs: [617]
          },
          {
            title: '2 variables',
            code: 'input X\ninput Y',
            inputs: [617, 2]
          },
          {
            title: 'text input',
            code: 'input անուն',
            inputs: ['Ջոն']
          }
        ]
      },
      {
        group: 'output; input',
        sources: [
          {
            title: 'variable',
            code: 'input X\nprint X',
            inputs: [617],
            output: '617'
          },
          {
            title: '2 variables',
            code: 'input X\ninput Y\nprint X * Y',
            inputs: [617, 2],
            output: '1234'
          }
        ]
      },
      {
        group: 'output; operations',
        sources: [
          {
            group: 'numbers',
            sources: [
              {
                group: 'types',
                sources: [
                  {
                    title: '*',
                    code: 'print 617 * 2',
                    output: '1234'
                  },
                  {
                    title: '/',
                    code: 'print 1234 / 2',
                    output: '617'
                  },
                  {
                    title: '+',
                    code: 'print 617 + 617',
                    output: '1234'
                  },
                  {
                    title: '-',
                    code: 'print 1234 - 617',
                    output: '617'
                  }
                ]
              },
              {
                title: 'output: multiple operations',
                code: 'print 1 + 2 * 3 - 4',
                output: '3'
              },
              {
                title: 'output: multiple operations; scopes',
                code: 'print (1 + 2) * (3 - 4)',
                output: '-3'
              }
            ]
          },
          {
            title: 'texts',
            code: 'print «lambs: » + "empty"',
            output: 'lambs: empty'
          },
          {
            title: 'variables',
            code: 'Y = 2\nX = 617\nprint Y * X',
            output: '1234'
          },
          {
            title: 'number and text',
            code: 'print «lambs: » + 617',
            output: 'lambs: 617'
          },
          {
            title: 'variable and text',
            code: 'X = 617\nprint «lambs: » + X',
            output: 'lambs: 617'
          },
          {
            title: 'variable and number',
            code: 'X = 617\nprint 2 * X',
            output: '1234'
          }
        ]
      },
      {
        group: 'comments',
        sources: [
          {
            title: 'comments: single',
            code: '# comment comment comment'
          },
          {
            title: 'comments: double',
            code: '# comment\n# comment'
          },
          {
            title: 'comments: multiple',
            code: '# comment\n# comment\n# comment'
          }
        ]
      },
      {
        group: 'output; comments',
        sources: [
          {
            title: 'comment in new line and output',
            code: '# comment\nprint 123',
            output: '123'
          },
          {
            title: 'comment in the same line with output',
            code: 'print 123 # 123',
            output: '123'
          },
          {
            title: '2 outputs which first was commented',
            code: '# output 123\nprint 321',
            output: '321'
          }
        ]
      },
      {
        group: 'conditions',
        sources: [
          {
            title: 'if: with tail',
            code: 'if 4 > 2 then\n    print «4 > 2»',
            output: '4 > 2'
          },
          {
            title: 'if: without tail',
            code: 'if 4 > 2\n    print «4 > 2»',
            output: '4 > 2'
          },
          {
            title: 'if: wrong result',
            code: 'if 4 > 6\n    print «4 > 6»'
          },
          {
            title: 'if: consecutive: 2',
            code: 'if 4 > 2\n    print «a»\nif 4 > 2\n    print «b»',
            output: 'a\nb'
          },
          {
            title: 'if: consecutive: 3',
            code: 'if 4 > 2\n    print «a»\nif 4 > 2\n    print «b»\nif 4 > 2\n    print «c»',
            output: 'a\nb\nc'
          },
          {
            title: 'if: content: consecutive: 2',
            code: 'if 4 > 2\n    print «a»\n    print «b»',
            output: 'a\nb'
          },
          {
            title: 'if: content: consecutive: 3',
            code: 'if 4 > 2\n    print «a»\n    print «b»\n    print «c»',
            output: 'a\nb\nc'
          },
          {
            title: 'if-else: right answer',
            code: 'if 4 > 2\n    print «4 > 2»\nelse\n    print «2 >= 4»',
            output: '4 > 2'
          },
          {
            title: 'if-else: wrong answer',
            code: 'if 4 > 6\n    print «4 > 6»\nelse\n    print «6 >= 4»',
            output: '6 >= 4'
          },
          {
            group: 'else-if-else',
            sources: [
              {
                title: 'true: 1st condition',
                code: 'if 4 > 2\n    print «4 > 2»\nelse if 4 > 6\n    print «4 > 6»\nelse\n    print «4 == 4»',
                output: '4 > 2'
              },
              {
                title: 'true: 2st condition',
                code: 'if 4 > 6\n    print «4 > 6»\nelse if 4 > 2\n    print «4 > 2»\nelse\n    print «4 == 4»',
                output: '4 > 2'
              },
              {
                title: 'true: 3st condition',
                code: 'if 4 > 6\n    print «4 > 6»\nelse if 4 == 2\n    print «4 == 4»\nelse\n    print «4 > 2»',
                output: '4 > 2'
              }
            ]
          },
          {
            group: 'recursively: 1 level: if',
            sources: [
              {
                title: 'if (true): if (true): output',
                code: 'if 4 > 2\n    if 4 > 2\n    print "xD"',
                output: 'xD'
              },
              {
                title: 'if (true): output, if (true): output',
                code: 'if 4 > 2\n    print "a"\n    if 4 > 2\n        print "b"',
                output: 'a\nb'
              },
              {
                title: 'if (true): output, if (false): output',
                code: 'if 4 > 2\n    print "a"\n    if 4 < 2\n        print "b"',
                output: 'a'
              },
              {
                title: 'if (true): if (false): output',
                code: 'if 4 > 2\n    if 4 < 2\n        print "xD"'
              },
              {
                title: 'if (false): if (true): output',
                code: 'if 4 < 2\n    if 4 > 2\n        print "xD"'
              }
            ]
          }
        ]
      },
      {
        group: 'output; boolean',
        sources: [
          {
            group: 'operators',
            sources: [
              {
                group: 'condition',
                sources: [
                  {
                    title: '>',
                    code: 'print 4 > 2',
                    output: 'true'
                  },
                  {
                    title: '<',
                    code: 'print 2 < 4',
                    output: 'true'
                  },
                  {
                    title: '==',
                    code: 'print 4 == 4',
                    output: 'true'
                  },
                  {
                    title: '>=',
                    code: 'print 4 >= 2',
                    output: 'true'
                  },
                  {
                    title: '<=',
                    code: 'print 2 <= 4',
                    output: 'true'
                  },
                  {
                    title: '!=',
                    code: 'print 4 != 2',
                    output: 'true'
                  },
                  {
                    title: 'not()',
                    code: 'print not(4 < 2)',
                    output: 'true'
                  }
                ]
              },
              {
                group: 'boolean',
                sources: [
                  {
                    title: 'AND: true result',
                    code: 'print 4 > 2 and 4 != 2',
                    output: 'true'
                  },
                  {
                    title: 'AND: false result',
                    code: 'print 4 > 2 and 4 == 2',
                    output: 'false'
                  },
                  {
                    title: 'OR: true result',
                    code: 'print 4 > 2 or 4 == 2',
                    output: 'true'
                  },
                  {
                    title: 'OR: false result',
                    code: 'print 4 < 2 or 4 == 2',
                    output: 'false'
                  }
                ]
              }
            ]
          },
          {
            title: 'true value',
            code: 'print true',
            output: 'true'
          },
          {
            title: 'false value',
            code: 'print false',
            output: 'false'
          },
          {
            title: 'true condition',
            code: 'print 4 > 2',
            output: 'true'
          },
          {
            title: 'false condition',
            code: 'print 4 < 2',
            output: 'false'
          },
          {
            title: 'and: result: true',
            code: 'print true and true',
            output: 'true'
          },
          {
            title: 'and։ result: false',
            code: 'print true and false',
            output: 'false'
          },
          {
            title: 'or։ result: true',
            code: 'print true or false',
            output: 'true'
          },
          {
            title: 'or։ result: false',
            code: 'print false or false',
            output: 'false'
          },
          {
            title: 'mixed',
            code: 'print 5 < 1 and (1 < 7 or (1 >= 3 or 9 == 9))',
            output: 'false'
          }
        ]
      },
      {
        group: 'loops',
        sources: [
          {
            group: 'while-do',
            sources: [
              {
                title: '5 attempts',
                code: 'a = 0\nwhile a < 5\n    print a\n    a = a + 1',
                output: '0\n1\n2\n3\n4'
              },
              {
                title: '4 attempts: {if: true}',
                code: 'b = 1\nwhile b < 4\n    if b == 2\n        print "asdasd"\n    b = b + 1',
                output: 'asdasd'
              },
              {
                title: '0 attempts',
                code: 'a = 0\nwhile a > 5\n    print a\n    a = a + 1'
              }
            ]
          },
          {
            group: 'do-while',
            sources: [
              {
                title: '5 attempts',
                code: 'a = 0\ndo\n    print a\n    a = a + 1\nwhile a < 5',
                output: '0\n1\n2\n3\n4'
              },
              {
                title: '1 attempt',
                code: 'a = 0\ndo\n    print a\n    a = a + 1\nwhile a > 5',
                output: '0'
              },
              {
                title: 'do-while {output; input}; do-while {output; input}; output',
                code: 'do\n    print "Մուտքագրեք գաղտնանունը՝"\n    input գաղտնանուն\nwhile գաղտնանուն != "root"\n\ndo\n    print "Մուտքագրեք գաղտնաբառը՝"\n    input գաղտնաբառ\nwhile գաղտնաբառ != "toor"\n\nprint "Դուք հաջողությամբ input եք գործել ։)"',
                inputs: ['root', 'toor'],
                output: 'Մուտքագրեք գաղտնանունը՝\nՄուտքագրեք գաղտնաբառը՝\nԴուք հաջողությամբ input եք գործել ։)'
              },
              {
                title: 'do-while {output; input}; do-while {output; input}; output (first input error)',
                code: 'do\n    print "Մուտքագրեք գաղտնանունը՝"\n    input գաղտնանուն\nwhile գաղտնանուն != "root"\n\ndo\n    print "Մուտքագրեք գաղտնաբառը՝"\n    input գաղտնաբառ\nwhile գաղտնաբառ != "toor"\n\nprint "Դուք հաջողությամբ input եք գործել ։)"',
                inputs: ['login', 'root', 'toor'],
                output:
                  'Մուտքագրեք գաղտնանունը՝\nՄուտքագրեք գաղտնանունը՝\nՄուտքագրեք գաղտնաբառը՝\nԴուք հաջողությամբ input եք գործել ։)'
              }
            ]
          },
          {
            group: 'repeat',
            sources: [
              {
                title: 'repeat 0x',
                code: 'repeat 0 times\n    print "a"'
              },
              {
                title: 'repeat 1x',
                code: 'repeat 1 times\n    print "a"',
                output: 'a'
              },
              {
                title: 'repeat 5x',
                code: 'repeat 5 times\n    print "a"',
                output: 'a\na\na\na\na'
              },
              {
                title: 'input; repeat 2x',
                code: 'input X\nrepeat 2 times\n    print X',
                inputs: ['a'],
                output: 'a\na'
              },
              {
                title: 'repeat 2x; input;',
                code: 'repeat 2 times\n    print "a"\ninput X\nprint X',
                inputs: ['X'],
                output: 'a\na\nX'
              },
              {
                title: 'repeat 2x; repeat 3x;',
                code: 'repeat 2 times\n    print "a"\nrepeat 3 times\n    print "b"',
                output: 'a\na\nb\nb\nb'
              },
              {
                title: 'repeat 2x; input',
                code: 'repeat 2 times\n    print "a"\ninput X',
                inputs: ['X'],
                output: 'a\na'
              },
              {
                title: 'repeat 2x; input; output',
                code: 'repeat 2 times\n    print "a"\ninput X\nprint X',
                inputs: ['X'],
                output: 'a\na\nX'
              },
              {
                title: 'repeat 1x {input; output}',
                code: 'repeat 1 times\n    input N\n    print N',
                inputs: [617],
                output: '617'
              },
              {
                title: 'repeat 5x {input; output}',
                code: 'repeat 5 times\n    input N\n    print N',
                inputs: [617, 2, 1, 2, 3],
                output: '617\n2\n1\n2\n3'
              },
              {
                title: 'repeat 5x {input}',
                code: 'repeat 5 times\n    input N',
                inputs: [617, 2, 1, 2, 3]
              },
              {
                group: 'recursively: 1 level: repeat',
                sources: [
                  {
                    title: '0x1 attempts',
                    code: 'repeat 0 times\n    repeat 1 times\n        print "a"'
                  },
                  {
                    title: '1x1 attempts',
                    code: 'repeat 1 times\n    repeat 1 times\n        print "a"',
                    output: 'a'
                  },
                  {
                    title: '1x0 attempts',
                    code: 'repeat 1 times\n    repeat 0 times\n        print "a"'
                  },
                  {
                    title: '1x2 attempts',
                    code: 'repeat 1 times\n    repeat 2 times\n        print "a"',
                    output: 'a\na'
                  },
                  {
                    title: '2x1 attempts',
                    code: 'repeat 2 times\n    repeat 1 times\n        print "a"',
                    output: 'a\na'
                  },
                  {
                    title: '2x0 attempts',
                    code: 'repeat 2 times\n    repeat 0 times\n        print "a"'
                  }
                ]
              },
              {
                group: 'recursively: 2 level: repeat',
                sources: [
                  {
                    title: '1x1x1 attempts',
                    code: 'repeat 1 times\n    repeat 1 times\n        repeat 1 times\n            print "a"',
                    output: 'a'
                  },
                  {
                    title: '1x2x3 attempts',
                    code: 'repeat 1 times\n    repeat 2 times\n        repeat 3 times\n            print "a"',
                    output: 'a\na\na\na\na\na'
                  },
                  {
                    title: '3x2x1 attempts',
                    code: 'repeat 1 times\n    repeat 2 times\n        repeat 3 times\n            print "a"',
                    output: 'a\na\na\na\na\na'
                  },
                  {
                    title: '3x2x1 attempts with complexity (outputs)',
                    code: 'repeat 1 times\n    print "X"\n    repeat 2 times\n        print "Y"\n        repeat 3 times\n            print "a"\nprint "Z"',
                    output: 'X\nY\na\na\na\nY\na\na\na\nZ'
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        group: 'math',
        sources: [
          {
            title: 'pow',
            code: 'X = 2\nY = 5\nZ = power(X,Y)\nprint Z',
            output: '32'
          },
          {
            title: 'sqrt',
            code: 'X = 9\nZ = square_root(X)\nprint Z',
            output: '3'
          },
          {
            title: 'sqr',
            code: 'X = 9\nZ = square(X)\nprint Z',
            output: '81'
          },
          {
            title: 'round',
            code: 'X = 2.5\nZ = round(X)\nprint Z',
            output: '3'
          },
          {
            title: 'floor',
            code: 'X = 3.5\nZ = floor(X)\nprint Z',
            output: '3'
          },
          {
            title: 'log',
            code: 'X = 2\nY = 64\nZ = log(X,Y)\nprint Z',
            output: '6'
          },
          {
            title: 'lg',
            code: 'X = 1000\nZ = lg(X)\nprint Z',
            output: '3'
          },
          {
            title: 'ln',
            code: 'X = 5\nZ = ln(5)\nprint Z',
            output: '1.60943791243'
          },
          {
            title: 'ceil',
            code: 'X = 3.4\nZ = ceil(X)\nprint Z',
            output: '4'
          },
          {
            title: 'abs',
            code: 'X = -5\nZ = absolute_value(X)\nprint Z',
            output: '5'
          },
          {
            title: 'sin',
            code: 'X = 1\nZ = sin(X)\nprint Z',
            output: '0.841470984808'
          },
          {
            title: 'cos',
            code: 'X = 1\nZ = cos(X)\nprint Z',
            output: '0.540302305868'
          },
          {
            title: 'tan',
            code: 'X = 1\nZ = tan(X)\nprint Z',
            output: '1.55740772465'
          },
          {
            title: 'ctg',
            code: 'X = 1\nZ = cot(X)\nprint Z',
            output: '0.642092615934'
          },
          {
            title: 'arcsin',
            code: 'X = 1\nZ = arcsin(X)\nprint Z',
            output: '1.57079632679'
          },
          {
            title: 'arccos',
            code: 'X = 0.5\nZ = arccos(X)\nprint Z',
            output: '1.0471975512'
          },
          {
            title: 'arctan',
            code: 'X = 1\nZ = arctan(X)\nprint Z',
            output: '0.785398163397'
          },
          {
            title: 'arcctg',
            code: 'X = 0.5\nZ = arccot(X)\nprint Z',
            output: '1.10714871779'
          },
          {
            title: 'random: single argument',
            code: 'X = 1000\nZ = random(X)\nprint Z >= 0 and Z <= 1000',
            output: 'true'
          },
          {
            title: 'random: double argument',
            code: 'X = 1000\nY = 1005\nZ = random(X,Y)\nprint Z >= 1000 and Z <= 1005',
            output: 'true'
          },
          {
            title: 'pi',
            code: 'print pi',
            output: '3.14159265359'
          },
          {
            title: 'e',
            code: 'print e',
            output: '2.71828182846'
          }
        ]
      }
    ]
  }
];

export default sources;
