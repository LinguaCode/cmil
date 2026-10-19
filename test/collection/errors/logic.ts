import type {Source} from '../types.ts';

const sources: Source[] = [
  {
    group: 'logic',
    sources: [
      {
        title: 'undefined variable',
        code: 'output X',
        errorId: 'undefinedVariable',
        errorParam: {
          variable: 'x',
          line: 1
        }
      },
      {
        title: 'output before an error',
        code: 'output 1\noutput X',
        errorId: 'undefinedVariable',
        errorParam: {
          variable: 'x',
          line: 2
        },
        output: '1'
      },
      {
        title: 'undefined variable in a block',
        code: 'x = 1\nif x == 1\n    output y',
        errorId: 'undefinedVariable',
        errorParam: {
          variable: 'y',
          line: 3
        }
      },
      {
        title: 'too long text',
        code: 'x = "ab"\nwhile 1 < 2\n    x = x + x',
        errorId: 'memoryLimit',
        errorParam: {
          line: 3
        }
      },
      {
        title: 'Big loop: overload',
        code: 'repeat 100000 times\n    output 1010101010',
        errorId: 'timeout'
      },
      {
        title: 'Infinity loop',
        code: 'while 1 < 4\n    output 123',
        errorId: 'timeout'
      }
    ]
  }
];

export default sources;
