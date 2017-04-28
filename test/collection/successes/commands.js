module.exports = [{
  group: 'commands',
  sources: [{
    group: 'etc',
    sources: [{
      title: 'empty',
    }, {
      title: '"" + 1',
      code: 'ելք("" + 1)',
      output: '1'
    }]
  }, {
    group: 'output',
    sources: [{
      title: 'output: «text»',
      code: 'ելք(«բարեւ»)',
      output: 'բարեւ'
    }, {
      title: 'output: "text"',
      code: 'ելք("բարեւ")',
      output: 'բարեւ'
    }, {
      title: 'output: \'text\'',
      code: 'ելք(\'բարեւ\')',
      output: 'բարեւ'
    }, {
      title: '2 outputs',
      code: 'ելք(«բարեւ»)\nելք(«աշխարհ»)',
      output: 'բարեւ\nաշխարհ'
    }, {
      title: 'output: case insensitivity',
      code: 'ելք(«բարեւ»)',
      output: 'բարեւ'
    }, {
      title: 'output: number',
      code: 'ելք(666)',
      output: '666'
    }, {
      title: 'output: variable',
      code: 'X = 125\nելք(X)',
      output: '125'
    }, {
      title: 'output: variable: case insensitivity',
      code: 'X = 125\nելք(X)',
      output: '125'
    }, {
      group: 'quotes in quotes',
      sources: [{
        title: '\'text»\'',
        code: 'ելք(\'տեքստ»\')',
        output: 'տեքստ»'
      }, {
        title: '"text»"',
        code: 'ելք("տեքստ»")',
        output: 'տեքստ»'
      }, {
        title: '\'«text»\'',
        code: 'ելք(\'«տեքստ»\')',
        output: '«տեքստ»'
      }, {
        title: '"«text»"',
        code: 'ելք("«տեքստ»")',
        output: '«տեքստ»'
      }, {
        group: 'inner scopes',
        sources: [{
          group: '«inner scopes»',
          sources: [{
            group: 'single scope',
            sources: [{
              title: '«text_1 \'text_2»',
              code: 'ելք(«text_1 \'text_2»)',
              output: 'text_1 \'text_2'
            }, {
              title: '«text_1 "text_2»',
              code: 'ելք(«text_1 "text_2»)',
              output: 'text_1 "text_2'
            }, {
              title: '«text_1 \\»text_2»',
              code: 'ելք(«text_1 \\»text_2»)',
              output: 'text_1 »text_2'
            }, {
              title: '«text_1 \\«text_2»',
              code: 'ելք(«text_1 \\«text_2»)',
              output: 'text_1 «text_2'
            }]
          }, {
            group: 'double scope',
            sources: [{
              title: '«text_1 \'text_2\' text_3»',
              code: 'ելք(«text_1 \'text_2\' text_3»)',
              output: 'text_1 \'text_2\' text_3'
            }, {
              title: '«text_1 "text_2" text_3»',
              code: 'ելք(«text_1 "text_2" text_3»)',
              output: 'text_1 "text_2" text_3'
            }, {
              title: '«text_1 \\»text_2\\» text_3»',
              code: 'ելք(«text_1 \\»text_2\\» text_3»)',
              output: 'text_1 »text_2» text_3'
            }, {
              title: '«text_1 \\«text_2\\« text_3»',
              code: 'ելք(«text_1 \\«text_2\\« text_3»)',
              output: 'text_1 «text_2« text_3'
            }, {
              title: '«text_1 \\«text_2\\» text_3»',
              code: 'ելք(«text_1 \\«text_2\\» text_3»)',
              output: 'text_1 «text_2» text_3'
            }, {
              title: '\'text_1 «text_2» «text_3» text_3\' ',
              code: 'ելք(\'text_1 «text_2» «text_3» text_3\')',
              output: 'text_1 «text_2» «text_3» text_3'
            }, {
              title: '\'text_1 «text_2» եւ «text_3» text_3\' ',
              code: 'ելք(\'text_1 «text_2» եւ «text_3» text_3\')',
              output: 'text_1 «text_2» եւ «text_3» text_3'
            }]
          }]
        }, {
          group: '"inner scopes"',
          sources: [{
            group: 'single scope',
            sources: [{
              title: '"text_1 \'text_2"',
              code: 'ելք("text_1 \'text_2")',
              output: 'text_1 \'text_2'
            }, {
              title: '"text_1 \\"text_2"',
              code: 'ելք("text_1 \\"text_2")',
              output: 'text_1 "text_2'
            }, {
              title: '"text_1 »text_2"',
              code: 'ելք("text_1 »text_2")',
              output: 'text_1 »text_2'
            }, {
              title: '"text_1 «text_2"',
              code: 'ելք("text_1 «text_2")',
              output: 'text_1 «text_2'
            }]
          }, {
            group: 'double scope',
            sources: [{
              title: '"text_1 \'text_2\' text_3"',
              code: 'ելք("text_1 \'text_2\' text_3")',
              output: 'text_1 \'text_2\' text_3'
            }, {
              title: '"text_1 \\"text_2\\" text_3"',
              code: 'ելք("text_1 \\"text_2\\" text_3")',
              output: 'text_1 "text_2" text_3'
            }, {
              title: '"text_1 »text_2» text_3"',
              code: 'ելք("text_1 »text_2» text_3")',
              output: 'text_1 »text_2» text_3'
            }, {
              title: '"text_1 «text_2« text_3"',
              code: 'ելք("text_1 «text_2« text_3")',
              output: 'text_1 «text_2« text_3'
            }, {
              title: '"text_1 «text_2» text_3"',
              code: 'ելք("text_1 «text_2» text_3")',
              output: 'text_1 «text_2» text_3'
            }]
          }]
        }, {
          group: '\'inner scopes\'',
          sources: [{
            group: 'single scope',
            sources: [{
              title: '\'text_1 \\\'text_2\'',
              code: 'ելք(\'text_1 \\\'text_2\')',
              output: 'text_1 \'text_2'
            }, {
              title: '\'text_1 "text_2\'',
              code: 'ելք(\'text_1 \\"text_2\')',
              output: 'text_1 "text_2'
            }, {
              title: '\'text_1 »text_2\'',
              code: 'ելք(\'text_1 »text_2\')',
              output: 'text_1 »text_2'
            }, {
              title: '\'text_1 «text_2\'',
              code: 'ելք(\'text_1 «text_2\')',
              output: 'text_1 «text_2'
            }]
          }, {
            group: 'double scope',
            sources: [{
              title: '\'text_1 \\\'text_2\\\' text_3\'',
              code: 'ելք(\'text_1 \\\'text_2\\\' text_3\')',
              output: 'text_1 \'text_2\' text_3'
            }, {
              title: '\'text_1 "text_2" text_3\'',
              code: 'ելք(\'text_1 "text_2" text_3\')',
              output: 'text_1 "text_2" text_3'
            }, {
              title: '\'text_1 »text_2» text_3\'',
              code: 'ելք(\'text_1 »text_2» text_3\')',
              output: 'text_1 »text_2» text_3'
            }, {
              title: '\'text_1 «text_2« text_3\'',
              code: 'ելք(\'text_1 «text_2« text_3\')',
              output: 'text_1 «text_2« text_3'
            }, {
              title: '\'text_1 «text_2» text_3\'',
              code: 'ելք(\'text_1 «text_2» text_3\')',
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
      code: 'մուտք(X)',
      inputs: [617]
    }, {
      title: '2 variables',
      code: 'մուտք(X)\nմուտք(Y)',
      inputs: [617, 2]
    }, {
      title: 'text input',
      code: 'մուտք(անուն)',
      inputs: ["Ջոն"]
    }]
  }, {
    group: 'output; input',
    sources: [{
      title: 'variable',
      code: 'մուտք(X)\nելք(X)',
      inputs: [617],
      output: '617'
    }, {
      title: '2 variables',
      code: 'մուտք(X)\nմուտք(Y)\nելք(X * Y)',
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
          code: 'ելք(617 * 2)',
          output: '1234'
        }, {
          title: '/',
          code: 'ելք(1234 / 2)',
          output: '617'
        }, {
          title: '+',
          code: 'ելք(617 + 617)',
          output: '1234'
        }, {
          title: '-',
          code: 'ելք(1234 - 617)',
          output: '617'
        }]
      }, {
        title: 'output: multiple operations',
        code: 'ելք(1 + 2 * 3 - 4)',
        output: '3'
      }, {
        title: 'output: multiple operations; scopes',
        code: 'ելք((1 + 2) * (3 - 4))',
        output: '-3'
      }]
    }, {
      title: 'texts',
      code: 'ելք(«lambs: » + "empty")',
      output: 'lambs: empty'
    }, {
      title: 'variables',
      code: 'Y = 2\nX = 617\nելք(Y * X)',
      output: '1234'
    }, {
      title: 'number and text',
      code: 'ելք(«lambs: » + 617)',
      output: 'lambs: 617'
    }, {
      title: 'variable and text',
      code: 'X = 617\nելք(«lambs: » + X)',
      output: 'lambs: 617'
    }, {
      title: 'variable and number',
      code: 'X = 617\nելք(2 * X)',
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
      code: '# comment\nելք(123)',
      output: '123'
    }, {
      title: 'comment in the same line with output',
      code: 'ելք(123) # 123',
      output: '123'
    }, {
      title: '2 outputs which first was commented',
      code: '# ելք(123\nելք(321)',
      output: '321'
    }]
  }, {
    group: 'conditions',
    sources: [{
      title: 'if: with tail',
      code: 'եթե 4 > 2 ապա\n    ելք(«4 > 2»)',
      output: '4 > 2'
    }, {
      title: 'if: without tail',
      code: 'եթե 4 > 2\n    ելք(«4 > 2»)',
      output: '4 > 2'
    }, {
      title: 'if: wrong result',
      code: 'եթե 4 > 6\n    ելք(«4 > 6»)'
    }, {
      title: 'if: consecutive: 2',
      code: 'եթե 4 > 2\n    ելք(«a»)\nեթե 4 > 2\n    ելք(«b»)',
      output: 'a\nb'
    }, {
      title: 'if: consecutive: 3',
      code: 'եթե 4 > 2\n    ելք(«a»)\nեթե 4 > 2\n    ելք(«b»)\nեթե 4 > 2\n    ելք(«c»)',
      output: 'a\nb\nc'
    }, {
      title: 'if: content: consecutive: 2',
      code: 'եթե 4 > 2\n    ելք(«a»)\n    ելք(«b»)',
      output: 'a\nb'
    }, {
      title: 'if: content: consecutive: 3',
      code: 'եթե 4 > 2\n    ելք(«a»)\n    ելք(«b»)\n    ելք(«c»)',
      output: 'a\nb\nc'
    }, {
      title: 'if-else: right answer',
      code: 'եթե 4 > 2\n    ելք(«4 > 2»)\nայլապես\n    ելք(«2 >= 4»)',
      output: '4 > 2'
    }, {
      title: 'if-else: wrong answer',
      code: 'եթե 4 > 6\n    ելք(«4 > 6»)\nայլապես\n    ելք(«6 >= 4»)',
      output: '6 >= 4'
    }, {
      group: 'else-if-else',
      sources: [{
        title: 'true: 1st condition',
        code: 'եթե 4 > 2\n    ելք(«4 > 2»)\nայլապես եթե 4 > 6\n    ելք(«4 > 6»)\nայլապես\n    ելք(«4 == 4»)',
        output: '4 > 2'
      }, {
        title: 'true: 2st condition',
        code: 'եթե 4 > 6\n    ելք(«4 > 6»)\nայլապես եթե 4 > 2\n    ելք(«4 > 2»)\nայլապես\n    ելք(«4 == 4»)',
        output: '4 > 2'
      }, {
        title: 'true: 3st condition',
        code: 'եթե 4 > 6\n    ելք(«4 > 6»)\nայլապես եթե 4 == 2\n    ելք(«4 == 4»)\nայլապես\n    ելք(«4 > 2»)',
        output: '4 > 2'
      }]
    }, {
      group: 'recursively: 1 level: if',
      sources: [{
        title: 'if (true): if (true): output',
        code: 'եթե 4 > 2\n    եթե 4 > 2\n    ելք("xD")',
        output: 'xD'
      }, {
        title: 'if (true): output, if (true): output',
        code: 'եթե 4 > 2\n    ելք("a")\n    եթե 4 > 2\n        ելք("b")',
        output: 'a\nb'
      }, {
        title: 'if (true): output, if (false): output',
        code: 'եթե 4 > 2\n    ելք("a")\n    եթե 4 < 2\n        ելք("b")',
        output: 'a'
      }, {
        title: 'if (true): if (false): output',
        code: 'եթե 4 > 2\n    եթե 4 < 2\n        ելք("xD")'
      }, {
        title: 'if (false): if (true): output',
        code: 'եթե 4 < 2\n    եթե 4 > 2\n        ելք("xD")'
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
          code: 'ելք(4 > 2)',
          output: '${true}'
        }, {
          title: '<',
          code: 'ելք(2 < 4)',
          output: '${true}'
        }, {
          title: '==',
          code: 'ելք(4 == 4)',
          output: '${true}'
        }, {
          title: '>=',
          code: 'ելք(4 >= 2)',
          output: '${true}'
        }, {
          title: '<=',
          code: 'ելք(2 <= 4)',
          output: '${true}'
        }, {
          title: '!=',
          code: 'ելք(4 != 2)',
          output: '${true}'
        }, {
          title: 'not()',
          code: 'ելք(ոչ(4 < 2))',
          output: '${true}'
        }]
      }, {
        group: 'boolean',
        sources: [{
          title: 'AND: true result',
          code: 'ելք(4 > 2 և 4 != 2)',
          output: '${true}'
        }, {
          title: 'AND: false result',
          code: 'ելք(4 > 2 և 4 == 2)',
          output: '${false}'
        }, {
          title: 'OR: true result',
          code: 'ելք(4 > 2 կամ 4 == 2)',
          output: '${true}'
        }, {
          title: 'OR: false result',
          code: 'ելք(4 < 2 կամ 4 == 2)',
          output: '${false}'
        }]
      }]
    }, {
      title: 'true value',
      code: 'ելք(ճիշտ)',
      output: '${true}'
    }, {
      title: 'false value',
      code: 'ելք(սխալ)',
      output: '${false}'
    }, {
      title: 'true condition',
      code: 'ելք(4 > 2)',
      output: '${true}'
    }, {
      title: 'false condition',
      code: 'ելք(4 < 2)',
      output: '${false}'
    }, {
      title: 'and: result: true',
      code: 'ելք(ճիշտ և ճիշտ)',
      output: '${true}'
    }, {
      title: 'and։ result: false',
      code: 'ելք(ճիշտ և սխալ)',
      output: '${false}'
    }, {
      title: 'or։ result: true',
      code: 'ելք(ճիշտ կամ սխալ)',
      output: '${true}'
    }, {
      title: 'or։ result: false',
      code: 'ելք(սխալ կամ սխալ)',
      output: '${false}'
    }, {
      title: 'mixed',
      code: 'ելք(5 < 1 և (1 < 7 կամ (1 >= 3 կամ 9 == 9)))',
      output: '${false}'
    }]
  }, {
    group: 'loops',
    sources: [{
      group: 'while-do',
      sources: [{
        title: '5 attempts',
        code: 'a = 0\nմինչ a < 5\n    ելք(a)\n    a = a + 1',
        output: '0\n1\n2\n3\n4'
      }, {
        title: '4 attempts: {if: true}',
        code: 'b = 1\nմինչ b < 4\n    եթե b == 2\n        ելք("asdasd")\n    b = b + 1',
        output: 'asdasd'
      }, {
        title: '0 attempts',
        code: 'a = 0\nմինչ a > 5\n    ելք(a)\n    a = a + 1'
      }]
    }, {
      group: 'do-while',
      sources: [{
        title: '5 attempts',
        code: 'a = 0\nկատարել\n    ելք(a)\n    a = a + 1\nմինչ a < 5',
        output: '0\n1\n2\n3\n4'
      }, {
        title: '1 attempt',
        code: 'a = 0\nկատարել\n    ելք(a)\n    a = a + 1\nմինչ a > 5',
        output: '0'
      }, {
        title: 'do-while {output; input}; do-while {output; input}; output',
        code: 'կատարել\n    ելք("Մուտքագրեք գաղտնանունը՝")\n    մուտք(գաղտնանուն)\nմինչ գաղտնանուն != "root"\n\nկատարել\n    ելք("Մուտքագրեք գաղտնաբառը՝")\n    մուտք(գաղտնաբառ)\nմինչ գաղտնաբառ != "toor"\n\nելք("Դուք հաջողությամբ մուտք եք գործել ։)")',
        inputs: ['root', 'toor'],
        output: 'Մուտքագրեք գաղտնանունը՝\nՄուտքագրեք գաղտնաբառը՝\nԴուք հաջողությամբ մուտք եք գործել ։)',
      }, {
        title: 'do-while {output; input}; do-while {output; input}; output (first input error)',
        code: 'կատարել\n    ելք("Մուտքագրեք գաղտնանունը՝")\n    մուտք(գաղտնանուն)\nմինչ գաղտնանուն != "root"\n\nկատարել\n    ելք("Մուտքագրեք գաղտնաբառը՝")\n    մուտք(գաղտնաբառ)\nմինչ գաղտնաբառ != "toor"\n\nելք("Դուք հաջողությամբ մուտք եք գործել ։)")',
        inputs: ['login', 'root', 'toor'],
        output: 'Մուտքագրեք գաղտնանունը՝\nՄուտքագրեք գաղտնանունը՝\nՄուտքագրեք գաղտնաբառը՝\nԴուք հաջողությամբ մուտք եք գործել ։)',
      }]
    }, {
      group: 'repeat',
      sources: [{
        title: 'repeat 0x',
        code: 'կրկնել 0 անգամ\n    ելք("a")'
      }, {
        title: 'repeat 1x',
        code: 'կրկնել 1 անգամ\n    ելք("a")',
        output: 'a'
      }, {
        title: 'repeat 5x',
        code: 'կրկնել 5 անգամ\n    ելք("a")',
        output: 'a\na\na\na\na'
      }, {
        title: 'input; repeat 2x',
        code: 'մուտք(X)\nկրկնել 2 անգամ\n    ելք(X)',
        inputs: ['a'],
        output: 'a\na'
      }, {
        title: 'repeat 2x; input;',
        code: 'կրկնել 2 անգամ\n    ելք("a")\nմուտք(X)\nելք(X)',
        inputs: ['X'],
        output: 'a\na\nX'
      }, {
        title: 'repeat 2x; repeat 3x;',
        code: 'կրկնել 2 անգամ\n    ելք("a")\nկրկնել 3 անգամ\n    ելք("b")',
        output: 'a\na\nb\nb\nb'
      }, {
        title: 'repeat 2x; input',
        code: 'կրկնել 2 անգամ\n    ելք("a")\nմուտք(X)',
        inputs: ['X'],
        output: 'a\na'
      }, {
        title: 'repeat 2x; input; output',
        code: 'կրկնել 2 անգամ\n    ելք("a")\nմուտք(X)\nելք(X)',
        inputs: ['X'],
        output: 'a\na\nX'
      }, {
        title: 'repeat 1x {input; output}',
        code: 'կրկնել 1 անգամ\n    մուտք(N)\n    ելք(N)',
        inputs: [617],
        output: '617'
      }, {
        title: 'repeat 5x {input; output}',
        code: 'կրկնել 5 անգամ\n    մուտք(N)\n    ելք(N)',
        inputs: [617, 2, 1, 2, 3],
        output: '617\n2\n1\n2\n3'
      }, {
        title: 'repeat 5x {input}',
        code: 'կրկնել 5 անգամ\n    մուտք(N)',
        inputs: [617, 2, 1, 2, 3]
      }, {
        group: 'recursively: 1 level: repeat',
        sources: [{
          title: '0x1 attempts',
          code: 'կրկնել 0 անգամ\n    կրկնել 1 անգամ\n        ելք("a")'
        }, {
          title: '1x1 attempts',
          code: 'կրկնել 1 անգամ\n    կրկնել 1 անգամ\n        ելք("a")',
          output: 'a'
        }, {
          title: '1x0 attempts',
          code: 'կրկնել 1 անգամ\n    կրկնել 0 անգամ\n        ելք("a")'
        }, {
          title: '1x2 attempts',
          code: 'կրկնել 1 անգամ\n    կրկնել 2 անգամ\n        ելք("a")',
          output: 'a\na'
        }, {
          title: '2x1 attempts',
          code: 'կրկնել 2 անգամ\n    կրկնել 1 անգամ\n        ելք("a")',
          output: 'a\na'
        }, {
          title: '2x0 attempts',
          code: 'կրկնել 2 անգամ\n    կրկնել 0 անգամ\n        ելք("a")'
        }]
      }, {
        group: 'recursively: 2 level: repeat',
        sources: [{
          title: '1x1x1 attempts',
          code: 'կրկնել 1 անգամ\n    կրկնել 1 անգամ\n        կրկնել 1 անգամ\n            ելք("a")',
          output: 'a'
        }, {
          title: '1x2x3 attempts',
          code: 'կրկնել 1 անգամ\n    կրկնել 2 անգամ\n        կրկնել 3 անգամ\n            ելք("a")',
          output: 'a\na\na\na\na\na'
        }, {
          title: '3x2x1 attempts',
          code: 'կրկնել 1 անգամ\n    կրկնել 2 անգամ\n        կրկնել 3 անգամ\n            ելք("a")',
          output: 'a\na\na\na\na\na'
        }, {
          title: '3x2x1 attempts with complexity (outputs)',
          code: 'կրկնել 1 անգամ\n    ելք("X")\n    կրկնել 2 անգամ\n        ելք("Y")\n        կրկնել 3 անգամ\n            ելք("a")\nելք("Z")',
          output: 'X\nY\na\na\na\nY\na\na\na\nZ'
        }]
      }]
    }]
  }, {
    group: 'math',
    sources: [{
      title: 'pow',
      code: 'X = 2\nY = 5\nZ = աստիճան(X,Y)\nելք(Z)',
      output: '32'
    }, {
      title: 'sqrt',
      code: 'X = 9\nZ = արմատ(X)\nելք(Z)',
      output: '3'
    }, {
      title: 'sqr',
      code: 'X = 9\nZ = քառակուսի(X)\nելք(Z)',
      output: '81'
    }, {
      title: 'round',
      code: 'X = 2.5\nZ = կլորացում(X)\nելք(Z)',
      output: '3'
    }, {
      title: 'floor',
      code: 'X = 3.5\nZ = ամբողջացնել_ներքեւ(X)\nելք(Z)',
      output: '3'
    }, {
      title: 'log',
      code: 'X = 2\nY = 64\nZ = log(X,Y)\nելք(Z)',
      output: '6'
    }, {
      title: 'lg',
      code: 'X = 1000\nZ = lg(X)\nելք(Z)',
      output: '3'
    }, {
      title: 'ln',
      code: 'X = 5\nZ = ln(5)\nելք(Z)',
      output: '1.6094379124341003'
    }, {
      title: 'ceil',
      code: 'X = 3.4\nZ = ամբողջացնել_վերեւ(X)\nելք(Z)',
      output: '4'
    }, {
      title: 'abs',
      code: 'X = -5\nZ = մոդուլ(X)\nելք(Z)',
      output: '5'
    }, {
      title: 'sin',
      code: 'X = 1\nZ = sin(X)\nելք(Z)',
      output: '0.8414709848078965'
    }, {
      title: 'cos',
      code: 'X = 1\nZ = cos(X)\nելք(Z)',
      output: '0.5403023058681398'
    }, {
      title: 'tan',
      code: 'X = 1\nZ = tan(X)\nելք(Z)',
      output: '1.5574077246549023'
    }, {
      title: 'ctg',
      code: 'X = 1\nZ = ctg(X)\nելք(Z)',
      output: '0.6420926159343306'
    }, {
      title: 'arcsin',
      code: 'X = 1\nZ = arcsin(X)\nելք(Z)',
      output: '1.5707963267948966'
    }, {
      title: 'arccos',
      code: 'X = 0.5\nZ = arccos(X)\nելք(Z)',
      output: '1.0471975511965979'
    }, {
      title: 'arctan',
      code: 'X = 1\nZ = arctan(X)\nելք(Z)',
      output: '0.7853981633974483'
    }, {
      title: 'arcctg',
      code: 'X = 0.5\nZ = arcctg(X)\nելք(Z)',
      output: '1.1071487177940904'
    }, {
      title: 'random: single argument',
      code: 'X = 1000\nZ = պատահականություն(X)\nելք(Z >= 0 եւ Z <= 1000)',
      output: '${true}'
    }, {
      title: 'random: double argument',
      code: 'X = 1000\nY = 1005\nZ = պատահականություն(X,Y)\nելք(Z >= 1000 եւ Z <= 1005)',
      output: '${true}'
    }, {
      title: 'pi',
      code: 'ելք(pi)',
      output: '3.141592653589793'
    }, {
      title: 'e',
      code: 'ելք(e)',
      output: '2.718281828459045'
    }]
  }]
}];