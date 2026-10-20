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
            code: 'if 1 < 2\n     output 617',
            errorId: 'indentError',
            errorParam: {
              line: 2
            }
          },
          {
            title: 'error in 3rd line',
            code: 'x = 12\nif 1 < 2\n     output 617',
            errorId: 'indentError',
            errorParam: {
              line: 3
            }
          }
        ]
      },
      {
        title: 'Syntax error',
        code: 'output 1x',
        errorId: 'syntaxError',
        errorParam: {
          line: 1
        }
      },
      {
        title: 'Syntax error before the last line',
        code: 'output 1x\noutput 2',
        errorId: 'syntaxError',
        errorParam: {
          line: 1
        }
      },
      {
        title: 'Function argument scope error',
        code: 'a = square(5\noutput a',
        errorId: 'argumentError',
        errorParam: {
          line: 1
        }
      }
    ]
  }
];

export default sources;
