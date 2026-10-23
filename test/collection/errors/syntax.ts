import type {Source} from '../types.ts';

const sources: Source[] = [
  {
    group: 'syntax',
    sources: [
      {
        group: 'wrong size of the indent',
        sources: [
          {
            title: 'error in 2nd line',
            code: 'if 1 < 2\n     print(617)',
            errorId: 'indentError',
            errorParam: {
              line: 2
            }
          },
          {
            title: 'error in 3rd line',
            code: 'x = 12\nif 1 < 2\n     print(617)',
            errorId: 'indentError',
            errorParam: {
              line: 3
            }
          }
        ]
      },
      {
        title: 'Syntax error',
        code: 'print(1x)',
        errorId: 'syntaxError',
        errorParam: {
          line: 1
        }
      },
      {
        title: 'Syntax error before the last line',
        code: 'print(1x)\nprint(2)',
        errorId: 'syntaxError',
        errorParam: {
          line: 1
        }
      },
      {
        title: 'Function argument scope error',
        code: 'a = square(5\nprint(a)',
        errorId: 'argumentError',
        errorParam: {
          line: 1
        }
      },
      {
        title: '= in a condition',
        code: 'x = 5\nif x = 5\n    print(1)',
        errorId: 'equalsError',
        errorParam: {
          line: 2
        }
      },
      {
        title: '= in print',
        code: 'print(1 = 1)',
        errorId: 'equalsError',
        errorParam: {
          line: 1
        }
      },
      {
        title: 'print with two values: values are joined with +',
        code: 'print("Fruits:", 3 + 5)',
        errorId: 'argumentError',
        errorParam: {
          line: 1
        }
      },
      {
        title: 'a number with a decimal comma',
        code: 'print(1)\nprint(2,5)',
        errorId: 'argumentError',
        errorParam: {
          line: 2
        }
      },
      {
        title: 'print without a value',
        code: 'print()',
        errorId: 'argumentError',
        errorParam: {
          line: 1
        }
      },
      {
        title: 'print without its parentheses',
        code: 'print "Hi"',
        errorId: 'argumentError',
        errorParam: {
          line: 1
        }
      },
      {
        title: 'a value after print',
        code: 'print("a") + "b"',
        errorId: 'syntaxError',
        errorParam: {
          line: 1
        }
      },
      {
        title: 'input with a question: it only reads',
        code: 'name = input("Your name?")',
        errorId: 'argumentError',
        errorParam: {
          line: 1
        }
      },
      {
        title: 'input without its parentheses',
        code: 'name = input',
        errorId: 'argumentError',
        errorParam: {
          line: 1
        }
      },
      {
        title: 'input before a name: its answer is stored with =',
        code: 'print(1)\ninput name',
        errorId: 'syntaxError',
        errorParam: {
          line: 2
        }
      },
      {
        title: 'input on a line of its own',
        code: 'input()',
        errorId: 'syntaxError',
        errorParam: {
          line: 1
        }
      },
      {
        title: 'for without from',
        code: 'for i to 5\n    print(i)',
        errorId: 'syntaxError',
        errorParam: {
          line: 1
        }
      },
      {
        title: 'for with step before to',
        code: 'for i from 1 step 2 to 5\n    print(i)',
        errorId: 'syntaxError',
        errorParam: {
          line: 1
        }
      }
    ]
  }
];

export default sources;
