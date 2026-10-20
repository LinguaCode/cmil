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
            code: 'if 1 < 2\n     print 617',
            errorId: 'indentError',
            errorParam: {
              line: 2
            }
          },
          {
            title: 'error in 3rd line',
            code: 'x = 12\nif 1 < 2\n     print 617',
            errorId: 'indentError',
            errorParam: {
              line: 3
            }
          }
        ]
      },
      {
        title: 'Syntax error',
        code: 'print 1x',
        errorId: 'syntaxError',
        errorParam: {
          line: 1
        }
      },
      {
        title: 'Syntax error before the last line',
        code: 'print 1x\nprint 2',
        errorId: 'syntaxError',
        errorParam: {
          line: 1
        }
      },
      {
        title: 'Function argument scope error',
        code: 'a = square(5\nprint a',
        errorId: 'argumentError',
        errorParam: {
          line: 1
        }
      },
      {
        title: '= in a condition',
        code: 'x = 5\nif x = 5\n    print 1',
        errorId: 'equalsError',
        errorParam: {
          line: 2
        }
      },
      {
        title: '= in print',
        code: 'print 1 = 1',
        errorId: 'equalsError',
        errorParam: {
          line: 1
        }
      },
      {
        title: 'input without a name',
        code: 'input "Your name?"',
        errorId: 'syntaxError',
        errorParam: {
          line: 1
        }
      }
    ]
  }
];

export default sources;
